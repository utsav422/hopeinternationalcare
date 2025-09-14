CREATE TYPE "public"."duration_type" AS ENUM('days', 'week', 'month', 'year');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('requested', 'enrolled', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'bank_transfer', 'mobile_wallets', 'fonepay');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'cancelled', 'failed', 'refunded');--> statement-breakpoint
CREATE TABLE "course_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "course_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"image_url" varchar,
	"level" integer DEFAULT 1 NOT NULL,
	"duration_type" "duration_type" DEFAULT 'month' NOT NULL,
	"duration_value" integer DEFAULT 3 NOT NULL,
	"price" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "courses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "customer_contact_replies" (
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
--> statement-breakpoint
ALTER TABLE "customer_contact_replies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "customer_contact_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"message" varchar(1000) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_contact_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resend_email_id" varchar(255),
	"batch_id" varchar(255),
	"from_email" varchar(255) NOT NULL,
	"to_emails" jsonb NOT NULL,
	"subject" varchar(500) NOT NULL,
	"html_content" text,
	"text_content" text,
	"reply_to" varchar(255),
	"status" varchar(50) DEFAULT 'sent' NOT NULL,
	"email_type" varchar(100),
	"template_used" varchar(100),
	"resend_response" jsonb,
	"error_message" text,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"user_id" uuid,
	"admin_id" uuid,
	"related_entity_type" varchar(100),
	"related_entity_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"intake_id" uuid,
	"status" "enrollment_status" DEFAULT 'requested' NOT NULL,
	"notes" varchar,
	"enrollment_date" timestamp DEFAULT now(),
	"cancelled_reason" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "enrollments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "intakes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"capacity" integer DEFAULT 20 NOT NULL,
	"is_open" boolean DEFAULT true,
	"total_registered" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "intakes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid,
	"amount" numeric NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"method" "payment_method" DEFAULT 'cash' NOT NULL,
	"remarks" varchar,
	"is_refunded" boolean DEFAULT false,
	"refunded_amount" numeric,
	"refunded_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"role" varchar DEFAULT 'authenticated',
	"deleted_at" timestamp with time zone,
	"deletion_scheduled_for" timestamp with time zone,
	"deletion_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid,
	"enrollment_id" uuid,
	"user_id" uuid,
	"reason" varchar NOT NULL,
	"amount" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "refunds" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_deletion_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"deleted_at" timestamp with time zone NOT NULL,
	"deleted_by" uuid NOT NULL,
	"restored_at" timestamp with time zone,
	"restored_by" uuid,
	"deletion_reason" text NOT NULL,
	"scheduled_deletion_date" timestamp with time zone,
	"email_notification_sent" boolean DEFAULT false NOT NULL,
	"restoration_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_deletion_history" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_course_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."course_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_contact_replies" ADD CONSTRAINT "customer_contact_replies_contact_request_id_customer_contact_requests_id_fk" FOREIGN KEY ("contact_request_id") REFERENCES "public"."customer_contact_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_intake_id_intakes_id_fk" FOREIGN KEY ("intake_id") REFERENCES "public"."intakes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intakes" ADD CONSTRAINT "intakes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_deletion_history" ADD CONSTRAINT "user_deletion_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_deletion_history" ADD CONSTRAINT "user_deletion_history_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_deletion_history" ADD CONSTRAINT "user_deletion_history_restored_by_users_id_fk" FOREIGN KEY ("restored_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "anyone can read courses categories" ON "course_categories" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage courses categories" ON "course_categories" AS PERMISSIVE FOR ALL TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "anyone can read courses" ON "courses" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage courses" ON "courses" AS PERMISSIVE FOR ALL TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "service_role can select customer contact replies" ON "customer_contact_replies" AS PERMISSIVE FOR SELECT TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "service_role can insert customer contact replies" ON "customer_contact_replies" AS PERMISSIVE FOR INSERT TO "service_role" WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "service_role can update customer contact replies" ON "customer_contact_replies" AS PERMISSIVE FOR UPDATE TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "service_role can delete customer contact replies" ON "customer_contact_replies" AS PERMISSIVE FOR DELETE TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "anyone can insert contact requests" ON "customer_contact_requests" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "admin can view all contact requests" ON "customer_contact_requests" AS PERMISSIVE FOR SELECT TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "admin can update contact requests" ON "customer_contact_requests" AS PERMISSIVE FOR UPDATE TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "admin can delete contact requests" ON "customer_contact_requests" AS PERMISSIVE FOR DELETE TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "admin can view all email logs" ON "email_logs" AS PERMISSIVE FOR SELECT TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "system can insert email logs" ON "email_logs" AS PERMISSIVE FOR INSERT TO "service_role" WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "admin can update email logs" ON "email_logs" AS PERMISSIVE FOR UPDATE TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "admin can delete email logs" ON "email_logs" AS PERMISSIVE FOR DELETE TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "authenticated users can view own enrollments" ON "enrollments" AS PERMISSIVE FOR SELECT TO public USING ((auth.jwt() ->> 'role') = 'authenticated' AND "enrollments"."user_id" = auth.uid());--> statement-breakpoint
CREATE POLICY "authenticated users can create enrollments" ON "enrollments" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.jwt() ->> 'role') = 'authenticated');--> statement-breakpoint
CREATE POLICY "admin can manage courses" ON "enrollments" AS PERMISSIVE FOR ALL TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "anyone can read intakes" ON "intakes" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage intakes" ON "intakes" AS PERMISSIVE FOR ALL TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "users can create their own payments" ON "payments" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.jwt() ->> 'role') = 'authenticated' AND "payments"."enrollment_id" IN (
            SELECT id FROM enrollments WHERE user_id = auth.uid()
          ));--> statement-breakpoint
CREATE POLICY "users can view their own payments" ON "payments" AS PERMISSIVE FOR SELECT TO public USING ((auth.jwt() ->> 'role') = 'authenticated' AND "payments"."enrollment_id" IN (
            SELECT id FROM enrollments WHERE user_id = auth.uid()
          ));--> statement-breakpoint
CREATE POLICY "admin can manage payments" ON "payments" AS PERMISSIVE FOR ALL TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "anyone can insert profile" ON "profiles" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "User can view own profile" ON "profiles" AS PERMISSIVE FOR SELECT TO public USING (auth.uid() = "profiles"."id");--> statement-breakpoint
CREATE POLICY "User can update own profile" ON "profiles" AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = "profiles"."id");--> statement-breakpoint
CREATE POLICY "admin can manage profile" ON "profiles" AS PERMISSIVE FOR ALL TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "users can create their own refund requests" ON "refunds" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.jwt() ->> 'role') = 'authenticated' AND "refunds"."user_id" = auth.uid());--> statement-breakpoint
CREATE POLICY "users can view their own refund requests" ON "refunds" AS PERMISSIVE FOR SELECT TO public USING ((auth.jwt() ->> 'role') = 'authenticated' AND "refunds"."user_id" = auth.uid());--> statement-breakpoint
CREATE POLICY "admin can manage intakes" ON "refunds" AS PERMISSIVE FOR ALL TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "admin can manage user deletion history" ON "user_deletion_history" AS PERMISSIVE FOR ALL TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');