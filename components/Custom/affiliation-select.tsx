'use client';

import { Suspense } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAdminAffiliationsAll } from '@/hooks/admin/affiliations-optimized';
import type { ZodInsertAffiliationType } from '@/lib/db/drizzle-zod-schema/affiliations';
import type { ZodInsertCourseType } from '@/lib/db/drizzle-zod-schema/courses';
import { Skeleton } from '../ui/skeleton';
import { QueryErrorWrapper } from './query-error-wrapper';
import { AffiliationBase } from '@/lib/types';

interface AffiliationSelectProps {
    field: ControllerRenderProps<ZodInsertCourseType, 'affiliation_id'>;
    disabled?: boolean;
}

export default function AffiliationSelect({
    field,
    disabled,
}: AffiliationSelectProps) {
    const {
        data: queryResult,
        isLoading,
        error: queryError,
        refetch,
    } = useAdminAffiliationsAll();

    if (queryError) {
        toast.error('Something went wrong while fetching affiliations', {
            description: queryError.message,
        });
    }

    const affiliations =
        queryResult?.data?.filter(
            (aff): aff is AffiliationBase => aff.id !== undefined
        ) || [];

    if (isLoading) {
        return (
            <div className="flex items-center space-x-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        );
    }
    if (affiliations.length === 0) {
        return (
            <div>
                No affiliations found. Please create an affiliation first.
            </div>
        );
    }
    return (
        <>
            <Select
                disabled={disabled}
                onValueChange={field.onChange}
                value={field.value ?? undefined}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an affiliation (optional)" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    {affiliations
                        ?.filter(aff => aff.id) // optional safety
                        .map(affiliation => (
                            <SelectItem
                                key={affiliation.id}
                                value={affiliation.id}
                            >
                                {affiliation.name}
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>
        </>
    );
}
