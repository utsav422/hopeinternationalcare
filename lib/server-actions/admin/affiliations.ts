'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { affiliations } from '@/lib/db/schema/affiliations';
import { courses } from '@/lib/db/schema/courses';
import { requireAdmin } from '@/utils/auth-guard';
import { logger } from '@/utils/logger';
import { buildFilterConditions, buildWhereClause, buildOrderByClause } from '@/lib/utils/query-utils';
import { affiliationColumnMap, affiliationSelectColumns, buildAffiliationFilterConditions, buildAffiliationWhereClause, buildAffiliationOrderByClause, calculateOffset } from '@/lib/utils/affiliations';
import { ZodAffiliationInsertSchema } from '@/lib/db/drizzle-zod-schema/affiliations';

// Types
export type AffiliationFormData = {
  id?: string;
  name: string;
  type: string;
  description?: string;
};

// Create or update affiliation with validation
export async function upsertAffiliation(data: AffiliationFormData) {
  try {
    await requireAdmin();
    
    // Validate input data
    const validatedData = ZodAffiliationInsertSchema.parse(data);
    
    const values = {
      name: validatedData.name,
      type: validatedData.type,
      description: validatedData.description,
      updated_at: sql`now()`, // Set updated_at for updates
    };
    
    let result;
    
    if (data.id) {
      // Update existing affiliation
      const [updated] = await db
        .update(affiliations)
        .set(values)
        .where(eq(affiliations.id, data.id))
        .returning();
      result = updated;
    } else {
      // Create new affiliation
      const [created] = await db
        .insert(affiliations)
        .values(values)
        .returning();
      result = created;
    }
    
    revalidatePath('/admin/affiliations');
    return { success: true, data: result };
  } catch (error: any) {
    logger.error('Error upserting affiliation:', { error });
    
    // Handle unique constraint violation
    if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
      return { 
        success: false, 
        error: 'An affiliation with this name already exists.' 
      };
    }
    
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return { 
        success: false, 
        error: 'Invalid data provided. Please check the form fields.' 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save affiliation' 
    };
  }
}

// Get all affiliations
export async function getAffiliations() {
  try {
    const data = await db
      .select(affiliationSelectColumns)
      .from(affiliations)
      .orderBy(affiliations.name);
    
    return { success: true, data };
  } catch (error) {
    logger.error('Error fetching affiliations:', { error });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch affiliations' 
    };
  }
}

// Get affiliation by ID
export async function getAffiliationById(id: string) {
  try {
    const [data] = await db
      .select(affiliationSelectColumns)
      .from(affiliations)
      .where(eq(affiliations.id, id));
    
    if (!data) {
      return { success: false, error: 'Affiliation not found' };
    }
    
    return { success: true, data };
  } catch (error) {
    logger.error('Error fetching affiliation:', { error });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch affiliation' 
    };
  }
}

// Delete affiliation with constraint check
export async function deleteAffiliation(id: string) {
  try {
    await requireAdmin();
    
    // Check if affiliation is referenced by any courses
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.affiliation_id, id));
    
    if (count > 0) {
      return { 
        success: false, 
        error: `Cannot delete: referenced by ${count} course(s). Update or remove those courses first.` 
      };
    }
    
    const [deleted] = await db
      .delete(affiliations)
      .where(eq(affiliations.id, id))
      .returning();
    
    if (!deleted) {
      return { success: false, error: 'Affiliation not found' };
    }
    
    revalidatePath('/admin/affiliations');
    return { success: true, data: deleted };
  } catch (error) {
    logger.error('Error deleting affiliation:', { error });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete affiliation' 
    };
  }
}

// Get affiliations with pagination, filtering, and sorting
export async function adminAffiliationList({
  page = 1,
  pageSize = 10,
  sortBy = 'created_at',
  order = 'desc',
  filters = [],
}: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  filters?: any[];
}) {
  try {
    const offset = calculateOffset(page, pageSize);
    
    // Build filter conditions
    const filterConditions = buildAffiliationFilterConditions(filters);
    const whereClause = buildAffiliationWhereClause(filterConditions);
    const orderBy = buildAffiliationOrderByClause(sortBy, order);
    
    // Main query with filters and pagination
    const query = db
      .select(affiliationSelectColumns)
      .from(affiliations)
      .limit(pageSize)
      .offset(offset);
    
    // Apply where clause if exists
    const queryWithWhere = whereClause ? query.where(whereClause) : query;
    
    // Apply order by
    const queryWithOrder = orderBy ? queryWithWhere.orderBy(orderBy) : queryWithWhere;
    
    // Count query with same filters
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(affiliations);
    
    // Apply where clause to count query if exists
    const countQueryWithWhere = whereClause ? countQuery.where(whereClause) : countQuery;
    
    const [data, [{ count }]] = await Promise.all([queryWithOrder, countQueryWithWhere]);
    
    return { 
      success: true, 
      data, 
      total: count,
      page,
      pageSize
    };
  } catch (error) {
    logger.error('Error fetching affiliations list:', { error });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch affiliations' 
    };
  }
}

// Get affiliations with pagination (kept for backward compatibility)
export async function getAffiliationsPaginated({
  page = 1,
  pageSize = 10,
  search,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  try {
    const offset = (page - 1) * pageSize;
    
    // Build base query with search filter if provided
    let query;
    let countQuery;
    
    if (search) {
      const searchFilter = `%${search}%`;
      const searchCondition = sql`(${affiliations.name} ILIKE ${searchFilter} OR ${affiliations.description} ILIKE ${searchFilter})`;
      
      query = db
        .select(affiliationSelectColumns)
        .from(affiliations)
        .where(searchCondition)
        .orderBy(affiliations.name)
        .limit(pageSize)
        .offset(offset);
      
      countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(affiliations)
        .where(searchCondition);
    } else {
      query = db
        .select(affiliationSelectColumns)
        .from(affiliations)
        .orderBy(affiliations.name)
        .limit(pageSize)
        .offset(offset);
      
      countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(affiliations);
    }
    
    const [data, [{ count }]] = await Promise.all([query, countQuery]);
    
    return { 
      success: true, 
      data, 
      total: count,
      page,
      pageSize
    };
  } catch (error) {
    logger.error('Error fetching paginated affiliations:', { error });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch affiliations' 
    };
  }
}