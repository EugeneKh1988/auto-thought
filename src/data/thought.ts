import db from "@/db/database.client";
import { situation, thought } from "@/db/schema";
import { cryptoFn } from "@/lib/crypto";
import { asyncDecryptFields } from "@/lib/utils";
import { IThought, IThoughtProperties } from "@/utils/interfaces";
import { createClientOnlyFn } from "@tanstack/react-start";
import { eq, like, SQL, and, sql } from "drizzle-orm";

type TInputThought = Omit<IThought, "id" | "created_at" | "updated_at">;

type TUpdateThought = {
  id: number;
  name?: string;
  strength?: number;
};

type TDeleteThought = {
  id: number;
};

export const getThoughts = createClientOnlyFn(
  async (
    nav: { page: number; limit: number; situation_id: string },
    options: IThoughtProperties,
  ) => {
    const { page, limit, situation_id } = nav;
    const { name, creation_date } = options;

    const user_id = "Ud16DVUbRqbKqRYYH5KLXhcikQHTjGXW";

    // checking authority
    const situationData = await db
      .select()
      .from(situation)
      .where(eq(situation.id, Number(situation_id)))
      .limit(1);

    if (situationData && situationData.length > 0) {
      if (situationData[0].user_id != user_id) {
        throw {
          error: "Access denied",
          details: "It's not belong to you",
        };
      }
    }

    const filters: SQL[] = [];
    name ? filters.push(like(thought.name, `%${name}%`)) : null;
    situation_id
      ? filters.push(eq(thought.situation_id, Number(situation_id)))
      : null;
    creation_date
      ? filters.push(like(thought.created_at, `${creation_date}%`))
      : null;

    const res = await db
      .select()
      .from(thought)
      .where(and(...filters))
      .limit(limit)
      .offset((page - 1) * limit);

    const count = await db
      .select({
        total: sql<string>`CAST(count(*) AS TEXT)`.as("total"),
      })
      .from(thought)
      .where(and(...filters));

    const crypto = await cryptoFn();

    return {
      thoughts: await asyncDecryptFields(res, ["name"], crypto.decrypt),
      situation:
        situationData && situationData.length > 0
          ? (
              await asyncDecryptFields(
                situationData,
                ["name", "description"],
                crypto.decrypt,
              )
            )[0]
          : {},
      length: count && count.length > 0 ? Number(count[0].total) : 0,
    };
  },
);

export const addThought = createClientOnlyFn(async (item: TInputThought) => {
  const { name, strength, situation_id } = item;
  const strDate = new Date().toISOString();

  const user_id = "Ud16DVUbRqbKqRYYH5KLXhcikQHTjGXW";

  // checking authority
  const situationData = await db
    .select()
    .from(situation)
    .where(eq(situation.id, situation_id))
    .limit(1);

  if (situationData && situationData.length > 0) {
    if (situationData[0].user_id != user_id) {
      throw {
        error: "Access denied",
        details: "It's not belong to you",
      };
    }
  }

  const crypto = await cryptoFn();

  await db
    .insert(thought)
    .values({
      name: await crypto.encrypt(name),
      strength,
      situation_id,
      created_at: strDate,
      updated_at: strDate,
    })
    .onConflictDoNothing();

  return true;
});

export const updateThought = createClientOnlyFn(
  async (item: TUpdateThought) => {
    const { name, strength, id } = item;

    const user_id = "Ud16DVUbRqbKqRYYH5KLXhcikQHTjGXW";

    // checking authority
    const situationData = await db
      .select()
      .from(situation)
      .leftJoin(thought, eq(situation.id, thought.situation_id))
      .where(eq(thought.id, id))
      .limit(1);

    if (situationData && situationData.length > 0) {
      if (situationData[0].situation.user_id != user_id) {
        throw {
          error: "Access denied",
          details: "It's not belong to you",
        };
      }
    }

    const crypto = await cryptoFn();

    // updating
    await db
      .update(thought)
      .set({
        ...(name !== null ? { name: await crypto.encrypt(name || "") } : {}),
        ...(strength !== null ? { strength } : {}),
        updated_at: new Date().toISOString(),
      })
      .where(eq(thought.id, id));

    return true;
  },
);

export const deleteThought = createClientOnlyFn(
  async (item: TDeleteThought) => {
    const { id } = item;

    const user_id = "Ud16DVUbRqbKqRYYH5KLXhcikQHTjGXW";

    // checking authority
    const situationData = await db
      .select()
      .from(situation)
      .leftJoin(thought, eq(situation.id, thought.situation_id))
      .where(eq(thought.id, id))
      .limit(1);

    if (situationData && situationData.length > 0) {
      if (situationData[0].situation.user_id != user_id) {
        throw {
          error: "Access denied",
          details: "It's not belong to you",
        };
      }
    }

    await db.delete(thought).where(eq(thought.id, id));

    return true;
  },
);