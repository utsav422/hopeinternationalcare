'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useGetAllCourseCategories } from '@/hooks/public/course-categories';

interface CategoryFilterProps {
    value: string;
    onChange: (value: string) => void;
}

type Category = {
    id: string;
    name: string;
};

export default function CategoryFilter({
    value,
    onChange,
}: CategoryFilterProps) {
    const { data: queryResult, isLoading } = useGetAllCourseCategories();
    const categories = queryResult?.data ?? [];

    return (
        <Select onValueChange={onChange} value={value}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by category..." />
            </SelectTrigger>
            <SelectContent className="">
                {isLoading ? (
                    <SelectItem disabled value="loading">
                        Loading...
                    </SelectItem>
                ) : (
                    categories.map((category: Category) => (
                        <SelectItem
                            className="dark:hover:bg-gray-700"
                            key={category.id}
                            value={category.id}
                        >
                            {category.name}
                        </SelectItem>
                    ))
                )}
            </SelectContent>
        </Select>
    );
}
