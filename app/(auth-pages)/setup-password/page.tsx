import { Suspense } from 'react';
import SetupPasswordForm from './_components/setup-password-form';

export default async function SetupPassword() {
    return (
        <Suspense>
            <SetupPasswordForm />
        </Suspense>
    );
}
