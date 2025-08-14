import PaymentForm from '@/components/Admin/Payments/payment-form';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { Suspense } from 'react';

export default function NewPaymentPage() {
    return (
        <div className="flex h-full items-center justify-center space-y-4">
            <QueryErrorWrapper>
                <Suspense>
                    <PaymentForm formTitle="Create New Payment Form" />
                </Suspense>
            </QueryErrorWrapper>
        </div>
    );
}
