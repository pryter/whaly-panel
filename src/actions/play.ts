'use server'


export async function play(query: string, guildId: string) {
  if (!query || !guildId) return;
  const r = await fetch(`http://localhost:3223/play/${guildId}/${query}`, { method: "POST"})
  if (r.status === 200) {
    return {status: 200}
  } else {
    const data = await r.json()
    return {status: 400, data}
  }
}