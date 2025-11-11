'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { getAllIntakes } from '@/lib/server-actions/public/intakes-optimized';
import type { ActiveIntake } from '@/lib/types/public/intakes';

interface IntakeFilterProps {
    value: string;
    onChange: (value: string) => void;
}

export default function IntakeFilter({ value, onChange }: IntakeFilterProps) {
    const { data: queryResult, isLoading } = useQuery({
        queryKey: ['all-intakes'],
        queryFn: async () => {
            const result = await getAllIntakes();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch all intakes');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
    const today = new Date();
    today.setHours(0, 0, 0); // Set to start of today for comparison
    const intakes = queryResult?.data || [];
    const futureIntakes = intakes.filter((intake: ActiveIntake) => {
        const startDate = new Date(intake.start_date);
        return startDate > today;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <Select value={value}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Loading intakes..." />
                </SelectTrigger>
                <SelectContent className=""></SelectContent>
            </Select>
        );
    }

    return (
        <Select onValueChange={onChange} value={value}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by intake..." />
            </SelectTrigger>
            <SelectContent className="">
                {futureIntakes.length > 0 ? (
                    futureIntakes.map((intake: ActiveIntake) => (
                        <SelectItem
                            className="dark:hover:bg-gray-700"
                            key={intake.id}
                            value={intake.id}
                        >
                            {formatDate(intake.start_date)}
                        </SelectItem>
                    ))
                ) : (
                    <SelectItem className="" disabled value="no-intakes">
                        No upcoming intakes
                    </SelectItem>
                )}
            </SelectContent>
        </Select>
    );
}
