'use client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';
import React from 'react'

function page() {
    return (
        <Card
            className={`m-auto my-20 flex min-w-72 max-w-sm flex-1 flex-col gap-2 text-foreground lg:my-52 [&>input]:mb-6`}
        >
            <CardHeader>
                <CardTitle>
                    <div className="flex gap-2">
                        <Check size={'40px'} />
                        <p>Successfuly reset password and logged in.</p>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="italic">You can close this page, and contiue using features of application</CardContent>
            <CardFooter>
                <Link href={'/profile'}> Visit Profile </Link>
            </CardFooter>
        </Card>

    );

}

export default page