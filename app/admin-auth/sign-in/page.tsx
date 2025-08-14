import { Suspense } from 'react';
import SignInCard from './_components/signin-card';


export default async function Login() {
    return (
        <Suspense>
            <SignInCard />
        </Suspense>
    );
}
