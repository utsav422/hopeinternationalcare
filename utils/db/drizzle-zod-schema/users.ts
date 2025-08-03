import { z } from 'zod';

// Schema for User
export const InviteUserSchema = z.object({
  full_name: z.string().optional(), // Required string field
  phone: z.string().optional(), // Required string field
  email: z.string().email(), // Required string field
});
export type ZInviteUserType = z.infer<typeof InviteUserSchema>;
// Export the main User schema
