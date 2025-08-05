'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetAllIntakes } from '@/hooks/intakes';

interface IntakeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function IntakeFilter({ value, onChange }: IntakeFilterProps) {
  const { data: queryResult, isLoading } = useGetAllIntakes();

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of today for comparison

  const futureIntakes = (queryResult?.data ?? []).filter((intake) => {
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
        <SelectItem disabled value="loading" className="dark:text-gray-400">
          Loading...
        </SelectItem>
      );
    }
    if (futureIntakes.length > 0) {
      return futureIntakes.map((intake) => (
        <SelectItem key={intake.id} value={intake.id} className="dark:hover:bg-gray-700">
          {formatDate(intake.start_date)}
        </SelectItem>
      ));
    }
    return (
      <SelectItem disabled value="no-intakes" className="dark:text-gray-400">
        No upcoming intakes
      </SelectItem>
    );
  };

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
        <SelectValue placeholder="Filter by intake..." />
      </SelectTrigger>
      <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
        {renderContent()}
      </SelectContent>
    </Select>
  );
}
