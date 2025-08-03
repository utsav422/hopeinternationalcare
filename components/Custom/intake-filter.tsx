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
        <SelectItem disabled value="loading">
          Loading...
        </SelectItem>
      );
    }
    if (futureIntakes.length > 0) {
      return futureIntakes.map((intake) => (
        <SelectItem key={intake.id} value={intake.id}>
          {formatDate(intake.start_date)}
        </SelectItem>
      ));
    }
    return (
      <SelectItem disabled value="no-intakes">
        No upcoming intakes
      </SelectItem>
    );
  };

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="Filter by intake..." />
      </SelectTrigger>
      <SelectContent>{renderContent()}</SelectContent>
    </Select>
  );
}
