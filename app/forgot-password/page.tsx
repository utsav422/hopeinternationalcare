'use client';
import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PageParams, PageSearchParams } from '@/lib/types/shared';
import { cn } from '@/lib/utils';
import ForgotPasswordComponent from './_components/forgot-password-form';
import { toast } from 'sonner';
import { useEffect } from 'react';

type Params = PageParams;
type SearchParams = PageSearchParams;
export default function page() {

    return <ForgotPasswordComponent />;
}