export interface ClientNameMessage {
  type: 'name'
  name: string
}

export interface ClientChatMessage {
  type: 'chat'
  text: string
}

export type ClientMessage = ClientNameMessage | ClientChatMessage
