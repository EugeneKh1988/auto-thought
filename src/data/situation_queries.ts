import { fromLocalStorage } from '@/lib/utils';
import { ISituation, ISituationProperties } from '@/utils/interfaces';
import { keepPreviousData, queryOptions, } from '@tanstack/react-query';

type TSituations = {situations: ISituation[], length: number};

type TInputSituation = Omit<ISituation, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

type TUpdateSituation = {
  id: number;
  name?: string;
  description?: string;
};

type TDeleteSituation = {
  id: number;
};

const baseUrl = process.env.BETTER_AUTH_URL ? process.env.BETTER_AUTH_URL: 'http://localhost:3000';


const getSituations = async (
  { page = 1, limit = 3 }: { page: number; limit: number },
  options: ISituationProperties,
): Promise<TSituations> => {
  const query = Object.entries(options)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    )
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&')

  const res = await fetch(
    `${baseUrl}/api/situations?page=${page}&limit=${limit}${query ? `&${query}` : ""}`,
    { headers: { "x-crypto-key": fromLocalStorage('key') || "" } },
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

// mutation function to add new situation
export const addSituation = async (item: TInputSituation) => {
  const res = await fetch(`${baseUrl}/api/situations`, {
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

// mutation function to update situation
export const updateSituation = async (item: TUpdateSituation) => {
  const res = await fetch(`${baseUrl}/api/situations`, {
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

// mutation function to delete situation
export const deleteSituation = async (item: TDeleteSituation) => {
  const res = await fetch(`${baseUrl}/api/situations`, {
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

export function situationsOptions(page: number, limit: number, options: ISituationProperties) {
  return queryOptions({
    queryKey: ['situations', page, limit],
    queryFn: () => getSituations({ page, limit }, options),
    placeholderData: keepPreviousData,
  });
}