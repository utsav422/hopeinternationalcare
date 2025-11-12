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
import { useAuthSession } from '@/hooks/use-auth-session';
import {
    CustomerContactFormSchema,
    type CustomerContactFormType,
} from '@/lib/db/drizzle-zod-schema/customer-contact-requests';
import { createEnrollment } from '@/lib/server-actions/user/enrollments-optimized';
import { Badge } from '../ui/badge';
import { usePublicCustomerContactRequestCreate } from '@/hooks/public/customer-contact-requests';

interface CourseCardProps {
    image_url: string;
    slug: string;
    title: string;
    highlights?: string;
    overview?: string;
    price: number;
    next_intake_date: string | null;
    available_seats: number | null;
    next_intake_id: string | null;
    id: string;
    categoryName: string | null;
}
// Define the sub-components separately
const ImageSection = ({
    image_url,
    categoryName,
}: {
    image_url: string;
    categoryName: string | null;
}) => (
    <div className="relative">
        <div className="mb-0 h-48 w-full overflow-hidden">
            <div className="relative h-full w-full">
                <Image
                    alt="Course"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    width={400}
                    height={300}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    src={image_url}
                    unoptimized={true}
                />
            </div>
            {categoryName && (
                <div className="absolute top-4 left-4">
                    <Badge className="bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-10 dark:hover:bg-gray-800">
                        {categoryName}
                    </Badge>
                </div>
            )}
        </div>
    </div>
);

const TitleSection = ({ title, slug }: { title: string; slug: string }) => (
    <div className="flex flex-col items-start">
        <Link className="block" href={`/courses/${slug}`}>
            <h3 className="font-bold text-xl text-gray-900 transition-colors duration-300 group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-40 line-clamp-2">
                {title}
            </h3>
        </Link>
    </div>
);

const OverviewSection = ({ overview }: { overview: string | undefined }) => {
    if (!overview) return null;
    return (
        <div className="mt-1">
            <p className="text-gray-600 text-sm line-clamp-3 min-h-[60px] dark:text-gray-300">
                {overview}
            </p>
        </div>
    );
};

const HighlightsSection = ({
    highlights,
}: {
    highlights: string | undefined;
}) => {
    if (!highlights) return null;
    return (
        <div className="mt-1">
            <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px] dark:text-gray-300">
                <span className="font-semibold">Highlights:</span> {highlights}
            </p>
        </div>
    );
};

const PriceSection = ({
    price,
    next_intake_date,
}: {
    price: number;
    next_intake_date: string | null;
}) => (
    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        <span className="font-bold text-lg text-teal-600 dark:text-teal-400">
            रू{price} NPR
        </span>
        {next_intake_date && (
            <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Next Intake:
                </p>
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {new Date(next_intake_date).toLocaleDateString()}
                </p>
            </div>
        )}
    </div>
);

const SeatsSection = ({
    available_seats,
}: {
    available_seats: number | null;
}) => {
    if (available_seats === null) return null;
    return (
        <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Available Seats:</span>{' '}
                {available_seats}
            </p>
        </div>
    );
};

const ActionSection = ({
    slug,
    available_seats,
    next_intake_id,
    courseId,
}: {
    slug: string;
    available_seats: number | null;
    next_intake_id: string | null;
    courseId: string;
}) => {
    const { user } = useAuthSession();
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

    const handleEnrollClick = async () => {
        if (!next_intake_id) {
            setIsContactDialogOpen(true); // Open contact form if no intake
            return;
        }

        if (!user) {
            setIsEnrollmentDialogOpen(true); // Open login/register dialog if not logged in
            return;
        }

        // Set loading state
        setIsEnrolling(true);

        const enrollmentData = {
            courseId: courseId,
            intakeId: next_intake_id,
            userId: user.id,
        };

        try {
            const result = await createEnrollment(enrollmentData);

            if (result?.error) {
                toast.error(result.error);
            } else if (result?.success) {
                toast.success(
                    'Enrollment successfully submitted and recorded. '
                );
            }
        } catch (error) {
            toast.error('Failed to create enrollment. Please try again.');
        } finally {
            // Reset loading state
            setIsEnrolling(false);
        }
    };

    return (
        <div className="mt-auto flex gap-3 pt-4">
            <Link
                className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-center font-medium text-sm text-gray-800 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 flex items-center justify-center"
                href={`/courses/${slug}`}
            >
                View Details
            </Link>
            <Button
                className="flex-1 rounded-lg bg-teal-500 px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 flex items-center justify-center"
                disabled={
                    (available_seats !== null &&
                        (available_seats ?? 0) <= 0 &&
                        next_intake_id !== null) ||
                    isEnrolling
                }
                onClick={handleEnrollClick}
            >
                {isEnrolling
                    ? 'Enrolling...'
                    : (() => {
                          if (next_intake_id === null) {
                              return 'Contact Us';
                          }
                          if (
                              available_seats !== null &&
                              (available_seats ?? 0) <= 0
                          ) {
                              return 'Full';
                          }
                          return 'Enroll Now';
                      })()}
            </Button>
        </div>
    );
};

// Define the main component
const CourseCard = ({
    image_url,
    slug,
    title,
    highlights,
    overview,
    price,
    next_intake_date,
    available_seats,
    next_intake_id,
    id: courseId,
    categoryName,
}: CourseCardProps) => {
    const { user } = useAuthSession();
    const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
    const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);

    const createContactRequestMutation =
        usePublicCustomerContactRequestCreate();

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

        // Set loading state
        setIsEnrolling(true);

        const enrollmentData = {
            courseId: courseId,
            intakeId: next_intake_id,
            userId: user.id,
        };

        try {
            const result = await createEnrollment(enrollmentData);

            if (result?.error) {
                toast.error(result.error);
            } else if (result?.success) {
                toast.success(
                    'Enrollment successfully submitted and recorded. '
                );
            }
        } catch (error) {
            toast.error('Failed to create enrollment. Please try again.');
        } finally {
            // Reset loading state
            setIsEnrolling(false);
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
            onError: (error: unknown) => {
                toast.error(
                    `Failed to send inquiry: ${
                        error instanceof Error
                            ? error.message
                            : 'Something went wrong contac to adminstratiion'
                    }`
                );
            },
        });
    };

    return (
        <>
            <div className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg shadow-gray-20/50 dark:bg-gray-800 dark:shadow-gray-900/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 min-w-[300px]">
                <ImageSection
                    image_url={image_url}
                    categoryName={categoryName}
                />
                <div className="flex flex-grow flex-col p-6 space-y-4">
                    <TitleSection title={title} slug={slug} />
                    {/* <OverviewSection overview={overview} />
                    <HighlightsSection highlights={highlights} /> */}
                    <PriceSection
                        price={price}
                        next_intake_date={next_intake_date}
                    />
                    <SeatsSection available_seats={available_seats} />
                    <ActionSection
                        slug={slug}
                        available_seats={available_seats}
                        next_intake_id={next_intake_id}
                        courseId={courseId}
                    />
                </div>
            </div>
            {/* Enrollment Dialog */}
            <Dialog
                onOpenChange={setIsEnrollmentDialogOpen}
                open={isEnrollmentDialogOpen}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Enrollment Information</DialogTitle>
                        <DialogDescription>
                            To enroll in a course, you need to be registered and
                            logged in.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <p>
                            Please log in or register to continue with your
                            enrollment request.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Link href="/sign-in">
                                <Button variant="outline">Login</Button>
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
            <Dialog
                onOpenChange={setIsContactDialogOpen}
                open={isContactDialogOpen}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Contact Us About {title}</DialogTitle>
                        <DialogDescription>
                            Please fill out the form below and we will get back
                            to you shortly.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...contactForm}>
                        <form
                            className="space-y-4"
                            onSubmit={contactForm.handleSubmit(
                                onContactFormSubmit
                            )}
                        >
                            <FormField
                                control={contactForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-800">
                                            Your Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
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
                                        <FormLabel className="text-gray-800">
                                            Your Email
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                {...field}
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
                                        <FormLabel className="text-gray-800">
                                            Phone (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="tel"
                                                {...field}
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
                                        <FormLabel className="text-gray-800">
                                            Message
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="I would like to know more about this course..."
                                                rows={4}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                disabled={
                                    createContactRequestMutation.isPending
                                }
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
        </>
    );
};

// Create the compound component by assigning sub-components to the main component
const CompoundCourseCard = Object.assign(CourseCard, {
    ImageSection,
    TitleSection,
    OverviewSection,
    HighlightsSection,
    PriceSection,
    SeatsSection,
    ActionSection,
});

export default CompoundCourseCard;
