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