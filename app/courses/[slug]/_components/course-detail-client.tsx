'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import CourseCard from '@/components/Custom/course-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { useCreateCustomerContactRequest } from '@/hooks/customer-contact-requests';
import { useGetCourseIntakes } from '@/hooks/intakes';
import { useGetNewCourses } from '@/hooks/new-courses';
import { useGetPublicCourseBySlug } from '@/hooks/public-courses';
import { useGetRelatedCourses } from '@/hooks/related-courses';
import { useAuthSession } from '@/hooks/use-auth-session';
import { createEnrollment } from '@/server-actions/user/enrollments';
import {
  CustomerContactFormSchema,
  type CustomerContactFormType,
} from '@/utils/db/drizzle-zod-schema/customer-contact-requests';

interface CourseDetailClientProps {
  slug: string;
}

export default function CourseDetailClient({ slug }: CourseDetailClientProps) {
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
      message: '',
    },
  });

  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
  } = useGetPublicCourseBySlug(slug);
  const course = courseData?.data;

  const {
    data: intakesData,
    isLoading: intakesLoading,
    error: intakesError,
  } = useGetCourseIntakes(course?.id || '');
  const intakes = intakesData?.data;

  const { data: relatedCoursesData } = useGetRelatedCourses(
    course?.id || '',
    course?.category_id || ''
  );
  const relatedCourses = relatedCoursesData?.data;

  const { data: newCoursesData } = useGetNewCourses();
  const newCourses = newCoursesData?.data;

  const handleEnrollClick = async () => {
    const availableIntake = intakes?.find(
      (intake) => intake.total_registered < intake.capacity
    );

    if (!availableIntake) {
      // No available intakes, or all are full
      setIsContactDialogOpen(true);
      return;
    }

    if (!user) {
      // Available intake found, but user not logged in
      setIsEnrollmentDialogOpen(true);
      return;
    }

    // User logged in and available intake found, proceed with enrollment
    const formData = new FormData();
    formData.append('courseId', course?.id || '');
    formData.append('intakeId', availableIntake.id);

    const result = await createEnrollment(formData);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(result.message);
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

  if (courseLoading || intakesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-800 dark:bg-gray-900 dark:text-gray-200">
        Loading course details...
      </div>
    );
  }

  if (courseError || intakesError) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500 dark:bg-gray-900">
        Error loading course: {courseError?.message || intakesError?.message}
      </div>
    );
  }

  if (!course) {
    notFound();
  }

  const hasAvailableIntakesForEnrollment = intakes?.some(
    (intake) => intake.total_registered < intake.capacity
  );
  const buttonText = hasAvailableIntakesForEnrollment
    ? 'Enroll Now'
    : 'Contact Us';

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
          <CardHeader className="p-0">
            <div className="relative h-64 w-full md:h-96">
              <Image
                alt={course.title}
                className="rounded-t-lg"
                layout="fill"
                objectFit="cover"
                src={course.image_url || '/image/placeholder.jpg'}
              />
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <h1 className="mb-4 font-extrabold text-3xl text-gray-900 md:text-4xl dark:text-white">
              {course.title}
            </h1>
            <p className="mb-6 text-gray-700 text-lg leading-relaxed dark:text-gray-300">
              {course.description}
            </p>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <p className="text-gray-800 dark:text-gray-200">
                <span className="font-semibold">Price:</span> रू{course.price}{' '}
                NPR
              </p>
              <p className="text-gray-800 dark:text-gray-200">
                <span className="font-semibold">Level:</span> {course.level}
              </p>
              <p className="text-gray-800 dark:text-gray-200">
                <span className="font-semibold">Duration:</span>{' '}
                {course.duration_value} {course.duration_type}
              </p>
            </div>

            <Button
              className="w-full bg-teal-500 py-3 font-semibold text-lg text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700"
              disabled={createContactRequestMutation.isPending}
              onClick={handleEnrollClick}
            >
              {buttonText}
            </Button>

            <h2 className="mt-8 mb-4 font-bold text-2xl text-gray-900 md:text-3xl dark:text-white">
              Upcoming Intakes
            </h2>
            {intakes && intakes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {intakes.map((intake) => (
                  <Card
                    className="bg-gray-100 shadow-sm dark:bg-gray-700"
                    key={intake.id}
                  >
                    <CardContent className="p-4">
                      <p className="mb-2 font-semibold text-gray-900 dark:text-white">
                        Start Date:{' '}
                        {new Date(intake.start_date).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                        <CalendarDays className="h-4 w-4" />
                        End Date:{' '}
                        {new Date(intake.end_date).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                        <Users className="h-4 w-4" />
                        Capacity: {intake.total_registered} / {intake.capacity}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                No upcoming intakes available for this course at the moment.
                Please contact us for more information.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Related Courses Section */}
        <section className="mt-12">
          <h2 className="mb-6 text-center font-bold text-2xl text-gray-900 md:text-3xl dark:text-white">
            Related Courses
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedCourses && relatedCourses.length > 0 ? (
              relatedCourses.map((relatedCourse) => (
                <CourseCard
                  available_seats={relatedCourse.available_seats}
                  categoryName={relatedCourse.categoryName}
                  desc={relatedCourse.description || ''}
                  heading={relatedCourse.image_url || ''}
                  id={relatedCourse.id}
                  key={relatedCourse.id}
                  next_intake_date={relatedCourse.next_intake_date}
                  next_intake_id={relatedCourse.next_intake_id}
                  price={relatedCourse.price}
                  slug={relatedCourse.slug}
                  title={relatedCourse.title}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-600 dark:text-gray-400">
                No related courses found.
              </p>
            )}
          </div>
        </section>

        {/* New Courses Section */}
        <section className="mt-12">
          <h2 className="mb-6 text-center font-bold text-2xl text-gray-900 md:text-3xl dark:text-white">
            New Courses
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newCourses && newCourses.length > 0 ? (
              newCourses.map((newCourse) => (
                <CourseCard
                  available_seats={newCourse.available_seats}
                  categoryName={newCourse.categoryName}
                  desc={newCourse.description || ''}
                  heading={newCourse.image_url || ''}
                  id={newCourse.id}
                  key={newCourse.id}
                  next_intake_date={newCourse.next_intake_date}
                  next_intake_id={newCourse.next_intake_id}
                  price={newCourse.price}
                  slug={newCourse.slug}
                  title={newCourse.title}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-600 dark:text-gray-400">
                No new courses found.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Enrollment Dialog */}
      <Dialog
        onOpenChange={setIsEnrollmentDialogOpen}
        open={isEnrollmentDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              Enrollment Information
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
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
                  className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
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
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              Contact Us About {course?.title || 'this course'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
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
                    <FormLabel className="text-gray-800 dark:text-gray-200">
                      Your Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-teal-400"
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
                    <FormLabel className="text-gray-800 dark:text-gray-200">
                      Your Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-teal-400"
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
                    <FormLabel className="text-gray-800 dark:text-gray-200">
                      Phone (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        {...field}
                        className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-teal-400"
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
                    <FormLabel className="text-gray-800 dark:text-gray-200">
                      Message
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="border-gray-300 bg-gray-50 focus:border-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-teal-400"
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
