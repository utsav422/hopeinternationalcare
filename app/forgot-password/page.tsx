import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PageParams, PageSearchParams } from '@/lib/types/shared';
import { cn } from '@/lib/utils';
import ForgotPasswordComponent from './_components/forgot-password-form';

type Params = PageParams;
type SearchParams = PageSearchParams;
export default async function page(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const successMessage = searchParams.success as string;
  //   const errorMessage = searchParams.error as string;
  if (successMessage && successMessage.length > 0) {
    return (
      <Card
        className={`m-auto my-20 flex min-w-72 max-w-sm flex-1 flex-col gap-2 text-foreground lg:my-52 [&>input]:mb-6 ${cn(successMessage ? 'bg-card' : 'bg-destructive/85')}`}
      >
        <CardHeader>
          <CardTitle>
            {successMessage ? (
              <div className="flex gap-2">
                <Check size={'40px'} />
                <p>Successfuly send the reset code</p>
              </div>
            ) : (
              'Failed to send the reset code'
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="italic">{successMessage}</CardContent>
      </Card>
    );
  }
  return <ForgotPasswordComponent />;
}
