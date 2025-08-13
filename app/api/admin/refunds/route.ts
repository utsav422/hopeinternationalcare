import { and, desc, eq, ilike, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db/drizzle';
import { enrollments as enrollmentsTable } from '@/lib/db/schema/enrollments';
import { payments as paymentsTable } from '@/lib/db/schema/payments';
import { profiles as profilesTable } from '@/lib/db/schema/profiles';
import { refunds as refundsTable } from '@/lib/db/schema/refunds';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const pageSize = Number.parseInt(searchParams.get('pageSize') || '10', 10);
  const search = searchParams.get('search');

  try {
    const offset = (page - 1) * pageSize;

    const whereConditions: ReturnType<typeof ilike>[] = [];

    if (search) {
      whereConditions.push(ilike(profilesTable.full_name, `%${search}%`));
    }

    const data = await db
      .select({
        refundId: refundsTable.id,
        payment_id: refundsTable.payment_id,
        reason: refundsTable.reason,
        amount: refundsTable.amount,
        created_at: refundsTable.created_at,
        userId: profilesTable.id,
        userEmail: profilesTable.email,
        userName: profilesTable.full_name,
      })
      .from(refundsTable)
      .leftJoin(paymentsTable, eq(refundsTable.payment_id, paymentsTable.id))
      .leftJoin(
        enrollmentsTable,
        eq(paymentsTable.enrollment_id, enrollmentsTable.id)
      )
      .leftJoin(profilesTable, eq(enrollmentsTable.user_id, profilesTable.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(refundsTable.created_at))
      .limit(pageSize)
      .offset(offset);

    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(refundsTable)
      .leftJoin(paymentsTable, eq(refundsTable.payment_id, paymentsTable.id))
      .leftJoin(
        enrollmentsTable,
        eq(paymentsTable.enrollment_id, enrollmentsTable.id)
      )
      .leftJoin(profilesTable, eq(enrollmentsTable.user_id, profilesTable.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    return NextResponse.json({
      success: true,
      data,
      total: totalCountResult[0].count,
    });
  } catch (error) {
    const e = error as Error;
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
