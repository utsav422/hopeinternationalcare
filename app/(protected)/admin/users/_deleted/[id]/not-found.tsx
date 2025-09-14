import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {AlertTriangle, ArrowLeft, UserX} from 'lucide-react';

export default function UserNotFound() {
    return (
        <div className="container mx-auto py-12">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <div
                            className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400"/>
                        </div>
                        <CardTitle className="text-xl">User Not Found</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600 dark:text-gray-400">
                            The user you&#39;re looking for doesn&#39;t exist or may have been permanently removed from
                            the system.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/admin/users/deleted">
                                <Button variant="outline" className="flex items-center space-x-2">
                                    <UserX className="h-4 w-4"/>
                                    <span>View Deleted Users</span>
                                </Button>
                            </Link>

                            <Link href="/admin/users">
                                <Button className="flex items-center space-x-2">
                                    <ArrowLeft className="h-4 w-4"/>
                                    <span>Back to Users</span>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
