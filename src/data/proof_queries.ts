import { IProof, IThought } from '@/utils/interfaces';
import { keepPreviousData, queryOptions, } from '@tanstack/react-query';

type TProofs = {thoughts: IProof[], thought: IThought, length: number};

type TInputProof = {
  name: string;
  situation_id: number;
  thought_id: number;
};

type TUpdateProof = {
  id: number;
  name: string;
};

type TDeleteProof = {
  id: number;
};

const baseUrl = process.env.BETTER_AUTH_URL ? process.env.BETTER_AUTH_URL: 'http://localhost:3000';


const getProofs = async (
  { thought_id, situation_id }: { thought_id: string; situation_id: string }
): Promise<TProofs> => {
  const res = await fetch(
    `${baseUrl}/api/proofs?situation_id=${situation_id}&thought_id=${thought_id}`,
  )
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

// mutation function to add new proof
export const addProof = async (item: TInputProof) => {
  const res = await fetch(`${baseUrl}/api/proofs`, {
    method: "POST",
    body: JSON.stringify(item),
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

// mutation function to update proof
export const updateProof = async (item: TUpdateProof) => {
  const res = await fetch(`${baseUrl}/api/proofs`, {
    method: "PUT",
    body: JSON.stringify(item),
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

// mutation function to delete proof
export const deleteProof = async (item: TDeleteProof) => {
  const res = await fetch(`${baseUrl}/api/proofs`, {
    method: "DELETE",
    body: JSON.stringify(item),
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

export function proofsOptions(thought_id: string, situation_id: string) {
  return queryOptions({
    queryKey: ['proofs', thought_id, situation_id],
    queryFn: () => getProofs({ thought_id, situation_id }),
    placeholderData: keepPreviousData,
  });
}