'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { 
  adminCourseList, 
  adminCourseDetails, 
  adminCourseCreate, 
  adminCourseUpdate, 
  adminCourseDelete, 
  adminCourseCheckConstraints,
  adminCourseImageUpload,
  adminCourseImageDelete
} from '@/lib/server-actions/admin/courses-optimized';
import type { 
  CourseQueryParams, 
  CourseCreateData, 
  CourseUpdateData 
} from '@/lib/types/courses';

// Query key structure
const courseQueryKeys = {
  all: ['courses'] as const,
  lists: () => [...courseQueryKeys.all, 'list'] as const,
  list: (params: CourseQueryParams) => [...courseQueryKeys.lists(), params] as const,
  details: () => [...courseQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseQueryKeys.details(), id] as const,
  byCategory: (categoryId: string) => [...courseQueryKeys.all, 'category', categoryId] as const,
  byAffiliation: (affiliationId: string) => [...courseQueryKeys.all, 'affiliation', affiliationId] as const,
  metrics: () => [...courseQueryKeys.all, 'metrics'] as const,
};

// Cache invalidation patterns
const invalidationPatterns = {
  onCourseCreate: [courseQueryKeys.all],
  onCourseUpdate: (id: string) => [
    courseQueryKeys.all,
    courseQueryKeys.detail(id)
  ],
  onCourseDelete: (id: string) => [
    courseQueryKeys.all,
    courseQueryKeys.detail(id)
  ],
  onCourseImageUpdate: (id: string) => [
    courseQueryKeys.detail(id)
  ],
};

// List operations
export function useAdminCourseList(params: CourseQueryParams) {
  return useQuery({
    queryKey: courseQueryKeys.list(params),
    queryFn: async () => adminCourseList(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useAdminCourseSearch(search: string) {
  return useQuery({
    queryKey: courseQueryKeys.list({ search }),
    queryFn: async () => adminCourseList({ search }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Detail operations
export function useAdminCourseDetails(id: string) {
  return useQuery({
    queryKey: courseQueryKeys.detail(id),
    queryFn: async () => adminCourseDetails(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: !!id,
  });
}

// Mutation operations
export function useAdminCourseCreate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CourseCreateData) => adminCourseCreate(data),
    onSuccess: async () => {
      // Invalidate all course queries
      await queryClient.invalidateQueries({
        queryKey: courseQueryKeys.all,
      });
    },
  });
}

export function useAdminCourseUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CourseUpdateData) => adminCourseUpdate(data),
    onSuccess: async (result) => {
      if (result.success && result.data) {
        // Invalidate specific course queries
        await queryClient.invalidateQueries({
          queryKey: courseQueryKeys.detail(result.data.id),
        });
        await queryClient.invalidateQueries({
          queryKey: courseQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminCourseDelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminCourseDelete(id),
    onSuccess: async (result, variables) => {
      if (result.success) {
        // Invalidate specific course queries
        await queryClient.invalidateQueries({
          queryKey: courseQueryKeys.detail(variables),
        });
        await queryClient.invalidateQueries({
          queryKey: courseQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminCourseConstraintCheck() {
  return useQuery({
    queryKey: [...courseQueryKeys.all, 'constraint-check'],
    queryFn: async (id: string) => adminCourseCheckConstraints(id),
    enabled: false, // Only run when explicitly called
  });
}

// Image operations
export function useAdminCourseImageUpload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, courseId }: { file: File; courseId: string }) => 
      adminCourseImageUpload(file, courseId),
    onSuccess: async (result) => {
      if (result.success && result.data) {
        // Invalidate course details
        await queryClient.invalidateQueries({
          queryKey: courseQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminCourseImageDelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ imageUrl, courseId }: { imageUrl: string; courseId: string }) => 
      adminCourseImageDelete(imageUrl, courseId),
    onSuccess: async (result, variables) => {
      if (result.success) {
        // Invalidate course details
        await queryClient.invalidateQueries({
          queryKey: courseQueryKeys.all,
        });
      }
    },
  });
}

// Specialized operations
export function useAdminCourseMetrics() {
  return useQuery({
    queryKey: courseQueryKeys.metrics(),
    queryFn: async () => {
      // This would call a specialized server action for metrics
      // Implementation would depend on specific requirements
      return { success: true, data: { total: 0, byCategory: {} } };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useAdminCourseExport() {
  // This would be a mutation hook for export functionality
  // Implementation would depend on specific requirements
  return useMutation({
    mutationFn: async (params: any) => {
      // Export implementation
      return { success: true, data: '' };
    },
  });
}