'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  sendCustomerContactReply, 
  sendCustomerContactBatchReply,
  type CustomerContactReplyType,
  type CustomerContactBatchReplyType 
} from '@/lib/server-actions/admin/customer-contact-reply';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'sonner';

export function useCustomerContactReply() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CustomerContactReplyType) => {
      const result = await sendCustomerContactReply(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to send reply');
      }
      return result;
    },
    onSuccess: (data) => {
      // Invalidate customer contact requests queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.customerContactRequests.all,
      });
      
      toast.success('Reply sent successfully', {
        description: `Email sent to ${data.data.recipientEmail}`,
      });
    },
    onError: (error) => {
      toast.error('Failed to send reply', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    },
  });
}

export function useCustomerContactBatchReply() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CustomerContactBatchReplyType) => {
      const result = await sendCustomerContactBatchReply(data);
      if (!result.success) {
        throw new Error(result.error || 'Failed to send batch reply');
      }
      return result;
    },
    onSuccess: (data) => {
      // Invalidate customer contact requests queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.customerContactRequests.all,
      });
      
      const { totalSent, totalFailed } = data.data;
      
      if (totalFailed === 0) {
        toast.success('Batch reply sent successfully', {
          description: `All ${totalSent} emails sent successfully`,
        });
      } else {
        toast.warning('Batch reply completed with some failures', {
          description: `${totalSent} sent successfully, ${totalFailed} failed`,
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to send batch reply', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    },
  });
}
