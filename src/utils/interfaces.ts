export interface ISituation {
  id: number
  name: string
  description?: string | null
  user_id: number
  created_at?: string | null
  updated_at?: string | null
}

export interface ISituationProperties {
  name?: string
  creation_date?: string
}

export interface IThought {
  id: number
  name: string
  strength?: number | null
  situation_id: number
  created_at?: string | null
  updated_at?: string | null
}

export interface IThoughtProperties {
  name?: string
  creation_date?: string
}

export interface IProof {
  id: number
  name: string
  proof_type: number
  thought_id: number
  created_at?: string | null
  updated_at?: string | null
}