import { Suspense } from 'react';
import SignInClientComponent from './_components/sign-in-client-component';

export default async function page() {
    return (
        <Suspense>
            <SignInClientComponent />
        </Suspense>
    );
}
