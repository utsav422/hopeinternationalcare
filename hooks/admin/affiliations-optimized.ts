'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { 
  adminAffiliationList, 
  adminAffiliationDetails, 
  adminAffiliationCreate, 
  adminAffiliationUpdate, 
  adminAffiliationDelete, 
  adminAffiliationCheckConstraints 
} from '../../lib/server-actions/admin/affiliations-optimized';
import type { 
  AffiliationQueryParams, 
  AffiliationCreateData, 
  AffiliationUpdateData,
  ApiResponse
} from '../../lib/types/affiliations';

// Query key structure
const affiliationQueryKeys = {
  all: ['affiliations'] as const,
  lists: () => [...affiliationQueryKeys.all, 'list'] as const,
  list: (params: AffiliationQueryParams) => [...affiliationQueryKeys.lists(), params] as const,
  details: () => [...affiliationQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...affiliationQueryKeys.details(), id] as const,
  byType: (type: string) => [...affiliationQueryKeys.all, 'type', type] as const,
  metrics: () => [...affiliationQueryKeys.all, 'metrics'] as const,
};

// Cache invalidation patterns
const invalidationPatterns = {
  onAffiliationCreate: [affiliationQueryKeys.all],
  onAffiliationUpdate: (id: string) => [
    affiliationQueryKeys.all,
    affiliationQueryKeys.detail(id)
  ],
  onAffiliationDelete: (id: string) => [
    affiliationQueryKeys.all,
    affiliationQueryKeys.detail(id)
  ],
};

// List operations
export function useAdminAffiliationList(params: AffiliationQueryParams) {
  return useQuery({
    queryKey: affiliationQueryKeys.list(params),
    queryFn: async () => adminAffiliationList(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useAdminAffiliationSearch(search: string) {
  return useQuery({
    queryKey: affiliationQueryKeys.list({ search }),
    queryFn: async () => adminAffiliationList({ search }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Detail operations
export function useAdminAffiliationDetails(id: string) {
  return useQuery({
    queryKey: affiliationQueryKeys.detail(id),
    queryFn: async () => adminAffiliationDetails(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: !!id,
  });
}

// Mutation operations
export function useAdminAffiliationCreate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AffiliationCreateData) => adminAffiliationCreate(data),
    onSuccess: async () => {
      // Invalidate all affiliation queries
      await queryClient.invalidateQueries({
        queryKey: affiliationQueryKeys.all,
      });
    },
  });
}

export function useAdminAffiliationUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AffiliationUpdateData) => adminAffiliationUpdate(data),
    onSuccess: async (result: ApiResponse<any>) => {
      if (result.success && result.data) {
        // Invalidate specific affiliation queries
        await queryClient.invalidateQueries({
          queryKey: affiliationQueryKeys.detail(result.data.id),
        });
        await queryClient.invalidateQueries({
          queryKey: affiliationQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminAffiliationDelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminAffiliationDelete(id),
    onSuccess: async (result: ApiResponse<any>, variables) => {
      if (result.success) {
        // Invalidate specific affiliation queries
        await queryClient.invalidateQueries({
          queryKey: affiliationQueryKeys.detail(variables),
        });
        await queryClient.invalidateQueries({
          queryKey: affiliationQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminAffiliationConstraintCheck(id: string) {
  return useQuery({
    queryKey: [...affiliationQueryKeys.all, 'constraint-check', id],
    queryFn: async () => adminAffiliationCheckConstraints(id),
    enabled: !!id, // Only run when ID is provided
  });
}

// Specialized operations
export function useAdminAffiliationMetrics() {
  return useQuery({
    queryKey: affiliationQueryKeys.metrics(),
    queryFn: async () => {
      // This would call a specialized server action for metrics
      // Implementation would depend on specific requirements
      return { success: true, data: { total: 0, byType: {} } };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useAdminAffiliationExport() {
  // This would be a mutation hook for export functionality
  // Implementation would depend on specific requirements
  return useMutation({
    mutationFn: async (params: any) => {
      // Export implementation
      return { success: true, data: '' };
    },
  });
}