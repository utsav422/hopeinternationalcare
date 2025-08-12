'use client';
import { Suspense } from 'react';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { DashboardCardSkeleton } from '../Dasboard';
import UsersTables from './users-tables';

function UserList() {
  return (
    <QueryErrorWrapper>
      <Suspense fallback={<DashboardCardSkeleton />}>
        <UsersTables />
      </Suspense>
    </QueryErrorWrapper>
  );
}

export default UserList;
