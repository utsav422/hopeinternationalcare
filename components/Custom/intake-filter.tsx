'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useGetAllIntakes } from '@/hooks/public/intakes';

interface Intake {
    id: string;
    course_id: string | null;
    start_date: string;
    end_date: string;
    capacity: number;
    is_open: boolean | null;
    total_registered: number;
    created_at: string;
    updated_at: string;
}

interface IntakeFilterProps {
    value: string;
    onChange: (value: string) => void;
}

export default function IntakeFilter({ value, onChange }: IntakeFilterProps) {
    const { data: queryResult } = useGetAllIntakes();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for comparison
    const intakes = queryResult?.data;
    const futureIntakes = (intakes ?? []).filter((intake: Intake) => {
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

    const renderContent = () => {
        if (futureIntakes.length > 0) {
            return futureIntakes.map((intake: Intake) => (
                <SelectItem
                    className="dark:hover:bg-gray-700"
                    key={intake.id}
                    value={intake.id}
                >
                    {formatDate(intake.start_date)}
                </SelectItem>
            ));
        }
        return (
            <SelectItem className="" disabled value="no-intakes">
                No upcoming intakes
            </SelectItem>
        );
    };

    return (
        <Select onValueChange={onChange} value={value}>
            <SelectTrigger className="">
                <SelectValue placeholder="Filter by intake..." />
            </SelectTrigger>
            <SelectContent className="">
                {renderContent()}
            </SelectContent>
        </Select>
    );
}
