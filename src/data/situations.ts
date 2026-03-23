import db from "@/db/database.client";
import { situation } from "@/db/schema";
import { cryptoFn } from "@/lib/crypto";
import { asyncDecryptFields } from "@/lib/utils";
import { ISituation, ISituationProperties } from "@/utils/interfaces";
import { createClientOnlyFn } from "@tanstack/react-start";
import { and, eq, like, sql, SQL } from "drizzle-orm";
import z from "zod";

type TInputSituation = Omit<
  ISituation,
  "id" | "user_id" | "created_at" | "updated_at"
>;

type TUpdateSituation = {
  id: number;
  name?: string;
  description?: string;
};

type TDeleteSituation = {
  id: number;
};

// schema for getting data
const searchSituationsSchema = z.object({
  page: z
    .number()
    .optional()
    .transform((v) => Number(v ?? 1))
    .refine((v) => Number.isInteger(v) && v && v > 0, {
      message: "page must be a positive integer",
    }),

  limit: z
    .number()
    .optional()
    .transform((v) => Number(v ?? 10))
    .refine((v) => v > 0 && v <= 20, {
      message: "limit must be between 1 and 20",
    }),
  name: z
    .string()
    .optional()
    .transform((v) => String(v ?? ""))
    .refine((v) => v.length >= 0 && v.length <= 255, {
      message: "name must be between 0 and 255",
    }),
  creation_date: z
    .string()
    .optional()
    .transform((v) => String(v ?? ""))
    .refine((v) => v.length >= 0 && v.length <= 50, {
      message: "creation date must be between 0 and 50",
    }),
});

export const getSituations = createClientOnlyFn(
  async (
    nav: { page: number; limit: number },
    options: ISituationProperties,
  ) => {
    const result = searchSituationsSchema.safeParse({
      ...nav,
      ...options,
    });

    if (!result.success) {
      throw {
        message: result.error.message ?? "Request failed",
        details: result.error.issues,
      };
    }

    const { name, creation_date, page, limit } = result.data;

    const user_id = "Ud16DVUbRqbKqRYYH5KLXhcikQHTjGXW";

    const filters: SQL[] = [];
    name ? filters.push(like(situation.name, `%${name}%`)) : null;
    user_id ? filters.push(eq(situation.user_id, user_id)) : null;
    creation_date
      ? filters.push(like(situation.created_at, `${creation_date}%`))
      : null;

    const res = await db
      .select()
      .from(situation)
      .where(and(...filters))
      .limit(limit)
      .offset((page - 1) * limit);

    //const length = await db.$count(situation, and(...filters));
    //const length = await db.select({ count: count() }).from(situation).where(and(...filters));
    const count = await db
      .select({
        total: sql<string>`CAST(count(*) AS TEXT)`.as("total"),
      })
      .from(situation)
      .where(eq(situation.user_id, user_id));

    const crypto = await cryptoFn();

    return {
      situations: await asyncDecryptFields(
        res,
        ["name", "description"],
        crypto.decrypt,
      ),
      length: count && count.length > 0 ? Number(count[0].total) : 0,
    };
  },
);

export const addSituation = createClientOnlyFn(
  async (item: TInputSituation) => {
    const { name, description } = item;
    const strDate = new Date().toISOString();

    const user_id = "Ud16DVUbRqbKqRYYH5KLXhcikQHTjGXW";

    const crypto = await cryptoFn();

    await db
      .insert(situation)
      .values({
        name: await crypto.encrypt(name),
        description: await crypto.encrypt(description || ""),
        user_id,
        created_at: strDate,
        updated_at: strDate,
      })
      .onConflictDoNothing();
    
    return true;
  }
);

export const updateSituation = createClientOnlyFn(
  async (item: TUpdateSituation) => {
    const { id, name, description } = item;

    const user_id = "Ud16DVUbRqbKqRYYH5KLXhcikQHTjGXW";

    const crypto = await cryptoFn();

    // updating
    await db
      .update(situation)
      .set({
        ...(name !== null ? { name: await crypto.encrypt(name || "") } : {}),
        ...(description !== null
          ? { description: await crypto.encrypt(description || "") }
          : {}),
        updated_at: new Date().toISOString(),
      })
      .where(and(eq(situation.user_id, user_id), eq(situation.id, id)));

    return true;
  }
);

export const deleteSituation = createClientOnlyFn(
  async (item: TDeleteSituation) => {
    const { id } = item;

    const user_id = "Ud16DVUbRqbKqRYYH5KLXhcikQHTjGXW";

    await db
      .delete(situation)
      .where(and(eq(situation.id, id), eq(situation.user_id, user_id)));

    return true;
  }
);