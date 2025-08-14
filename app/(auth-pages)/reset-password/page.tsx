import ResetPasswordComponent from './_components/reset-password-form';
import { Suspense } from 'react';

export default async function ResetPassword() {
    return <Suspense>
        <ResetPasswordComponent />
    </Suspense>
}
