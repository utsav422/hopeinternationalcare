'use server';

import { db } from '@/utils/db/drizzle';

export const getInitialDashboardData = async () => {
  const enrollments = await db.query.enrollments.findMany();
  const payments = await db.query.payments.findMany();
  const users = await db.query.profiles.findMany();

  return {
    enrollments,
    payments,
    users,
  };
};
