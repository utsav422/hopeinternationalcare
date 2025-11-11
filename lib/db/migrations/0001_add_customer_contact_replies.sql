-- Migration: Add customer_contact_replies table
-- Created: 2024-12-19

-- Create customer_contact_replies table
CREATE TABLE IF NOT EXISTS "customer_contact_replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_request_id" uuid NOT NULL,
	"subject" varchar(500) NOT NULL,
	"message" text NOT NULL,
	"reply_to_email" varchar(255) NOT NULL,
	"reply_to_name" varchar(255) NOT NULL,
	"resend_email_id" varchar(255),
	"email_status" varchar(50) DEFAULT 'sent' NOT NULL,
	"resend_response" jsonb,
	"error_message" text,
	"batch_id" varchar(255),
	"is_batch_reply" varchar(10) DEFAULT 'false' NOT NULL,
	"admin_id" uuid,
	"admin_email" varchar(255),
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE "customer_contact_replies" ADD CONSTRAINT "customer_contact_replies_contact_request_id_customer_contact_requests_id_fk" FOREIGN KEY ("contact_request_id") REFERENCES "customer_contact_requests"("id") ON DELETE cascade ON UPDATE no action;

-- Enable RLS
ALTER TABLE "customer_contact_replies" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service_role

-- Service role can select all customer contact replies
CREATE POLICY "service_role can select customer contact replies" ON "customer_contact_replies"
AS PERMISSIVE FOR SELECT
TO service_role
USING ((auth.jwt() ->> 'role') = 'service_role');

-- Service role can insert customer contact replies
CREATE POLICY "service_role can insert customer contact replies" ON "customer_contact_replies"
AS PERMISSIVE FOR INSERT
TO service_role
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- Service role can update customer contact replies
CREATE POLICY "service_role can update customer contact replies" ON "customer_contact_replies"
AS PERMISSIVE FOR UPDATE
TO service_role
USING ((auth.jwt() ->> 'role') = 'service_role')
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- Service role can delete customer contact replies
CREATE POLICY "service_role can delete customer contact replies" ON "customer_contact_replies"
AS PERMISSIVE FOR DELETE
TO service_role
USING ((auth.jwt() ->> 'role') = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_customer_contact_replies_contact_request_id" ON "customer_contact_replies" ("contact_request_id");
CREATE INDEX IF NOT EXISTS "idx_customer_contact_replies_batch_id" ON "customer_contact_replies" ("batch_id");
CREATE INDEX IF NOT EXISTS "idx_customer_contact_replies_admin_id" ON "customer_contact_replies" ("admin_id");
CREATE INDEX IF NOT EXISTS "idx_customer_contact_replies_email_status" ON "customer_contact_replies" ("email_status");
CREATE INDEX IF NOT EXISTS "idx_customer_contact_replies_sent_at" ON "customer_contact_replies" ("sent_at");
CREATE INDEX IF NOT EXISTS "idx_customer_contact_replies_created_at" ON "customer_contact_replies" ("created_at");
