import z from 'zod'
import { roomStateSchema } from './room_state'

export const askNameServerMessageSchema = z.object({
  type: z.literal('ask_name'),
})

export const roomStateServerMessageSchema = z
  .object({
    type: z.literal('room_state'),
  })
  .merge(roomStateSchema)

export const startServerMessageSchema = z.object({
  type: z.literal('start'),
})

export const kickedServerMessageSchema = z.object({
  type: z.literal('kicked'),
})

export const errorServerMessageSchema = z.object({
  type: z.literal('error'),
  message: z.string(),
})

export const chatServerMessageSchema = z.object({
  type: z.literal('chat'),
  message: z.string(),
})

export const systemServerMessageSchema = z.object({
  type: z.literal('system'),
  message: z.string(),
})

export const serverMessageSchema = z.discriminatedUnion('type', [
  askNameServerMessageSchema,
  startServerMessageSchema,
  kickedServerMessageSchema,
  errorServerMessageSchema,
  chatServerMessageSchema,
  systemServerMessageSchema,
  roomStateServerMessageSchema,
])

export type ServerMessage = z.infer<typeof serverMessageSchema>
export type StartServerMessage = z.infer<typeof startServerMessageSchema>
export type KickedServerMessage = z.infer<typeof kickedServerMessageSchema>
export type AskNameServerMessage = z.infer<typeof askNameServerMessageSchema>
export type ErrorServerMessage = z.infer<typeof errorServerMessageSchema>
export type ChatServerMessage = z.infer<typeof chatServerMessageSchema>
export type SystemServerMessage = z.infer<typeof systemServerMessageSchema>
export type RoomStateServerMessage = z.infer<
  typeof roomStateServerMessageSchema
>
