'use server'


async function expandSpotifyLink(url: string) {
  let current = url

  for (let i = 0; i < 2; i++) {
    const res = await fetch(current, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15",
        "Content-Type": "text/html"
      }
    })

    const location = res.headers.get("location")
    if (!location) {
      const text = await res.text()
      const regex = /(https:\/\/open\.spotify\.com\/[^\s"'()]+)/
      const match = text.match(regex)
      if (!match) return null

      let url = match[1]
      if (!url) return undefined

      // Optional cleanup: remove tracking parameters
      url = url.replace(/\?.*$/, "")

      return url
    }

    current = location
  }

  return current
}

export async function play(query: string, guildId: string) {
  if (!query || !guildId) return;

  let fixedQ = query
  if (query.includes("spotify.link")) {
    const expandedUrl = await expandSpotifyLink(query)
    if (expandedUrl) {
      fixedQ= expandedUrl
    }
  }

  const r = await fetch(`http://localhost:3223/play/${guildId}`, { method: "POST", headers: {      'Accept': 'application/json',
      'Content-Type': 'application/json'},
    body: JSON.stringify({
      query: fixedQ,
    })})
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