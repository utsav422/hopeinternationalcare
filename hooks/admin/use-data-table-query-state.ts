'use client';

import type { ColumnFiltersState } from '@tanstack/react-table';
import { useQueryState } from 'nuqs';

export type ListParams = {
    page: number;
    pageSize: number;
    sortBy: string;
    order: 'asc' | 'desc';
    filters: ColumnFiltersState;
};

export const useDataTableQueryState = () => {
    const [page, setPage] = useQueryState('page', {
        defaultValue: 1,
        parse: v => Number.parseInt(v, 10),
        serialize: v => v.toString(),
    });

    const [pageSize, setPageSize] = useQueryState('pageSize', {
        defaultValue: 10,
        parse: v => Number.parseInt(v, 10),
        serialize: v => v.toString(),
    });

    const [sortBy, setSortBy] = useQueryState('sortBy', {
        defaultValue: 'created_at',
    });

    const [order, setOrder] = useQueryState<'asc' | 'desc'>('order', {
        defaultValue: 'desc',
        parse: v => (v === 'asc' || v === 'desc' ? v : 'desc'),
    });

    const [filters, setFilters] = useQueryState('filters', {
        parse: value => {
            try {
                return JSON.parse(value);
            } catch {
                return [];
            }
        },
        serialize: value => JSON.stringify(value),
    });

    return {
        page,
        pageSize,
        sortBy,
        order,
        filters,
        setPage,
        setPageSize,
        setSortBy,
        setOrder,
        setFilters,
    };
};
