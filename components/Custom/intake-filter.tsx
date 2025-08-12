'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetAllIntake } from '@/hooks/admin/intakes';

interface IntakeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function IntakeFilter({ value, onChange }: IntakeFilterProps) {
  const { data: queryData, isLoading } = useGetAllIntake();

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today for comparison

  const futureIntakes = (queryData ?? []).filter((intake) => {
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
    if (isLoading) {
      return (
        <SelectItem className="dark:text-gray-400" disabled value="loading">
          Loading...
        </SelectItem>
      );
    }
    if (futureIntakes.length > 0) {
      return futureIntakes.map((intake) => (
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
      <SelectItem className="dark:text-gray-400" disabled value="no-intakes">
        No upcoming intakes
      </SelectItem>
    );
  };

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="dark:border-gray-700 dark:bg-gray-800 dark:text-white">
        <SelectValue placeholder="Filter by intake..." />
      </SelectTrigger>
      <SelectContent className="dark:border-gray-700 dark:bg-gray-800 dark:text-white">
        {renderContent()}
      </SelectContent>
    </Select>
  );
}
