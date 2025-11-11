import { Suspense } from 'react';
import ForgotPasswordComponent from './_components/forgot-password-form';

export default async function page() {
    return (
        <Suspense>
            <ForgotPasswordComponent />
        </Suspense>
    );
}
