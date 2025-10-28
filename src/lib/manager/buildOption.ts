import type { Client } from "discord.js"
import type { ManagerOptions } from "erela.js"

export const buildOption = (): ManagerOptions => {
  return {
    plugins: [],
    autoPlay: true,
    clientName: "whaly-panel-action",
    nodes: [
      {
        identifier: "Lavalink Node",
        host: "0.0.0.0",
        port: 2333,
        password: "test1234",
        retryAmount: 200,
        retryDelay: 2000,
        version: "v4",
        useVersionPath: true,
        secure: false
      }
    ],
    send: (id, payload) => {
      console.log(payload)
    }
  }
}
