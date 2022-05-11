import { User } from './User'

export type GroupUser = {
  id: string
  groupUserRank: string
  userId?: string
  groupId: string
  user: User
}
