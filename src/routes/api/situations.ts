import { db } from '@/db';
import { situation } from '@/db/schema';
import { auth } from '@/lib/auth';
import { createFileRoute } from '@tanstack/react-router';
import { eq, like, SQL, and } from 'drizzle-orm';
import z from 'zod';

// schema for getting data
const searchSituationsSchema = z.object({
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
});

// schema for adding a row
const addSituationSchema = z.object({
  name: z
    .string()
    .transform((v) => String(v ?? ""))
    .refine((v) => v.length > 0 && v.length <= 255, {
      message: "name must be between 1 and 255",
    }),
  description: z
    .string()
    .optional()
    .transform((v) => String(v ?? ""))
    .refine((v) => v.length >= 0 && v.length <= 1000, {
      message: "description length must be between 0 and 1000",
    }),
});

// schema for updating a row
const updateSituationSchema = z.object({
  id: z
    .number()
    .transform((v) => Number(v ?? 0))
    .refine((v) => Number.isInteger(v) && v && v > 0, {
      message: "id must be a positive integer",
    }),
  name: z
    .string()
    .optional()
    .transform((v) => String(v ?? "") || null)
    .refine((v) => v && v.length >= 0 && v.length <= 255, {
      message: "name must be between 0 and 255",
    }),
  description: z
    .string()
    .optional()
    .transform((v) => String(v ?? "") || null)
    .refine((v) =>v && v.length >= 0 && v.length <= 1000, {
      message: "description length must be between 0 and 1000",
    }),
});

// schema for deleting record
const deleteSituationSchema = z.object({
  id: z
    .number()
    .transform((v) => Number(v ?? 0))
    .refine((v) => Number.isInteger(v) && v && v > 0, {
      message: "id must be a positive integer",
    }),
});

export const Route = createFileRoute("/api/situations")({
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

        const result = searchSituationsSchema.safeParse(
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

        const { name, creation_date, page, limit } = result.data;

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

        const length = await db.$count(situation, and(...filters));

        return Response.json({ situations: res, length });
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

        const result = addSituationSchema.safeParse(body);

        if (!result.success) {
          return new Response(
            JSON.stringify({
              error: "Invalid post data",
              details: result.error.issues,
            }),
            { status: 400 },
          );
        }

        const { name, description } = result.data;

        await db
          .insert(situation)
          .values({ name, description, user_id })
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

        const result = updateSituationSchema.safeParse(body);

        if (!result.success) {
          return new Response(
            JSON.stringify({
              error: "Invalid put data",
              details: result.error.issues,
            }),
            { status: 400 },
          );
        }

        const { id, name, description } = result.data;
        
        // updating
        await db
          .update(situation)
          .set({...(name !== null ? {name}: {}), ...(description !== null ? {description}: {})})
          .where(and(eq(situation.user_id, user_id), eq(situation.id, id)));

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

        const result = deleteSituationSchema.safeParse(body);

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

        await db
          .delete(situation)
          .where(and(eq(situation.id, id), eq(situation.user_id, user_id)));

        return Response.json({ status: "Ok" });
      },
    },
  },
});
