import {
    and,
    asc,
    eq,
    exists,
    gte,
    ilike,
    lte,
    ne,
    type SQL,
    sql,
} from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { courseCategories } from '@/lib/db/schema/course-categories';
import { courses } from '@/lib/db/schema/courses';
import { intakes } from '@/lib/db/schema/intakes';

type Filters = {
    title?: string;
    category?: string;
    duration?: number;
    intake_date?: string;
};

// Helper function to safely parse JSON
function safeJsonParse(str: string | null, fallback: unknown = {}): Filters {
    if (!str) {
        return fallback as Filters;
    }
    try {
        return JSON.parse(str) as Filters;
    } catch (_error) {
        return fallback as Filters;
    }
}

// Helper function to validate and parse date
function parseDate(dateString: string | undefined): Date | null {
    if (!dateString) {
        return null;
    }
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? null : date;
}

// Helper function to validate pagination parameters
function validatePagination(
    page: number,
    pageSize: number
): { page: number; pageSize: number } {
    const validPage = Math.max(1, Math.min(page, 1000)); // Limit page to prevent abuse
    const validPageSize = Math.max(1, Math.min(pageSize, 100)); // Limit pageSize to prevent abuse
    return { page: validPage, pageSize: validPageSize };
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const courseId = searchParams.get('id');
        const slug = searchParams.get('slug');
        const relatedTo = searchParams.get('relatedTo');
        const categoryId = searchParams.get('categoryId');
        const newCourses = searchParams.get('new');

        // Handle specific course requests first
        if (courseId) {
            return await getPublicCourseById(courseId);
        }

        if (slug) {
            return await getPublicCourseBySlug(slug);
        }

        if (relatedTo && categoryId) {
            return await getRelatedCourses(relatedTo, categoryId);
        }

        if (newCourses) {
            return await getNewCourses();
        }

        // Handle general courses listing
        return await getPublicCourses(request);
    } catch (_error) {
        // In a production environment, you might want to use a proper logging solution
        // For now, we'll just return a generic error response
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function getPublicCourses(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = Number.parseInt(searchParams.get('page') || '1', 10);
        const pageSize = Number.parseInt(searchParams.get('pageSize') || '10', 10);
        const sortBy = searchParams.get('sortBy') || 'created_at';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const filters: Filters = safeJsonParse(searchParams.get('filters'));

        // Validate pagination parameters
        const { page: validPage, pageSize: validPageSize } = validatePagination(
            page,
            pageSize
        );
        const offset = (validPage - 1) * validPageSize;

        // Build where conditions
        const whereConditions: SQL[] = [];

        if (filters.title) {
            whereConditions.push(ilike(courses.title, `%${filters.title}%`));
        }

        if (filters.category) {
            whereConditions.push(eq(courseCategories.id, filters.category));
        }

        if (filters.duration) {
            whereConditions.push(eq(courses.duration_value, filters.duration));
        }

        if (filters.intake_date) {
            const date = parseDate(filters.intake_date);
            if (date) {
                whereConditions.push(
                    exists(
                        db
                            .select({ n: sql`1` })
                            .from(intakes)
                            .where(
                                and(
                                    eq(intakes.course_id, courses.id),
                                    lte(intakes.start_date, date.toISOString()),
                                    gte(intakes.end_date, date.toISOString())
                                )
                            )
                    )
                );
            }
        }

        // Create subqueries for next intake information
        const nextIntakeSubquery = db
            .select({
                course_id: intakes.course_id,
                min_start_date:
                    sql<string>`min(case when ${intakes.start_date} > now() then ${intakes.start_date} else null end)`.as(
                        'min_start_date'
                    ),
            })
            .from(intakes)
            .groupBy(intakes.course_id)
            .as('min_intake_dates');

        const nextIntakeDetails = db
            .select({
                id: intakes.id,
                course_id: intakes.course_id,
                start_date: intakes.start_date,
                capacity: intakes.capacity,
                total_registered: intakes.total_registered,
            })
            .from(intakes)
            .innerJoin(
                nextIntakeSubquery,
                and(
                    eq(intakes.course_id, nextIntakeSubquery.course_id),
                    eq(intakes.start_date, nextIntakeSubquery.min_start_date)
                )
            )
            .as('next_intake');

        // Define sortable columns
        const sortableColumns = {
            created_at: courses.created_at,
            name: courses.title,
            category: courseCategories.name,
            price: courses.price,
            duration_type: courses.duration_type,
            duration_value: courses.duration_value,
            level: courses.level,
        };

        // Validate sortBy parameter
        const orderBy =
            sortableColumns[sortBy as keyof typeof sortableColumns] ||
            courses.created_at;

        // Fetch courses data
        const data = await db
            .select({
                id: courses.id,
                description: courses.description,
                duration_type: courses.duration_type,
                duration_value: courses.duration_value,
                price: courses.price,
                created_at: courses.created_at,
                updated_at: courses.updated_at,
                title: courses.title,
                level: courses.level,
                image_url: courses.image_url,
                slug: courses.slug,
                categoryName: courseCategories.name,
                next_intake_date: nextIntakeDetails.start_date,
                next_intake_id: nextIntakeDetails.id,
                available_seats: sql<number>`coalesce(${nextIntakeDetails.capacity}, 0) - coalesce(${nextIntakeDetails.total_registered}, 0)`,
            })
            .from(courses)
            .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
            .leftJoin(nextIntakeDetails, eq(courses.id, nextIntakeDetails.course_id))
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
            .orderBy(sortOrder === 'asc' ? sql`${orderBy} asc` : sql`${orderBy} desc`)
            .groupBy(
                courses.id,
                courses.description,
                courses.duration_type,
                courses.duration_value,
                courses.price,
                courses.created_at,
                courses.updated_at,
                courses.title,
                courses.level,
                courses.image_url,
                courses.slug,
                courseCategories.name,
                nextIntakeDetails.start_date,
                nextIntakeDetails.id,
                nextIntakeDetails.capacity,
                nextIntakeDetails.total_registered
            )
            .limit(validPageSize)
            .offset(offset);

        // Get total count for pagination
        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(courses)
            .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

        return NextResponse.json({
            success: true,
            data,
            total: totalResult[0].count,
            page: validPage,
            pageSize: validPageSize,
        });
    } catch (_error) {
        // In a production environment, you might want to use a proper logging solution
        return NextResponse.json(
            { success: false, error: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}

async function getPublicCourseById(courseId: string) {
    try {
        // Validate courseId format
        if (!courseId || typeof courseId !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Invalid course ID' },
                { status: 400 }
            );
        }

        const result = await db
            .select()
            .from(courses)
            .where(eq(courses.id, courseId));

        if (result.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Course not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: result[0] });
    } catch (_error) {
        // In a production environment, you might want to use a proper logging solution
        return NextResponse.json(
            { success: false, error: 'Failed to fetch course' },
            { status: 500 }
        );
    }
}

async function getPublicCourseBySlug(slug: string) {
    try {
        // Validate slug
        if (!slug || typeof slug !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Invalid slug provided' },
                { status: 400 }
            );
        }

        // Fetch course with category information
        const courseResult = await db
            .select({
                id: courses.id,
                title: courses.title,
                description: courses.description,
                duration_value: courses.duration_value,
                duration_type: courses.duration_type,
                price: courses.price,
                image_url: courses.image_url,
                slug: courses.slug,
                category_id: courses.category_id,
                created_at: courses.created_at,
                updated_at: courses.updated_at,
                level: courses.level,
                category: {
                    id: courseCategories.id,
                    name: courseCategories.name,
                    description: courseCategories.description,
                },
            })
            .from(courses)
            .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
            .where(eq(courses.slug, slug));

        if (courseResult.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Course not found' },
                { status: 404 }
            );
        }

        const courseData = courseResult[0];

        // Fetch upcoming intakes for this course
        const courseIntakes = await db
            .select()
            .from(intakes)
            .where(
                and(
                    eq(intakes.course_id, courseData.id),
                    gte(intakes.start_date, new Date().toISOString())
                )
            )
            .orderBy(asc(intakes.start_date));

        return NextResponse.json({
            success: true,
            data: { ...courseData, intakes: courseIntakes },
        });
    } catch (_error) {
        // In a production environment, you might want to use a proper logging solution
        return NextResponse.json(
            { success: false, error: 'Failed to fetch course' },
            { status: 500 }
        );
    }
}

async function getRelatedCourses(courseId: string, categoryId: string) {
    try {
        // Validate parameters
        if (!(courseId && categoryId)) {
            return NextResponse.json(
                { success: false, error: 'Course ID and category ID are required' },
                { status: 400 }
            );
        }

        const relatedCourses = await db
            .select({
                id: courses.id,
                title: courses.title,
                slug: courses.slug,
                description: courses.description,
                image_url: courses.image_url,
                price: courses.price,
                next_intake_date:
                    sql<string>`min(case when ${intakes.start_date} > now() then ${intakes.start_date} else null end)`.as(
                        'next_intake_date'
                    ),
                next_intake_id: intakes.id,
                available_seats: sql<number>`coalesce(${intakes.capacity}, 0) - coalesce(${intakes.total_registered}, 0)`,
                categoryName: courseCategories.name,
                level: courses.level,
                duration_value: courses.duration_value,
                duration_type: courses.duration_type,
            })
            .from(courses)
            .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
            .leftJoin(intakes, eq(courses.id, intakes.course_id))
            .where(and(eq(courses.category_id, categoryId), ne(courses.id, courseId)))
            .groupBy(
                courses.id,
                courses.title,
                courses.slug,
                courses.description,
                courses.image_url,
                courses.price,
                courses.level,
                courses.duration_value,
                courses.duration_type,
                courseCategories.name,
                intakes.id,
                intakes.capacity,
                intakes.total_registered
            )
            .orderBy(sql`random()`)
            .limit(3);

        return NextResponse.json({ success: true, data: relatedCourses });
    } catch (_error) {
        // In a production environment, you might want to use a proper logging solution
        return NextResponse.json(
            { success: false, error: 'Failed to fetch related courses' },
            { status: 500 }
        );
    }
}

async function getNewCourses() {
    try {
        const newCourses = await db
            .select({
                id: courses.id,
                title: courses.title,
                slug: courses.slug,
                description: courses.description,
                image_url: courses.image_url,
                price: courses.price,
                next_intake_date:
                    sql<string>`min(case when ${intakes.start_date} > now() then ${intakes.start_date} else null end)`.as(
                        'next_intake_date'
                    ),
                next_intake_id: intakes.id,
                available_seats: sql<number>`coalesce(${intakes.capacity}, 0) - coalesce(${intakes.total_registered}, 0)`,
                categoryName: courseCategories.name,
                level: courses.level,
                duration_value: courses.duration_value,
                duration_type: courses.duration_type,
                created_at: courses.created_at,
            })
            .from(courses)
            .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
            .leftJoin(intakes, eq(courses.id, intakes.course_id))
            .groupBy(
                courses.id,
                courses.title,
                courses.slug,
                courses.description,
                courses.image_url,
                courses.price,
                courses.level,
                courses.duration_value,
                courses.duration_type,
                courses.created_at,
                courseCategories.name,
                intakes.id,
                intakes.capacity,
                intakes.total_registered
            )
            .orderBy(courses.created_at, sql`desc`)
            .limit(3);

        return NextResponse.json({ success: true, data: newCourses });
    } catch (_error) {
        // In a production environment, you might want to use a proper logging solution
        return NextResponse.json(
            { success: false, error: 'Failed to fetch new courses' },
            { status: 500 }
        );
    }
}
