'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetAllCourseCategories } from '@/hooks/course-categories';

interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CategoryFilter({
  value,
  onChange,
}: CategoryFilterProps) {
  const { data: queryResult, isLoading } = useGetAllCourseCategories();
  const categories = queryResult?.data ?? [];

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger>
        <SelectValue placeholder="Filter by category..." />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem disabled value="loading">
            Loading...
          </SelectItem>
        ) : (
          categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
