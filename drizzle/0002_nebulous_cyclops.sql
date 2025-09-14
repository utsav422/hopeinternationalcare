CREATE TABLE "affiliations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "affiliations_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "affiliations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "affiliation_id" uuid;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "course_highlights" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "course_overview" text;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_affiliation_id_affiliations_id_fk" FOREIGN KEY ("affiliation_id") REFERENCES "public"."affiliations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "description";--> statement-breakpoint
CREATE POLICY "anyone can read affiliations" ON "affiliations" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "admin can manage affiliations" ON "affiliations" AS PERMISSIVE FOR ALL TO "service_role" USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');