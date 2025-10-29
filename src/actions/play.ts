'use server'


export async function play(query: string, guildId: string) {
  if (!query || !guildId) return;
  const r = await fetch(`http://localhost:3223/play/${guildId}/${query}`, { method: "POST"})
  if (r.status === 200) {
    const data = await r.json()
    return {status: 200, data: data.data}
  } else {
    const data = await r.json()
    return {status: 400, data}
  }
}

export async function sendToPlayer(action: string, guildId: string) {
  if (!guildId) return;
  const r = await fetch(`http://localhost:3223/player/${guildId}/track`, { method: "POST", headers: {      'Accept': 'application/json',
      'Content-Type': 'application/json'},
    body: JSON.stringify({
      type: action,
    })})

  if (r.status === 200) {
    const data = await r.json()
    return {status: 200, data: data.data}
  } else {
    const data = await r.json()
    return {status: 400, data}
  }
}