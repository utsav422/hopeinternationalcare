'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface SortingSelectProps {
    value: string;
    onChange: (value: string) => void;
}

const sortingOptions = [
    { value: 'created_at-desc', label: 'Newest' },
    { value: 'created_at-asc', label: 'Oldest' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'category-asc', label: 'Category (A-Z)' },
    { value: 'category-desc', label: 'Category (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'duration_value-asc', label: 'Duration (Shortest)' },
    { value: 'duration_value-desc', label: 'Duration (Longest)' },
];

export default function SortingSelect({ value, onChange }: SortingSelectProps) {
    return (
        <Select onValueChange={onChange} value={value}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="">
                {sortingOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
