import { db } from '@/db';
import { proof, situation, thought } from '@/db/schema';
import { auth } from '@/lib/auth';
import { createFileRoute } from '@tanstack/react-router';
import { eq } from 'drizzle-orm';
import z from 'zod';

// schema for getting data
const searchProofsSchema = z.object({
    situation_id: z
    .string()
    .transform((v) => Number(v ?? 0))
    .refine((v) => Number.isInteger(v) && v && v > 0, {
      message: "situation_id must be a positive integer",
    }),
    thought_id: z
    .string()
    .transform((v) => Number(v ?? 0))
    .refine((v) => Number.isInteger(v) && v && v > 0, {
      message: "thought_id must be a positive integer",
    }),
});

// schema for adding a row
const addProofSchema = z.object({
  name: z
    .string()
    .transform((v) => String(v ?? ""))
    .refine((v) => v.length > 0 && v.length <= 1000, {
      message: "name must be between 1 and 1000",
    }),
  situation_id: z
    .number()
    .transform((v) => Number(v ?? 0))
    .refine((v) => Number.isInteger(v) && v && v > 0, {
      message: "situation_id must be a positive integer",
    }),
  thought_id: z
    .number()
    .transform((v) => Number(v ?? 0))
    .refine((v) => Number.isInteger(v) && v && v > 0, {
      message: "thought_id must be a positive integer",
    }),
});

// schema for updating a row
const updateProofSchema = z.object({
  id: z
    .number()
    .transform((v) => Number(v ?? 0))
    .refine((v) => Number.isInteger(v) && v && v > 0, {
      message: "id must be a positive integer",
    }),
  name: z
    .string()
    .transform((v) => String(v ?? ""))
    .refine((v) => v.length > 0 && v.length <= 1000, {
      message: "name must be between 1 and 1000",
    }),
});

// schema for deleting record
const deleteProofSchema = z.object({
  id: z
    .number()
    .transform((v) => Number(v ?? 0))
    .refine((v) => Number.isInteger(v) && v && v > 0, {
      message: "id must be a positive integer",
    }),
});

export const Route = createFileRoute("/api/proofs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // get user id
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session) {
          return new Response(
            JSON.stringify({
              error: "Access denied",
              details: "Unknown user",
            }),
            { status: 403 },
          );
        }
        const user_id = session ? session?.user.id : "";

        // get search params
        const url = new URL(request.url);

        const result = searchProofsSchema.safeParse(
          Object.fromEntries(url.searchParams),
        );

        if (!result.success) {
          return new Response(
            JSON.stringify({
              error: "Invalid search params",
              details: result.error.issues,
            }),
            { status: 400 },
          );
        }

        const { thought_id, situation_id } = result.data;

        // checking authority
        const situationData = await db
          .select()
          .from(situation)
          .where(eq(situation.id, situation_id))
          .limit(1);
        
        if (situationData && situationData.length > 0) {
          if (situationData[0].user_id != user_id) {
            return new Response(
              JSON.stringify({
                error: "Access denied",
                details: "It's not belong to you",
              }),
              { status: 403 },
            );
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
            return new Response(
              JSON.stringify({
                error: "Access denied",
                details: "Thought is not belong to situation",
              }),
              { status: 403 },
            );
          }
        }

        const res = await db
          .select()
          .from(proof)
          .where(eq(proof.thought_id, thought_id))

        const length = await db.$count(proof, eq(proof.thought_id, thought_id));

        return Response.json({
          proofs: res,
          length,
          thought:
            thoughtData && thoughtData.length > 0 ? thoughtData[0] : {},
        });
      },

      POST: async ({ request }) => {
        // get user id
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session) {
          return new Response(
            JSON.stringify({
              error: "Access denied",
              details: "Unknown user",
            }),
            { status: 403 },
          );
        }
        const user_id = session?.user.id;

        const body = await request.json();
        //console.log(body)

        const result = addProofSchema.safeParse(body);

        if (!result.success) {
          return new Response(
            JSON.stringify({
              error: "Invalid post data",
              details: result.error.issues,
            }),
            { status: 400 },
          );
        }

        const { name, situation_id, thought_id } = result.data;
        const strDate = new Date().toISOString();

        // checking authority
        const situationData = await db
          .select()
          .from(situation)
          .where(eq(situation.id, situation_id))
          .limit(1);
        
        if (situationData && situationData.length > 0) {
          if (situationData[0].user_id != user_id) {
            return new Response(
              JSON.stringify({
                error: "Access denied",
                details: "It's not belong to you",
              }),
              { status: 403 },
            );
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
            return new Response(
              JSON.stringify({
                error: "Access denied",
                details: "Thought is not belong to situation",
              }),
              { status: 403 },
            );
          }
        }

        await db
          .insert(proof)
          .values({ name, thought_id, created_at: strDate, updated_at: strDate })
          .onConflictDoNothing();

        return Response.json({ status: "Ok" });
      },

      // update row by id and user_id
      PUT: async ({ request }) => {
        // get user id
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session) {
          return new Response(
            JSON.stringify({
              error: "Access denied",
              details: "Unknown user",
            }),
            { status: 403 },
          );
        }
        const user_id = session?.user.id;

        const body = await request.json();
        //console.log(body)

        const result = updateProofSchema.safeParse(body);

        if (!result.success) {
          return new Response(
            JSON.stringify({
              error: "Invalid put data",
              details: result.error.issues,
            }),
            { status: 400 },
          );
        }

        const { id, name } = result.data;

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
            return new Response(
              JSON.stringify({
                error: "Access denied",
                details: "It's not belong to you",
              }),
              { status: 403 },
            );
          }
        }
        
        // updating
        await db
          .update(proof)
          .set({
            ...(name !== null ? { name } : {}),
            updated_at: new Date().toISOString(),
          })
          .where(eq(proof.id, id));

        return Response.json({ status: "Ok" });
      },

      // delete row by id and user_id
      DELETE: async ({ request }) => {
        // get user id
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session) {
          return new Response(
            JSON.stringify({
              error: "Access denied",
              details: "Unknown user",
            }),
            { status: 403 },
          );
        }
        const user_id = session?.user.id;

        const body = await request.json();
        //console.log(body)

        const result = deleteProofSchema.safeParse(body);

        if (!result.success) {
          return new Response(
            JSON.stringify({
              error: "Invalid post data",
              details: result.error.issues,
            }),
            { status: 400 },
          );
        }

        const { id } = result.data;

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
            return new Response(
              JSON.stringify({
                error: "Access denied",
                details: "It's not belong to you",
              }),
              { status: 403 },
            );
          }
        }

        await db
          .delete(proof)
          .where(eq(proof.id, id));

        return Response.json({ status: "Ok" });
      },
    },
  },
});
