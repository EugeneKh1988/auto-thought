import { db } from '@/db';
import { situation, thought } from '@/db/schema';
import { auth } from '@/lib/auth';
import { decryptFields } from '@/lib/utils';
import { cryptoMiddleware } from '@/middleware/crypto';
import { createFileRoute } from '@tanstack/react-router';
import { eq, like, SQL, and } from 'drizzle-orm';
import z from 'zod';

// schema for getting data
const searchThoughtSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => Number(v ?? 1))
    .refine((v) => Number.isInteger(v) && v && v > 0, {
      message: "page must be a positive integer",
    }),
  limit: z
    .string()
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
    situation_id: z
    .string()
    .transform((v) => Number(v ?? 0))
    .refine((v) => Number.isInteger(v) && v && v > 0, {
      message: "situation_id must be a positive integer",
    }),
});

// schema for adding a row
const addThoughtSchema = z.object({
  name: z
    .string()
    .transform((v) => String(v ?? ""))
    .refine((v) => v.length > 0 && v.length <= 1000, {
      message: "name must be between 1 and 1000",
    }),
  strength: z
    .number()
    .optional()
    .transform((v) => Number(v ?? 0))
    .refine((v) => v >= 0 && v <= 100, {
      message: "strength must be between 0 and 100",
    }),
  situation_id: z
    .number()
    .transform((v) => Number(v ?? 0))
    .refine((v) => Number.isInteger(v) && v && v > 0, {
      message: "situation_id must be a positive integer",
    }),
});

// schema for updating a row
const updateThoughtSchema = z.object({
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
  strength: z
    .number()
    .optional()
    .transform((v) => Number(v ?? 0))
    .refine((v) => v >= 0 && v <= 100, {
      message: "strength must be between 0 and 100",
    }),
});

// schema for deleting record
const deleteThoughtSchema = z.object({
  id: z
    .number()
    .transform((v) => Number(v ?? 0))
    .refine((v) => Number.isInteger(v) && v && v > 0, {
      message: "id must be a positive integer",
    }),
});

export const Route = createFileRoute("/api/thoughts")({
  server: {
    middleware: [cryptoMiddleware],
    handlers: {
      GET: async ({ request, context }) => {
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

        const result = searchThoughtSchema.safeParse(
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

        const { name, creation_date, page, limit, situation_id } = result.data;

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

        const filters: SQL[] = [];
        name ? filters.push(like(thought.name, `%${name}%`)) : null;
        situation_id ? filters.push(eq(thought.situation_id, situation_id)) : null;
        creation_date
          ? filters.push(like(thought.created_at, `${creation_date}%`))
          : null;

        const res = await db
          .select()
          .from(thought)
          .where(and(...filters))
          .limit(limit)
          .offset((page - 1) * limit);

        const length = await db.$count(thought, and(...filters));

        return Response.json({
          thoughts: decryptFields(res, ["name"], context.crypto.decrypt),
          length,
          situation:
            situationData && situationData.length > 0
              ? decryptFields(
                  situationData,
                  ["name", "description"],
                  context.crypto.decrypt,
                )[0]
              : {},
        });
      },

      POST: async ({ request, context }) => {
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

        const result = addThoughtSchema.safeParse(body);

        if (!result.success) {
          return new Response(
            JSON.stringify({
              error: "Invalid post data",
              details: result.error.issues,
            }),
            { status: 400 },
          );
        }

        const { name, strength, situation_id } = result.data;
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

        await db
          .insert(thought)
          .values({ name: context.crypto.encrypt(name), strength, situation_id, created_at: strDate, updated_at: strDate })
          .onConflictDoNothing();

        return Response.json({ status: "Ok" });
      },

      // update row by id and user_id
      PUT: async ({ request, context }) => {
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

        const result = updateThoughtSchema.safeParse(body);

        if (!result.success) {
          return new Response(
            JSON.stringify({
              error: "Invalid put data",
              details: result.error.issues,
            }),
            { status: 400 },
          );
        }

        const { id, name, strength } = result.data;

        // checking authority
        const situationData = await db
          .select()
          .from(situation)
          .leftJoin(thought, eq(situation.id, thought.situation_id))
          .where(eq(thought.id, id))
          .limit(1);
        
        if (situationData && situationData.length > 0) {
          if (situationData[0].situation.user_id != user_id) {
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
          .update(thought)
          .set({
            ...(name !== null ? { name: context.crypto.encrypt(name) } : {}),
            ...(strength !== null ? { strength } : {}),
            updated_at: new Date().toISOString(),
          })
          .where(eq(thought.id, id));

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

        const result = deleteThoughtSchema.safeParse(body);

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
        const situationData = await db
          .select()
          .from(situation)
          .leftJoin(thought, eq(situation.id, thought.situation_id))
          .where(eq(thought.id, id))
          .limit(1);
        
        if (situationData && situationData.length > 0) {
          if (situationData[0].situation.user_id != user_id) {
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
          .delete(thought)
          .where(eq(thought.id, id));

        return Response.json({ status: "Ok" });
      },
    },
  },
});
