'use server';

import {and, AnyColumn, asc, desc, eq, gte, ilike, inArray, lte, sql, SQL} from 'drizzle-orm';
import {cache} from 'react';
import {db} from '@/lib/db/drizzle';
import {ZodCustomerContactRequestInsertSchema} from '@/lib/db/drizzle-zod-schema/customer-contact-requests';
import {customerContactRequests} from '@/lib/db/schema/customer-contact-requests';
import {requireAdmin} from '@/utils/auth-guard';
import type {ListParams as DataTableListParams} from "@/hooks/admin/use-data-table-query-state";
import {ColumnFilter} from "@tanstack/react-table";

export async function adminCustomerContactRequestListAll() {
    try {
        await requireAdmin();
        const requests = await db.query.customerContactRequests.findMany();
        return {success: true, data: requests};
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        return {
            success: false,
            error: `Failed to fetch contact requests: ${errorMessage}`,
        };
    }
}

type ListParams = Partial<DataTableListParams>;

export async function adminCustomerContactRequestList({
                                                          page = 1,
                                                          pageSize = 10,
                                                          sortBy = 'created_at',
                                                          order = 'desc',
                                                          filters = [],
                                                      }: ListParams) {
    try {
        await requireAdmin();
        const offset = (page - 1) * pageSize;

        // Define column mapping for sorting and filtering
        const columnMap: Record<string, AnyColumn> = {
            id: customerContactRequests.id,
            name: customerContactRequests.name,
            email: customerContactRequests.email,
            phone: customerContactRequests.phone,
            message: customerContactRequests.message,
            status: customerContactRequests.status,
            created_at: customerContactRequests.created_at,
            updated_at: customerContactRequests.updated_at,
            // Add other columns as needed for filtering/sorting
        };

        // Build filter conditions using the same pattern as other list functions
        const filterConditions = filters
            ?.map((filter: ColumnFilter) => {
                const col = columnMap[filter.id];
                if (!col) return null;

                // Handle string filters (e.g., search by name, email, subject, message)
                if (typeof filter.value === 'string' && filter.value !== '') {
                    return ilike(col, `%${filter.value}%`);
                }

                // Handle array filters (e.g., status)
                if (
                    Array.isArray(filter.value) &&
                    filter.value.length > 0
                    // Optionally restrict to specific columns if needed
                    // && ['status'].includes(filter.id)
                ) {
                    return inArray(col, filter.value.filter(v => v !== null && v !== undefined));
                }

                // Handle numeric range filters [min, max] (if applicable to any fields like ID)
                if (
                    Array.isArray(filter.value) &&
                    filter.value.length === 2 &&
                    (typeof filter.value[0] === 'number' || filter.value[0] === null) &&
                    (typeof filter.value[1] === 'number' || filter.value[1] === null)
                ) {
                    const [min, max] = filter.value;
                    const conditions: SQL[] = [];
                    if (min !== null && min !== undefined) {
                        conditions.push(gte(col, min));
                    }
                    if (max !== null && max !== undefined) {
                        conditions.push(lte(col, max));
                    }
                    if (conditions.length > 0) {
                        return sql.join(conditions, sql` AND `);
                    }
                }

                // Handle single numeric value filters (if applicable)
                if (typeof filter.value === 'number') {
                    return eq(col, filter.value);
                }

                // Handle boolean filters (if any boolean fields exist, e.g., a hypothetical 'is_read' flag)
                if (typeof filter.value === 'boolean') {
                    return eq(col, filter.value);
                }

                // Fallback for other types or empty values
                return null;
            })
            .filter(Boolean) as SQL[]; // Filter out nulls and type assert

        const whereClause =
            filterConditions?.length > 0
                ? and(...filterConditions) // Combine filter conditions with AND
                : undefined;

        // Determine sort column
        const sortColumn: AnyColumn = columnMap[sortBy] || customerContactRequests.created_at;
        const sortOrder = order === 'asc' ? asc(sortColumn) : desc(sortColumn);

        // Build data query
        const dataQuery = db
            .select()
            .from(customerContactRequests)
            .$dynamic(); // Allow dynamic query building

        // Apply filters and sorting
        // @ts-ignore - Dynamic query building
        const requests = await dataQuery
            .where(whereClause)
            .orderBy(sortOrder)
            .limit(pageSize)
            .offset(offset);

        // Build count query
        const countQuery = db
            .select({count: sql<number>`count(*)`})
            .from(customerContactRequests)
            .$dynamic(); // Allow dynamic query building

        // Apply filters to count query
        // @ts-ignore - Dynamic query building
        const totalResult = await countQuery
            .where(whereClause);

        return {
            success: true,
            data: requests,
            total: totalResult[0].count,
        };
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        return {
            success: false,
            error: `Failed to fetch contact requests: ${errorMessage}`,
        };
    }
}

export async function adminCustomerContactRequestUpdateStatusById(
    id: string,
    status: string
) {
    try {
        await requireAdmin();
        const parsed = ZodCustomerContactRequestInsertSchema.pick({
            status: true,
        }).safeParse({status});
        if (!parsed.success) {
            return {success: false, error: parsed.error.message};
        }
        const data = await db
            .update(customerContactRequests)
            .set({status: parsed.data.status})
            .where(eq(customerContactRequests.id, id))
            .returning();
        return {
            success: true,
            data: data[0],
        };
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        return {
            success: false,
            error: `Failed to update contact request status: ${errorMessage}`,
        };
    }
}

export async function adminCustomerContactRequestDeleteById(id: string) {
    try {
        await requireAdmin();
        const data = await db
            .delete(customerContactRequests)
            .where(eq(customerContactRequests.id, id))
            .returning();
        return {success: true, data: data[0]};
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        return {
            success: false,
            error: `Failed to delete contact request: ${errorMessage}`,
        };
    }
}

export const cachedAdminCustomerContactRequestListAll = cache(
    adminCustomerContactRequestListAll
);
export const cachedAdminCustomerContactRequestList = cache(
    adminCustomerContactRequestList
);
