import { useAuthStore } from "@/store/authStore";
import { invoke } from "@tauri-apps/api/core";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decryptFields<T extends Record<string, any>>(
  data: T[],
  fields: (keyof T)[],
  decrypt: (v: string) => string,
): T[] {
  return data.map((item) => {
    const copy = { ...item };

    for (const key of fields) {
      const value = copy[key];

      if (typeof value === "string" && value.length > 0) {
        try {
          copy[key] = decrypt(value) as T[keyof T];
        } catch (error) {
          copy[key] = "Ошибка расшифровки данных" as T[keyof T];
        }
      }
    }

    return copy;
  });
}

export async function asyncDecryptFields<T extends Record<string, any>>(
  data: T[],
  fields: (keyof T)[],
  decrypt: (v: string) => Promise<string>,
): Promise<T[]> {
  return await Promise.all(
    data.map(async (item) => {
      const copy = { ...item };

      for (const key of fields) {
        const value = copy[key];

        if (typeof value === "string" && value.length > 0) {
          try {
            copy[key] = (await decrypt(value)) as T[keyof T];
          } catch (error) {
            copy[key] = "Ошибка расшифровки данных" as T[keyof T];
          }
        }
      }

      return copy;
    }),
  );
}

// get from localStorage
export function fromLocalStorage<StorageType>(key: string): StorageType | null {
  // null if run on server
  if (typeof window === "undefined") {
    return null;
  }
  const itemStr = localStorage?.getItem(key);
  if (itemStr) {
    const item: StorageType = JSON.parse(itemStr);
    return item;
  } else {
    return null;
  }
}

// set data to localStorage
export function toLocalStorage<StorageType>(key: string, data: StorageType) {
  // if run on server
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(key, JSON.stringify(data));
}

// delete data from localStorage
export function delFromLocalStorage(key: string) {
  // if run on server
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(key);
}

export async function getUserId() {
  const token = fromLocalStorage<string>("token");

  if (token) {
    const user_id = await invoke<number | null>("get_user", {
      token,
    });
    return user_id;
  }
  return null;
}

export async function isAuth() {
  const token = fromLocalStorage<string>("token");

  if (token) {
    const user_id = await invoke<number | null>("get_user", {
      token,
    });

    //console.log("Token is", token);
    //console.log("userID is", user_id);

    processAuthByUserId(user_id);

    return user_id !== null ? true : false;
  }

  processAuthByUserId(null);
  return false;
}

export function processAuthByUserId(user_id: number | null) {
  if(user_id === null) {
    useAuthStore.getState().setLogged(false);
  }
}

export async function logout() {
  const token = fromLocalStorage<string>("token");

  if (token) {
    try {
      await invoke("logout", {
        token,
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}