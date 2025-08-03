import PaymentForm from '@/components/Admin/Payments/payment-form';

export default function NewPaymentPage() {
  return (
    <div className="flex h-full items-center justify-center space-y-4">
      <PaymentForm formTitle="Create New Payment Form" />
    </div>
  );
}
