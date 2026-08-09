import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const bundleProgress = sqliteTable("bundle_progress", {
  itemId: text("item_id").primaryKey(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
});
