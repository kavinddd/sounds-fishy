import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import type { ServerMessage } from '@/lib/game'
import type { RoomState } from '@/lib/game/types/servers/room_state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SERVER_ENDPOINT } from '@/lib/constants'
import { useGame } from '@/lib/game'
import GameCtxProvider from '@/lib/game/context/provider'

export const Route = createFileRoute('/app/')({
  component: App,
})

function App() {
  const { appConfig } = useRouteContext({ from: '__root__' })
  const { VITE_SERVER_URL } = appConfig

  const endpoints = useMemo(
    () => ({
      join: `${SERVER_ENDPOINT['join']}`,
      create: `${SERVER_ENDPOINT['create']}`,
    }),
    [],
  )

  return (
    <GameCtxProvider endpoints={endpoints} url={VITE_SERVER_URL}>
      <div className="mx-auto container py-4">
        <p>Sounds fishy</p>
        <GamePanel />
      </div>
    </GameCtxProvider>
  )
}

function GamePanel() {
  const { state } = useGame()
  const { status } = state

  console.log('status: ', status)

  return (
    <>
      <p>Status: {status}</p>
      {status === 'closed' && <CloseConnection />}
      {status === 'open' && <OpenConnecton />}
      {status === 'connecting' && <ConnectingConnection />}
      {status === 'closing' && <ClosingConnection />}
    </>
  )
}

function CloseConnection() {
  const ctx = useGame()
  const [roomCode, setRoomCode] = useState('')

  if (ctx.status !== 'closed') return null

  const { state, actions } = ctx

  const handleCreate = () => actions.host()
  const handleJoin = () => actions.join(roomCode)

  return (
    <>
      {state.reason && <p className="text-red">{state.reason}</p>}
      <Button onClick={handleCreate}>Create</Button>
      <div className="flex">
        <Input
          type="text"
          onChange={(e) => setRoomCode(e.target.value)}
          minLength={4}
          maxLength={4}
          placeholder="Room code eg. XeJq"
        />
        <Button onClick={handleJoin} disabled={roomCode.length !== 4}>
          Join
        </Button>
      </div>
    </>
  )
}

function OpenConnecton() {
  const ctx = useGame()
  if (ctx.status !== 'open') return null

  const { actions, state } = ctx

  if (!state.name) {
    return <AskName />
  }

  return <InRoom />
}

function AskName() {
  const ctx = useGame()
  if (ctx.status !== 'open') return null

  const { actions, state } = ctx

  const handleSendMsg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('chat') as string
    actions.send({ type: 'name', name })
    console.log('sent')
  }

  const handleLeave = () => actions.close()

  return (
    <section>
      <p>What's your name?</p>
      <form onSubmit={handleSendMsg}>
        <div className="flex">
          <Input
            className="flex-1"
            type="text"
            placeholder="My name is"
            name="chat"
          />
          <Button variant="ghost">{'Send'}</Button>
        </div>
      </form>

      <Button variant="destructive" onClick={handleLeave}>
        Leave
      </Button>
    </section>
  )
}

function InRoom() {
  const ctx = useGame()
  if (ctx.status !== 'open') return null

  const { actions, state } = ctx

  const handleSendMsg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const text = formData.get('chat') as string
    actions.send({ type: 'chat', text })
  }
  const handleLeave = () => actions.close()

  return (
    <section>
      <p>Open</p>
      <form onSubmit={handleSendMsg}>
        <div className="flex">
          <Input
            className="flex-1"
            type="text"
            placeholder="Your message"
            name="chat"
          />
          <Button variant="ghost">{'Send'}</Button>
        </div>
      </form>

      <Button variant="destructive" onClick={handleLeave}>
        Leave
      </Button>
    </section>
  )
}

function RoomInfo({ roomInfo }: { roomInfo: RoomState }) {
  return (
    <section>
      <p>Player Name: `${roomInfo.playerCount}`</p>
    </section>
  )
}

function ChatBox({ chats }: { chats: Array<ServerMessage> }) {
  return (
    <section>
      {chats.map((chat) => (
        <p>{chat}</p>
      ))}
    </section>
  )
}

function ClosingConnection() {
  return <>Closing</>
}

function ConnectingConnection() {
  return <>Connecting</>
}
