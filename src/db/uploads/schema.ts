import { relations } from "drizzle-orm";
import { pgTable, uuid, text, timestamp, bigint, boolean, index } from "drizzle-orm/pg-core";
import { user } from "../users/schema";

export const uploads = pgTable(
  "uploads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["demo", "video", "image"] }).notNull(),
    url: text("url").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    size: bigint("size", { mode: "number" }).notNull(), // File size in bytes
    title: text("title"),
    description: text("description"),
    demo: boolean("demo").default(false).notNull(), // Whether this is a demo
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [
    index("uploads_user_id_idx").on(table.userId),
    index("uploads_type_idx").on(table.type),
    index("uploads_demo_idx").on(table.demo),
  ]
);

export const uploadsRelations = relations(uploads, ({ one }) => ({
  user: one(user, {
    fields: [uploads.userId],
    references: [user.id],
  }),
}));
