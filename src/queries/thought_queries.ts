import { getThoughts } from '@/data/thought';
import { fromLocalStorage } from '@/lib/utils';
import { ISituation, IThought, IThoughtProperties } from '@/utils/interfaces';
import { keepPreviousData, queryOptions, } from '@tanstack/react-query';

type TThoughts = {thoughts: IThought[], situation: ISituation, length: number};

type TInputThought = Omit<IThought, 'id' | 'created_at' | 'updated_at'>;

type TUpdateThought = {
  id: number;
  name?: string;
  strength?: number;
};

type TDeleteThought = {
  id: number;
};

const baseUrl = process.env.BETTER_AUTH_URL ? process.env.BETTER_AUTH_URL: 'http://localhost:3000';


const getThoughts_ = async (
  { page = 1, limit = 3, situation_id }: { page: number; limit: number; situation_id: string },
  options: IThoughtProperties,
): Promise<TThoughts> => {
  const query = Object.entries(options)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    )
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')

  const res = await fetch(
    `${baseUrl}/api/thoughts?situation_id=${situation_id}&page=${page}&limit=${limit}${query ? `&${query}` : ""}`,
    { headers: { "x-crypto-key": fromLocalStorage("key") || "" } },
  );
  const data = await res.json()

  if (!res.ok) {
    throw {
      status: res.status,
      message: data.error ?? 'Request failed',
      details: data.details,
    }
  }

  return data;
}

// mutation function to add new thought
export const addThought = async (item: TInputThought) => {
  const res = await fetch(`${baseUrl}/api/thoughts`, {
    method: "POST",
    body: JSON.stringify(item),
    headers: { "x-crypto-key": fromLocalStorage('key') || "" }
  });

  const data = await res.json()

  if (!res.ok) {
    throw {
      status: res.status,
      message: data.error ?? 'Request failed',
      details: data.details ?? 'Error',
    }
  }

  return data;
};

// mutation function to update thought
export const updateThought = async (item: TUpdateThought) => {
  const res = await fetch(`${baseUrl}/api/thoughts`, {
    method: "PUT",
    body: JSON.stringify(item),
    headers: { "x-crypto-key": fromLocalStorage('key') || "" }
  });

  const data = await res.json()

  if (!res.ok) {
    throw {
      status: res.status,
      message: data.error ?? 'Request failed',
      details: data.details ?? 'Error',
    }
  }

  return data;
};

// mutation function to delete thought
export const deleteThought = async (item: TDeleteThought) => {
  const res = await fetch(`${baseUrl}/api/thoughts`, {
    method: "DELETE",
    body: JSON.stringify(item),
    headers: { "x-crypto-key": fromLocalStorage('key') || "" }
  });

  const data = await res.json()

  if (!res.ok) {
    throw {
      status: res.status,
      message: data.error ?? 'Request failed',
      details: data.details ?? 'Error',
    }
  }

  return data;
};

export function thoughtsOptions(page: number, limit: number, situation_id: string, options: IThoughtProperties) {
  return queryOptions({
    queryKey: ['thoughts', page, limit],
    queryFn: () => getThoughts({ page, limit, situation_id }, options),
    placeholderData: keepPreviousData,
  });
}