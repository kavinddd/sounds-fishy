import z from 'zod'

export const appEnvSchema = z.object({
  VITE_SERVER_URL: z.string().default('http://localhost:8080'),
})

export type AppEnv = z.infer<typeof appEnvSchema>
