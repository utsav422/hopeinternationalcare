import { createAdminSupabaseClient } from '@/utils/supabase/admin';

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

  try {
    // Create Supabase admin client
    const supabaseAdmin = createAdminSupabaseClient();
    const adminAuthClient = supabaseAdmin.auth.admin;

    console.log('Creating administrative user...');

    // Create the administrative user with service_role
    const {
      data: { user },
      error,
    } = await adminAuthClient.createUser({
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
      console.error('Error creating administrative user:', error.message);
      process.exit(1);
    }

    console.log('Administrative user created successfully:', user?.email);

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
        console.error(
          'Error creating profile for administrative user:',
          profileError.message
        );
        process.exit(1);
      }

      console.log('Profile created successfully for administrative user');
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error during seeding:', error);
    process.exit(1);
  }
}

// Run the seed function
if (require.main === module) {
  seedAdminUser();
}

export { seedAdminUser };
