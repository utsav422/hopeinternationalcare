ALTER TABLE "user_deletion_history" DROP CONSTRAINT "user_deletion_history_deleted_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_deletion_history" DROP CONSTRAINT "user_deletion_history_restored_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_deletion_history" DROP COLUMN "deleted_by";--> statement-breakpoint
ALTER TABLE "user_deletion_history" DROP COLUMN "restored_by";