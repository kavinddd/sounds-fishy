import { useContext } from 'react'
import { GameCtx } from './context'

export function useGame() {
  const ctx = useContext(GameCtx)
  if (!ctx)
    throw new Error('useGame should be used under <GameContextProvider>')
  return ctx
}
