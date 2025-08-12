import { logger } from '@/utils/logger';
import { createAdminSupabaseClient } from '@/utils/supabase/admin';

const supabaseAdmin = createAdminSupabaseClient();

/**
 * Seed function to create an administrative user with service_role
 * This function creates a user in Supabase auth with auto-verified status
 */
async function seedAdminUser() {
  // Get environment variables for admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
  const adminFullName = process.env.SEED_ADMIN_FULL_NAME || 'Administrator';
  const adminPhone = process.env.SEED_ADMIN_PHONE || '+1234567890';

  const {
    data: { users },
  } = await supabaseAdmin.auth.admin.listUsers();
  const adminUser = users.find((u) => u.email === adminEmail);
  if (adminUser) {
    logger.info('Administrative user already exists:', {
      user: adminUser.email,
    });
    return;
  }

  logger.info('Creating administrative user...');

  // Create the administrative user with service_role
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    user_metadata: {
      role: 'service_role',
      full_name: adminFullName,
      phone: adminPhone,
    },
    role: 'service_role',
    email_confirm: true, // Auto-verify the user
  });

  if (error) {
    throw new Error(`Error creating administrative user: ${error.message}`);
  }

  logger.info('Administrative user created successfully:', {
    user: user?.email,
  });

  // Also create a profile for the user
  if (user?.id) {
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: adminFullName,
        email: adminEmail,
        phone: adminPhone,
        role: 'service_role',
      });

    if (profileError) {
      throw new Error(
        `Error creating profile for administrative user: ${profileError.message}`
      );
    }

    logger.info('Profile created successfully for administrative user');
  }
}

/**
 * Seed function to generate course categories, courses, and intakes.
 * This function is idempotent and can be run multiple times.
 */
async function seedCoursesAndIntakes() {
  logger.info('Upserting course categories, courses, and intakes...');

  // 1. Upsert Course Categories
  const categories = [
    { name: 'Technology', description: 'Courses related to modern tech.' },
    {
      name: 'Business',
      description: 'Courses related to business management.',
    },
    {
      name: 'Health & Wellness',
      description: 'Courses for a healthy lifestyle.',
    },
  ];

  const { data: seededCategories, error: categoryError } = await supabaseAdmin
    .from('course_categories')
    .upsert(categories, { onConflict: 'name' })
    .select();

  if (categoryError) {
    throw new Error(
      `Error upserting course categories: ${categoryError.message}`
    );
  }
  logger.info('Upserted course categories successfully.');

  // 2. Upsert Courses
  const courses: {
    title: string;
    slug: string;
    description: string;
    category_id: string | undefined;
    level: number;
    duration_value: number;
    duration_type: 'month' | 'year' | 'year';
    image_url: string;
    price: number;
  }[] = [
    {
      title: 'Web Development Bootcamp',
      slug: 'web-development-bootcamp',
      description: 'A comprehensive bootcamp for aspiring web developers.',
      category_id: seededCategories.find((c) => c.name === 'Technology')?.id,
      level: 1,
      duration_value: 6,
      duration_type: 'month',
      image_url: 'https://placehold.co/600x400',
      price: 1200,
    },
    {
      title: 'Digital Marketing',
      slug: 'digital-marketing',
      description: 'Learn the ins and outs of digital marketing.',
      category_id: seededCategories.find((c) => c.name === 'Business')?.id,
      level: 2,
      duration_value: 3,
      duration_type: 'month',
      image_url: 'https://placehold.co/600x400',
      price: 800,
    },
    {
      title: 'Annual Yoga Retreat',
      slug: 'annual-yoga-retreat',
      description: 'A year-long journey into the world of yoga.',
      category_id: seededCategories.find((c) => c.name === 'Health & Wellness')
        ?.id,
      level: 3,
      duration_value: 1,
      duration_type: 'year',
      image_url: 'https://placehold.co/600x400',
      price: 2000,
    },
  ];

  const { data: seededCourses, error: courseError } = await supabaseAdmin
    .from('courses')
    .upsert(
      courses.filter((c) => c.category_id),
      { onConflict: 'slug' }
    )
    .select();

  if (courseError) {
    throw new Error(`Error upserting courses: ${courseError.message}`);
  }
  logger.info('Upserted courses successfully.');

  // 3. Generate and Seed Intakes
  const courseIds = seededCourses.map((c) => c.id);
  logger.info(`Deleting existing intakes for ${courseIds.length} courses...`);
  const { error: deleteError } = await supabaseAdmin
    .from('intakes')
    .delete()
    .in('course_id', courseIds);

  if (deleteError) {
    throw new Error(`Error deleting existing intakes: ${deleteError.message}`);
  }
  logger.info('Existing intakes deleted.');

  const intakes: {
    course_id: string;
    start_date: string;
    end_date: string;
  }[] = [];
  const today = new Date();

  for (const course of seededCourses) {
    const { id, duration_value, duration_type } = course;
    const currentYear = today.getFullYear();

    if (duration_type === 'year') {
      const startDate = new Date(currentYear, 0, 1); // Jan 1st
      intakes.push({
        course_id: id,
        start_date: startDate.toISOString(),
        end_date: new Date(currentYear, 11, 31).toISOString(), // Dec 31st
      });
    } else if (duration_type === 'month') {
      // Generate monthly intakes for the whole year
      for (let i = 0; i < 12; i++) {
        const startDate = new Date(currentYear, i, 1);
        const endDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + duration_value,
          0
        );
        intakes.push({
          course_id: id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });
      }
    }
  }

  logger.info(`Inserting ${intakes.length} new intakes...`);
  const { error: intakeError } = await supabaseAdmin
    .from('intakes')
    .insert(intakes);

  if (intakeError) {
    throw new Error(`Error seeding intakes: ${intakeError.message}`);
  }
  logger.info('Seeded intakes successfully.');
}

/**
 * Main seed function to run all seeders
 */
async function main() {
  try {
    await seedAdminUser();
    await seedCoursesAndIntakes();
    logger.info('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    logger.error('Unexpected error during seeding:', {
      description: errorMessage,
    });
    process.exit(1);
  }
}

// Run the main seed function
if (require.main === module) {
  main();
}
