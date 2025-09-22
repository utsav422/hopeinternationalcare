'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { 
  adminIntakeList, 
  adminIntakeDetails, 
  adminIntakeCreate, 
  adminIntakeUpdate, 
  adminIntakeDelete, 
  adminIntakeCheckConstraints,
  adminIntakeUpdateStatus
} from '@/lib/server-actions/admin/intakes-optimized';
import type { 
  IntakeQueryParams, 
  IntakeCreateData, 
  IntakeUpdateData,
  IntakeStatusUpdate
} from '@/lib/types/intakes';

// Query key structure
const intakeQueryKeys = {
  all: ['intakes'] as const,
  lists: () => [...intakeQueryKeys.all, 'list'] as const,
  list: (params: IntakeQueryParams) => [...intakeQueryKeys.lists(), params] as const,
  details: () => [...intakeQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...intakeQueryKeys.details(), id] as const,
  byCourse: (courseId: string) => [...intakeQueryKeys.all, 'course', courseId] as const,
  active: () => [...intakeQueryKeys.all, 'active'] as const,
  metrics: () => [...intakeQueryKeys.all, 'metrics'] as const,
};

// Cache invalidation patterns
const invalidationPatterns = {
  onIntakeCreate: [intakeQueryKeys.all],
  onIntakeUpdate: (id: string) => [
    intakeQueryKeys.all,
    intakeQueryKeys.detail(id)
  ],
  onIntakeDelete: (id: string) => [
    intakeQueryKeys.all,
    intakeQueryKeys.detail(id)
  ],
  onIntakeStatusUpdate: (id: string) => [
    intakeQueryKeys.all,
    intakeQueryKeys.detail(id)
  ],
};

// List operations
export function useAdminIntakeList(params: IntakeQueryParams) {
  return useQuery({
    queryKey: intakeQueryKeys.list(params),
    queryFn: async () => adminIntakeList(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useAdminIntakeSearch(search: string) {
  return useQuery({
    queryKey: intakeQueryKeys.list({ search }),
    queryFn: async () => adminIntakeList({ search }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Detail operations
export function useAdminIntakeDetails(id: string) {
  return useQuery({
    queryKey: intakeQueryKeys.detail(id),
    queryFn: async () => adminIntakeDetails(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: !!id,
  });
}

// Mutation operations
export function useAdminIntakeCreate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: IntakeCreateData) => adminIntakeCreate(data),
    onSuccess: async () => {
      // Invalidate all intake queries
      await queryClient.invalidateQueries({
        queryKey: intakeQueryKeys.all,
      });
    },
  });
}

export function useAdminIntakeUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: IntakeUpdateData) => adminIntakeUpdate(data),
    onSuccess: async (result) => {
      if (result.success && result.data) {
        // Invalidate specific intake queries
        await queryClient.invalidateQueries({
          queryKey: intakeQueryKeys.detail(result.data.id),
        });
        await queryClient.invalidateQueries({
          queryKey: intakeQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminIntakeDelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminIntakeDelete(id),
    onSuccess: async (result, variables) => {
      if (result.success) {
        // Invalidate specific intake queries
        await queryClient.invalidateQueries({
          queryKey: intakeQueryKeys.detail(variables),
        });
        await queryClient.invalidateQueries({
          queryKey: intakeQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminIntakeConstraintCheck() {
  return useQuery({
    queryKey: [...intakeQueryKeys.all, 'constraint-check'],
    queryFn: async (id: string) => adminIntakeCheckConstraints(id),
    enabled: false, // Only run when explicitly called
  });
}

// Status update operations
export function useAdminIntakeUpdateStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: IntakeStatusUpdate) => adminIntakeUpdateStatus(data),
    onSuccess: async (result) => {
      if (result.success && result.data) {
        // Invalidate specific intake queries
        await queryClient.invalidateQueries({
          queryKey: intakeQueryKeys.detail(result.data.id),
        });
        await queryClient.invalidateQueries({
          queryKey: intakeQueryKeys.all,
        });
      }
    },
  });
}

// Specialized operations
export function useAdminIntakeMetrics() {
  return useQuery({
    queryKey: intakeQueryKeys.metrics(),
    queryFn: async () => {
      // This would call a specialized server action for metrics
      // Implementation would depend on specific requirements
      return { success: true, data: { total: 0, active: 0 } };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useAdminIntakeExport() {
  // This would be a mutation hook for export functionality
  // Implementation would depend on specific requirements
  return useMutation({
    mutationFn: async (params: any) => {
      // Export implementation
      return { success: true, data: '' };
    },
  });
}