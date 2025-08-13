DROP POLICY "anyone can read courses" ON "enrollments" CASCADE;--> statement-breakpoint
DROP POLICY "authenticated users can create enrollments" ON "enrollments" CASCADE;--> statement-breakpoint
DROP POLICY "User can update own profile" ON "profiles" CASCADE;--> statement-breakpoint
CREATE POLICY "authenticated users can create enrollments" ON "enrollments" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.jwt() ->> 'role') = 'authenticated');--> statement-breakpoint
CREATE POLICY "User can update own profile" ON "profiles" AS PERMISSIVE FOR UPDATE TO public USING (auth.uid() = "profiles"."id");--> statement-breakpoint
ALTER POLICY "admin can manage courses" ON "courses" TO service_role USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
ALTER POLICY "admin can manage intakes" ON "intakes" TO service_role USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
ALTER POLICY "admin can manage payments" ON "payments" TO service_role USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
ALTER POLICY "admin can manage profile" ON "profiles" TO service_role USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');--> statement-breakpoint
ALTER POLICY "admin can manage intakes" ON "refunds" TO service_role USING ((auth.jwt() ->> 'role') = 'service_role') WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');