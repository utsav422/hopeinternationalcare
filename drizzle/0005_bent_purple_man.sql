ALTER TYPE "public"."enrollment_status" ADD VALUE 'completed';--> statement-breakpoint
ALTER TABLE "intakes" ADD COLUMN "total_registered" integer DEFAULT 0 NOT NULL;