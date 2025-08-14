'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import React from 'react'

function page() {
    return (
        <Card
            className={`m-auto my-20 flex min-w-72 max-w-sm flex-1 flex-col gap-2 text-foreground lg:my-52 [&>input]:mb-6 bg-card`}
        >
            <CardHeader>
                <CardTitle>
                    <div className="flex gap-2">
                        <Check size={'40px'} />
                        <p>Successfuly send the reset code</p>
                    </div>

                </CardTitle>
            </CardHeader>
            <CardContent className="italic">You can close this page, and contiue using features of application</CardContent>
        </Card>
    );

}

export default page