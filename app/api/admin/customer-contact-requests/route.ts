import { and, eq, ilike, or, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db/drizzle';
import { customerContactRequests } from '@/lib/db/schema/customer-contact-requests';
import { requireAdmin } from '@/utils/auth-guard';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const getAll = searchParams.get('getAll');

  if (getAll) {
    try {
      await requireAdmin();
      const requests = await db.query.customerContactRequests.findMany();
      return NextResponse.json({ success: true, data: requests });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch contact requests: ${errorMessage}`,
        },
        { status: 500 }
      );
    }
  }

  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const pageSize = Number.parseInt(searchParams.get('pageSize') || '10', 10);
  const search = searchParams.get('search');
  const status = searchParams.get('status');

  try {
    await requireAdmin();
    const offset = (page - 1) * pageSize;

    const requests = await db.query.customerContactRequests.findMany({
      limit: pageSize,
      offset,
      where: (customerContactRequests, { and, eq, ilike, or }) => {
        return and(
          search
            ? or(
                ilike(customerContactRequests.name, `%${search}%`),
                ilike(customerContactRequests.email, `%${search}%`)
              )
            : undefined,
          status ? eq(customerContactRequests.status, status) : undefined
        );
      },
      orderBy: (customerContactRequests, { desc }) => [
        desc(customerContactRequests.created_at),
      ],
    });

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(customerContactRequests)
      .where(
        and(
          search
            ? or(
                ilike(customerContactRequests.name, `%${search}%`),
                ilike(customerContactRequests.email, `%${search}%`)
              )
            : undefined,
          status ? eq(customerContactRequests.status, status) : undefined
        )
      );

    return NextResponse.json({
      success: true,
      data: requests,
      total: totalResult[0].count,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch contact requests: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
