export interface ISituation {
  id: number
  name: string
  description?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface ISituationProperties {
  name?: string
  creation_date?: string
}

export interface IThought {
  id: number
  name: string
  strength?: number
  situation_id: number
  created_at: string
  updated_at: string
}

export interface IThoughtProperties {
  name?: string
  creation_date?: string
}