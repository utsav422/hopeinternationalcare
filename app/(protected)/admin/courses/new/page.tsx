'use server';

import CourseForm from '@/components/Admin/Courses/course-form';
import { requireAdmin } from '@/utils/auth-guard';

export default async function NewCourse() {
  await requireAdmin();

  return <CourseForm formTitle="Create New Course Form" />;
}
