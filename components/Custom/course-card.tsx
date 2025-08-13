'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCustomerContactRequest } from '@/hooks/admin/customer-contact-requests';
import { useAuthSession } from '@/hooks/use-auth-session';
import {
    CustomerContactFormSchema,
    type CustomerContactFormType,
} from '@/lib/db/drizzle-zod-schema/customer-contact-requests';
import { createEnrollment } from '@/lib/server-actions/user/enrollments';
import { Badge } from '../ui/badge';

interface CourseCardProps {
    heading: string;
    slug: string;
    title: string;
    desc: string;
    price: number;
    next_intake_date: string | null;
    available_seats: number | null;
    next_intake_id: string | null;
    id: string;
    categoryName: string | null;
}

export function CourseCard({
    heading,
    slug,
    title,
    desc,
    price,
    next_intake_date,
    available_seats,
    next_intake_id,
    id: courseId,
    categoryName,
}: CourseCardProps) {
    const { user } = useAuthSession();
    const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

    const createContactRequestMutation = useCreateCustomerContactRequest();

    const contactForm = useForm<CustomerContactFormType>({
        resolver: zodResolver(CustomerContactFormSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            message: `Inquiry about course: ${title}`,
        },
    });

    const handleEnrollClick = async () => {
        if (!next_intake_id) {
            setIsContactDialogOpen(true); // Open contact form if no intake
            return;
        }

        if (!user) {
            setIsEnrollmentDialogOpen(true); // Open login/register dialog if not logged in
            return;
        }

        const formData = new FormData();
        formData.append('courseId', courseId);
        formData.append('intakeId', next_intake_id);

        const result = await createEnrollment(formData);

        if (result?.error) {
            toast.error(result.error);
        } else if (result?.success) {
            toast.success('Enrollment successfully submitted and recorded. ');
        }
    };

    const onContactFormSubmit = (data: CustomerContactFormType) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('phone', data.phone || '');
        formData.append('message', data.message);

        createContactRequestMutation.mutate(formData, {
            onSuccess: () => {
                toast.success('Your inquiry has been sent!');
                setIsContactDialogOpen(false);
                contactForm.reset();
            },
            onError: (error) => {
                toast.error(`Failed to send inquiry: ${error.message}`);
            },
        });
    };

    return (
        <div className="group flex h-full flex-col rounded-lg bg-white p-5 shadow-lg transition duration-300 hover:scale-105 dark:bg-gray-900 dark:shadow-2xl">
            <div className="mb-4 h-48 w-full overflow-hidden rounded-md">
                <div className="relative h-full w-full">
                    <Image
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        layout="fill"
                        objectFit="cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={heading}
                    />
                </div>
            </div>
            <div className="flex flex-grow flex-col space-y-3">
                <div className="flex flex-col items-start">
                    {categoryName && (
                        <Badge
                            className="mb-2 w-fit dark:bg-gray-700 "
                            variant="secondary"
                        >
                            {categoryName}
                        </Badge>
                    )}
                    <Link className="block" href={`/courses/${slug}`}>
                        <h3 className="font-semibold text-gray-900 text-xl transition-colors duration-300 group-hover:text-teal-600  dark:group-hover:text-teal-400">
                            {title}
                        </h3>
                    </Link>
                </div>
                <p className="line-clamp-3 min-h-[72px] font-normal text-base text-gray-600 dark:text-gray-300">
                    {desc}
                </p>
                <div className="flex items-center justify-between pt-2">
                    <span className="font-bold text-gray-800 text-lg dark:text-gray-100">
                        रू{price} NPR
                    </span>
                    {next_intake_date && (
                        <div className="text-right">
                            <p className="text-gray-600 text-sm ">
                                Next Intake:
                            </p>
                            <p className="font-semibold text-base text-gray-800 ">
                                {new Date(next_intake_date).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>
                {available_seats !== null && ( // Only show if available_seats is not null
                    <p className="text-gray-600 text-sm ">
                        Available Seats: {available_seats}
                    </p>
                )}
                <div className="mt-auto flex gap-2 pt-4">
                    <Link
                        className="flex-1 rounded-md bg-teal-500 px-4 py-2 text-center font-medium text-sm text-white transition-colors hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
                        href={`/courses/${slug}`}
                    >
                        View Details
                    </Link>
                    <Button
                        className="flex-1 rounded-md border border-teal-500 px-4 py-2 font-medium text-sm text-teal-700 transition-colors hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-gray-700"
                        disabled={
                            available_seats !== null &&
                            available_seats <= 0 &&
                            next_intake_id !== null
                        }
                        onClick={handleEnrollClick}
                    >
                        {(() => {
                            if (next_intake_id === null) {
                                return 'Contact Us';
                            }
                            if (available_seats !== null && available_seats <= 0) {
                                return 'Full';
                            }
                            return 'Enroll Now';
                        })()}
                    </Button>
                </div>
            </div>
            {/* Enrollment Dialog */}
            <Dialog
                onOpenChange={setIsEnrollmentDialogOpen}
                open={isEnrollmentDialogOpen}
            >
                <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 ">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 ">
                            Enrollment Information
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 ">
                            To enroll in a course, you need to be registered and logged in.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <p className="text-gray-700 dark:text-gray-300">
                            Please log in or register to continue with your enrollment
                            request.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Link href="/sign-in">
                                <Button
                                    className="dark:border-gray-600  dark:hover:bg-gray-700"
                                    variant="outline"
                                >
                                    Login
                                </Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button className="bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700">
                                    Register
                                </Button>
                            </Link>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Contact Form Dialog */}
            <Dialog onOpenChange={setIsContactDialogOpen} open={isContactDialogOpen}>
                <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 ">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 ">
                            Contact Us About {title}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 ">
                            Please fill out the form below and we will get back to you
                            shortly.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...contactForm}>
                        <form
                            className="space-y-4"
                            onSubmit={contactForm.handleSubmit(onContactFormSubmit)}
                        >
                            <FormField
                                control={contactForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-800 ">
                                            Your Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700  dark:focus:border-teal-400"
                                                placeholder="John Doe"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={contactForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-800 ">
                                            Your Email
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                {...field}
                                                className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700  dark:focus:border-teal-400"
                                                placeholder="john.doe@example.com"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={contactForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-800 ">
                                            Phone (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="tel"
                                                {...field}
                                                className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700  dark:focus:border-teal-400"
                                                placeholder="+1234567890"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={contactForm.control}
                                name="message"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-800 ">
                                            Message
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700  dark:focus:border-teal-400"
                                                placeholder="I would like to know more about this course..."
                                                rows={4}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                className="w-full bg-teal-500 text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
                                disabled={createContactRequestMutation.isPending}
                                type="submit"
                            >
                                {createContactRequestMutation.isPending
                                    ? 'Sending...'
                                    : 'Send Inquiry'}
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CourseCard;
