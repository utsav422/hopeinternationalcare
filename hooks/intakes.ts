'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminDeleteIntake,
  adminGetAllIntake,
  adminGetIntakeById,
} from '@/server-actions/admin/intakes';
import { queryKeys } from './query-keys';

export const useGetAllIntakes = () => {
  return useQuery({
    queryKey: queryKeys.intakes.lists(),
    queryFn: () => adminGetAllIntake(),
  });
};

export const useGetIntakeById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.intakes.detail(id),
    queryFn: () => adminGetIntakeById(id),
    enabled: !!id,
  });
};

export const useDeleteIntake = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteIntake(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intakes.lists() });
    },
  });
};
