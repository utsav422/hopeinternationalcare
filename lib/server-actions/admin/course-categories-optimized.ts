'use server';

import { eq, sql, InferInsertModel } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '../../db/drizzle';
import { courseCategories } from '../../db/schema/course-categories';
import { courses } from '../../db/schema/courses';
import { requireAdmin } from '../../middleware/auth-guard';
import { logger } from '../../utils/logger';
import { 
  CourseCategoryListItem, 
  CourseCategoryWithDetails, 
  CourseCategoryQueryParams, 
  CourseCategoryCreateData, 
  CourseCategoryUpdateData, 
  CourseCategoryConstraintCheck,
  CourseCategoryBase,
} from '../../types/course-categories';
import { 
  CourseCategoryValidationError
} from '../../utils/course-categories/index';
import { 
  validateCourseCategoryData, 
  checkCourseCategoryConstraints
} from '../../utils/course-categories/index';
import { buildFilterConditions, buildWhereClause, buildOrderByClause } from '../../utils/query-utils';
import { ApiResponse } from '@/lib/types';

// Column mappings for course categories
const courseCategoryColumnMap = {
  id: courseCategories.id,
  name: courseCategories.name,
  description: courseCategories.description,
  created_at: courseCategories.created_at,
  updated_at: courseCategories.updated_at,
};

// Type for new course category
type NewCourseCategory = InferInsertModel<typeof courseCategories>;

/**
 * Error handling utility
 */
export function handleCourseCategoryError(error: unknown, operation: string): ApiResponse<never> {
  if (error instanceof CourseCategoryValidationError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details
    };
  }
  
  if (error instanceof Error) {
    logger.error(`Course Category ${operation} failed:`, { error: error.message });
    return {
      success: false,
      error: error.message,
      code: 'UNKNOWN_ERROR'
    };
  }
  
  logger.error(`Unexpected error in course category ${operation}:`, { error: String(error) });
  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
}

/**
 * Single comprehensive list function with filtering and pagination
 */
export async function adminCourseCategoryList(params: CourseCategoryQueryParams): Promise<ApiResponse<{
  data: CourseCategoryListItem[];
  total: number;
  page: number;
  pageSize: number;
}>> {
  try {
    await requireAdmin();
    
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'created_at',
      order = 'desc',
      filters = [],
      search
    } = params;
    
    const offset = (page - 1) * pageSize;
    
    // Build filter conditions
    const filterConditions = buildFilterConditions(filters, courseCategoryColumnMap);
    
    // Add search condition if provided
    if (search) {
      const searchFilter = `%${search}%`;
      filterConditions.push(
        sql`(${courseCategories.name} ILIKE ${searchFilter} OR ${courseCategories.description} ILIKE ${searchFilter})`
      );
    }
    
    const whereClause = buildWhereClause(filterConditions);
    const orderBy = buildOrderByClause(sortBy, order, courseCategoryColumnMap);
    
    // Main query with filters, pagination, and joins
    const query = db
      .select({
        id: courseCategories.id,
        name: courseCategories.name,
        description: courseCategories.description,
        created_at: courseCategories.created_at,
        updated_at: courseCategories.updated_at,
        course_count: sql<number>`count(courses.id)`,
      })
      .from(courseCategories)
      .leftJoin(courses, eq(courseCategories.id, courses.category_id))
      .groupBy(
        courseCategories.id,
        courseCategories.name,
        courseCategories.description,
        courseCategories.created_at,
        courseCategories.updated_at
      )
      .limit(pageSize)
      .offset(offset);
    
    // Apply where clause if exists
    const queryWithWhere = whereClause ? query.where(whereClause) : query;
    
    // Apply order by
    const queryWithOrder = orderBy ? queryWithWhere.orderBy(orderBy) : queryWithWhere;
    
    // Count query with same filters
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(courseCategories)
      .leftJoin(courses, eq(courseCategories.id, courses.category_id))
      .groupBy(
        courseCategories.id,
        courseCategories.name,
        courseCategories.description,
        courseCategories.created_at,
        courseCategories.updated_at
      );
    
    // Apply where clause to count query if exists
    const countQueryWithWhere = whereClause ? countQuery.where(whereClause) : countQuery;
    
    const [data, countResult] = await Promise.all([
      queryWithOrder,
      db.select({ count: sql<number>`count(*)` }).from(countQueryWithWhere.as('count_subquery'))
    ]);
    
    return { 
      success: true, 
      data: {
        data,
        total: countResult[0]?.count || 0,
        page,
        pageSize
      }
    };
  } catch (error) {
    return handleCourseCategoryError(error, 'list');
  }
}

/**
 * Single comprehensive details function with proper joins
 */
export async function adminCourseCategoryDetails(id: string): Promise<ApiResponse<CourseCategoryWithDetails>> {
  try {
    await requireAdmin();
    
    // Get course category
    const categoryResult = await db
      .select()
      .from(courseCategories)
      .where(eq(courseCategories.id, id))
      .limit(1);
    
    if (categoryResult.length === 0) {
      return {
        success: false,
        error: 'Course category not found',
        code: 'NOT_FOUND'
      };
    }
    
    const category = categoryResult[0];
    
    // Get associated courses
    const courseResult = await db
      .select()
      .from(courses)
      .where(eq(courses.category_id, id));
    
    return {
      success: true,
      data: {
        category,
        courses: courseResult
      }
    };
  } catch (error) {
    return handleCourseCategoryError(error, 'details');
  }
}

/**
 * Optimized CRUD operations with validation
 */
export async function adminCourseCategoryCreate(data: CourseCategoryCreateData): Promise<ApiResponse<CourseCategoryBase>> {
  try {
    await requireAdmin();
    
    // Validate data
    const validation = validateCourseCategoryData(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error || 'Validation failed',
        code: validation.code || 'VALIDATION_ERROR',
        details: validation.details
      };
    }
    
    const values: NewCourseCategory = {
      name: data.name,
      description: data.description,
    };
    
    const [created] = await db
      .insert(courseCategories)
      .values(values)
      .returning();
    
    revalidatePath('/admin/course-categories');
    return { success: true, data: created };
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
      return { 
        success: false, 
        error: 'A course category with this name already exists.',
        code: 'UNIQUE_CONSTRAINT_VIOLATION'
      };
    }
    
    return handleCourseCategoryError(error, 'create');
  }
}

export async function adminCourseCategoryUpdate(data: CourseCategoryUpdateData): Promise<ApiResponse<NewCourseCategory>> {
  try {
    await requireAdmin();
    
    // Validate data
    const validation = validateCourseCategoryData(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error || 'Validation failed',
        code: validation.code || 'VALIDATION_ERROR',
        details: validation.details
      };
    }
    
    const values = {
      name: data.name,
      description: data.description,
      updated_at: sql`now()`,
    };
    
    const [updated] = await db
      .update(courseCategories)
      .set(values)
      .where(eq(courseCategories.id, data.id))
      .returning();
    
    if (!updated) {
      return {
        success: false,
        error: 'Course category not found',
        code: 'NOT_FOUND'
      };
    }
    
    revalidatePath('/admin/course-categories');
    revalidatePath(`/admin/course-categories/${data.id}`);
    return { success: true, data: updated };
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
      return { 
        success: false, 
        error: 'A course category with this name already exists.',
        code: 'UNIQUE_CONSTRAINT_VIOLATION'
      };
    }
    
    return handleCourseCategoryError(error, 'update');
  }
}

export async function adminCourseCategoryDelete(id: string): Promise<ApiResponse<void>> {
  try {
    await requireAdmin();
    
    // Check constraints before deletion
    const constraints = await checkCourseCategoryConstraints(id);
    if (!constraints.canDelete) {
      return {
        success: false,
        error: `Cannot delete: referenced by ${constraints.courseCount} course(s). Update or remove those courses first.`,
        code: 'CONSTRAINT_VIOLATION',
        details: { courseCount: constraints.courseCount }
      };
    }
    
    const [deleted] = await db
      .delete(courseCategories)
      .where(eq(courseCategories.id, id))
      .returning();
    
    if (!deleted) {
      return {
        success: false,
        error: 'Course category not found',
        code: 'NOT_FOUND'
      };
    }
    
    revalidatePath('/admin/course-categories');
    return { success: true };
  } catch (error) {
    return handleCourseCategoryError(error, 'delete');
  }
}

/**
 * Business-specific operations
 */
export async function adminCourseCategoryCheckConstraints(id: string): Promise<ApiResponse<CourseCategoryConstraintCheck>> {
  try {
    await requireAdmin();
    
    const result = await checkCourseCategoryConstraints(id);
    return { success: true, data: result };
  } catch (error) {
    return handleCourseCategoryError(error, 'constraint-check');
  }
}