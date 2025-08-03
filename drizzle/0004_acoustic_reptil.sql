CREATE TYPE "public"."payment_method" AS ENUM('cash', 'bank_transfer', 'mobile_wallets', 'fonepay');--> statement-breakpoint
ALTER TYPE "public"."payment_status" ADD VALUE 'cancelled' BEFORE 'failed';--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "method" SET DEFAULT 'cash'::"public"."payment_method";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "method" SET DATA TYPE "public"."payment_method" USING "method"::"public"."payment_method";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "method" SET NOT NULL;