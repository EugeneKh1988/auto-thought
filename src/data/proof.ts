import db from "@/db/database.client";
import { proof, situation, thought } from "@/db/schema";
import { cryptoFn } from "@/lib/crypto";
import { asyncDecryptFields } from "@/lib/utils";
import { createClientOnlyFn } from "@tanstack/react-start";
import { eq, sql } from "drizzle-orm";

type TInputProof = {
  name: string;
  proof_type: number;
  situation_id: number;
  thought_id: number;
};

type TUpdateProof = {
  id: number;
  name?: string;
  proof_type?: number;
};

type TDeleteProof = {
  id: number;
};

export const getProofs = createClientOnlyFn(
  async (options: { thought_id: string; situation_id: string }) => {
    const { thought_id, situation_id } = options;

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

    // checking thought
    const thoughtData = await db
      .select()
      .from(thought)
      .where(eq(thought.id, Number(thought_id)))
      .limit(1);

    if (thoughtData && thoughtData.length > 0) {
      if (thoughtData[0].situation_id != Number(situation_id)) {
        throw {
          error: "Access denied",
          details: "Thought is not belong to situation",
        };
      }
    }

    const res = await db
      .select()
      .from(proof)
      .where(eq(proof.thought_id, Number(thought_id)));

    const count = await db
      .select({
        total: sql<string>`CAST(count(*) AS TEXT)`.as("total"),
      })
      .from(proof)
      .where(eq(proof.thought_id, Number(thought_id)));

    const crypto = await cryptoFn();

    return {
      proofs: await asyncDecryptFields(res, ["name"], crypto.decrypt),
      length: count && count.length > 0 ? Number(count[0].total) : 0,
      thought:
        thoughtData && thoughtData.length > 0
          ? (await asyncDecryptFields(thoughtData, ["name"], crypto.decrypt))[0]
          : {},
    };
  },
);

export const addProof = createClientOnlyFn(async (item: TInputProof) => {
  const { name, situation_id, thought_id, proof_type } = item;
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

  // checking thought
  const thoughtData = await db
    .select()
    .from(thought)
    .where(eq(thought.id, thought_id))
    .limit(1);

  if (thoughtData && thoughtData.length > 0) {
    if (thoughtData[0].situation_id != situation_id) {
      throw {
        error: "Access denied",
        details: "Thought is not belong to situation",
      };
    }
  }

  const crypto = await cryptoFn();

  await db
    .insert(proof)
    .values({
      name: await crypto.encrypt(name),
      thought_id,
      proof_type,
      created_at: strDate,
      updated_at: strDate,
    })
    .onConflictDoNothing();

  return true;
});

export const updateProof = createClientOnlyFn(async (item: TUpdateProof) => {
  const { name, id, proof_type } = item;

  const user_id = "Ud16DVUbRqbKqRYYH5KLXhcikQHTjGXW";

  // checking authority
  const checkData = await db
    .select()
    .from(situation)
    .rightJoin(thought, eq(situation.id, thought.situation_id))
    .rightJoin(proof, eq(thought.id, proof.thought_id))
    .where(eq(proof.id, id))
    .limit(1);

  if (checkData && checkData.length > 0) {
    if (checkData[0].situation && checkData[0].situation.user_id != user_id) {
      throw {
        error: "Access denied",
        details: "It's not belong to you",
      };
    }
  }

  const crypto = await cryptoFn();

  // updating
  await db
    .update(proof)
    .set({
      ...(name !== null ? { name: await crypto.encrypt(name || "") } : {}),
      ...(proof_type !== null ? { proof_type } : {}),
      updated_at: new Date().toISOString(),
    })
    .where(eq(proof.id, id));

  return true;
});

export const deleteProof = createClientOnlyFn(async (item: TDeleteProof) => {
    const { id } = item;

    const user_id = "Ud16DVUbRqbKqRYYH5KLXhcikQHTjGXW";

    // checking authority
    const checkData = await db
      .select()
      .from(situation)
      .rightJoin(thought, eq(situation.id, thought.situation_id))
      .rightJoin(proof, eq(thought.id, proof.thought_id))
      .where(eq(proof.id, id))
      .limit(1);

    if (checkData && checkData.length > 0) {
      if (checkData[0].situation && checkData[0].situation.user_id != user_id) {
        throw {
          error: "Access denied",
          details: "It's not belong to you",
        };
      }
    }

    await db.delete(proof).where(eq(proof.id, id));
});