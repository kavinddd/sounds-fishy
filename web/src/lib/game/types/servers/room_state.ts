import z from 'zod'
import { playerSchema } from './player'

export const roomStateSchema = z.object({
  player_count: z.number(),
  players: z.array(playerSchema),
})

export type RoomState = z.infer<typeof roomStateSchema>
