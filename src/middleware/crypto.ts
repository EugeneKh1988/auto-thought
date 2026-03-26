//import { auth } from "@/lib/auth";
import { createMiddleware } from "@tanstack/react-start";
import crypto from "crypto";

const ALGO = "aes-256-gcm";

export const cryptoMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    //const KEY = crypto.scryptSync(process.env.DB_KEY!, "salt", 32);
    const strKey:string | null = request.headers.get("x-crypto-key");
    
    if (!strKey) {
      //const headers = request.headers;
      /* const session = await auth.api.getSession({ headers });
      if (session) {
        await auth.api.revokeSessions({ headers });
      } */
      return new Response(
        JSON.stringify({
          error: "Access denied",
          details: "Неправильный ключ",
        }),
        { status: 403 },
      );
      //throw Error("Неправильный ключ");
    }
    const KEY: Buffer = crypto.scryptSync(strKey, "salt", 32);

    function encrypt(text: string) {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(ALGO, KEY, iv);

      const encrypted = Buffer.concat([
        cipher.update(text, "utf8"),
        cipher.final(),
      ]);

      const tag = cipher.getAuthTag();

      return Buffer.concat([iv, tag, encrypted]).toString("base64");
    }

    function decrypt(data: string) {
      const buffer = Buffer.from(data, "base64");

      const iv = buffer.subarray(0, 12);
      const tag = buffer.subarray(12, 28);
      const text = buffer.subarray(28);

      const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
      decipher.setAuthTag(tag);

      return Buffer.concat([decipher.update(text), decipher.final()]).toString(
        "utf8",
      );
    }

    return next({
      context: {
        crypto: {
          encrypt,
          decrypt,
        },
      },
    });
  }
);