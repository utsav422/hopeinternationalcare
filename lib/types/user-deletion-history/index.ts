import { InferSelectModel } from "drizzle-orm";
import { userDeletionHistory } from "@/lib/db/schema/user-deletion-history";
import { UserBase } from "@/lib/types/user";
import { ColumnFiltersState } from "@tanstack/react-table";
import { z } from "zod";

export const UserDeletionHistoryCreateDataSchema = z.object({
  userId: z.string().min(1),
  deletionDate: z.string().min(1),
  reason: z.string().optional(),
  deletedBy: z.string().min(1),
});

export const UserDeletionHistoryUpdateDataSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  deletionDate: z.string().min(1),
  reason: z.string().optional(),
  deletedBy: z.string().min(1),
});

export type UserDeletionHistoryBase = InferSelectModel<
  typeof userDeletionHistory
>;
export type UserDeletionHistoryInsert = z.infer<
  typeof UserDeletionHistoryCreateDataSchema
>;
export type UserDeletionHistoryCreateData = z.infer<
  typeof UserDeletionHistoryCreateDataSchema
>;
export type UserDeletionHistoryUpdateData = z.infer<
  typeof UserDeletionHistoryUpdateDataSchema
>;

export type UserDeletionHistory = UserDeletionHistoryBase & {
  user: UserBase;
};

export type UserDeletionHistoryParams = {
  limit: number;
  offset: number;
  sort: "newest" | "oldest" | "name-asc" | "name-desc";
  filter: ColumnFiltersState;
};
