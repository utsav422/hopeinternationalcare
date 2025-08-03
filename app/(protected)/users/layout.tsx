import '@/app/globals.css';
import { Suspense } from 'react';
import { requireUser } from '@/utils/auth-guard';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return <Suspense fallback="Loading...">{children}</Suspense>;
}
