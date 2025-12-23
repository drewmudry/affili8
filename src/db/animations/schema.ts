import { relations } from "drizzle-orm";
import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "../users/schema";
import { avatars } from "../avatars/schema";
import { generations } from "../generations/schema";

export const animations = pgTable(
  "animations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    videoUrl: text("video_url"),
    prompt: text("prompt").notNull(), // Animation prompt text
    avatarId: uuid("avatar_id").references(() => avatars.id, { onDelete: 'set null' }).notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: 'set null' }),
    generationId: uuid("generation_id").references(() => generations.id, { onDelete: 'set null' }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("animations_userId_idx").on(table.userId),
    index("animations_avatarId_idx").on(table.avatarId),
    index("animations_generationId_idx").on(table.generationId),
  ]
);

export const animationsRelations = relations(animations, ({ one }) => ({
  // Relation to the owner
  user: one(user, {
    fields: [animations.userId],
    references: [user.id],
  }),

  // Relation to the avatar this animation is based on
  avatar: one(avatars, {
    fields: [animations.avatarId],
    references: [avatars.id],
  }),

  // Relation to the generation that created this animation
  generation: one(generations, {
    fields: [animations.generationId],
    references: [generations.id],
  }),
}));
