import { z } from 'zod';

export const RealtimeSubcription = z.object({
    table: z.string(),
    schema: z.string(),
});

export type TypeRealtimeSubcription = z.infer<typeof RealtimeSubcription>;
