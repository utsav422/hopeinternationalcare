import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        template: '%s | User Management | Admin Dashboard | Hope International',
        default: 'User Management | Admin Dashboard | Hope International',
    },
    description: 'Manage users, view deletion history, and handle user operations in the Hope International admin dashboard.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto py-6">
                {children}
            </div>
        </div>
    );
}
