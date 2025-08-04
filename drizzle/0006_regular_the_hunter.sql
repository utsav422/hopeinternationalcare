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
ALTER TABLE "course_categories" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "enrollments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "intakes" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "refunds" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE POLICY "anyone can insert contact requests" ON "customer_contact_requests" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "admin can view all contact requests" ON "customer_contact_requests" AS PERMISSIVE FOR SELECT TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "admin can update contact requests" ON "customer_contact_requests" AS PERMISSIVE FOR UPDATE TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
CREATE POLICY "admin can delete contact requests" ON "customer_contact_requests" AS PERMISSIVE FOR DELETE TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role');