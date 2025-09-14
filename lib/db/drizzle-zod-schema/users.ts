import { z } from 'zod';

// Define the schema for admin user query parameters
export const ZodUsersQuerySchema = z.object({
    page: z.string().optional(), // Page number (default: '1')
    pageSize: z.string().optional(), // Items per page (default: '10')
});

// Schema for User
export const InviteUserSchema = z.object({
    full_name: z.string().optional(), // Optional string field
    phone: z.string().optional(), // Optional string field
    email: z.email(), // Required email field
});
export type ZInviteUserType = z.infer<typeof InviteUserSchema>;

export type ZodUsersQueryType = z.infer<typeof ZodUsersQuerySchema>;