import type { Client } from "discord.js"
import {Manager, Player} from "erela.js"

import { buildOption } from "./buildOption"

export const spawnPlayer = (gid: string) => {
  const manager = new Manager(buildOption())
  // Register common node listeners

  const player = manager.get(gid)
  return player
}
