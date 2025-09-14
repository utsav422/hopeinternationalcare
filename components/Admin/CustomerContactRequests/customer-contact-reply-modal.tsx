'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Send, Users } from 'lucide-react';
import { CustomerContactReplyForm } from './customer-contact-reply-form';
import type { ZodCustomerContactRequestSelectType } from '@/lib/db/drizzle-zod-schema/customer-contact-requests';

interface CustomerContactReplyModalProps {
  contactRequest?: ZodCustomerContactRequestSelectType;
  contactRequests?: ZodCustomerContactRequestSelectType[];
  mode: 'single' | 'batch';
  trigger?: React.ReactNode;
  disabled?: boolean;
}

export function CustomerContactReplyModal({
  contactRequest,
  contactRequests = [],
  mode,
  trigger,
  disabled = false,
}: CustomerContactReplyModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const isSingleMode = mode === 'single';
  const defaultTrigger = (
    <Button 
      variant={isSingleMode ? "outline" : "default"} 
      size="sm" 
      disabled={disabled}
      className={isSingleMode ? "" : "bg-blue-600 hover:bg-blue-700"}
    >
      {isSingleMode ? (
        <>
          <Mail className="mr-2 h-4 w-4" />
          Reply
        </>
      ) : (
        <>
          <Users className="mr-2 h-4 w-4" />
          Send Batch Reply ({contactRequests.length})
        </>
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSingleMode ? <Mail className="h-5 w-5" /> : <Users className="h-5 w-5" />}
            {isSingleMode ? 'Reply to Customer' : 'Send Batch Reply'}
          </DialogTitle>
        </DialogHeader>
        <CustomerContactReplyForm
          contactRequest={contactRequest}
          contactRequests={contactRequests}
          mode={mode}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
