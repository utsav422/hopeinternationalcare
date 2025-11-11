import { Suspense } from 'react';
import SignUpClientComponent from './_components/sign-up-client-component';

export default async function page() {
    return (
        <Suspense>
            <SignUpClientComponent />
        </Suspense>
    );
}
