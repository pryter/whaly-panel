'use server'


export async function confirm(sessionId: string, selection: string) {
  if (!selection || !sessionId) return;
  console.log(selection, sessionId)
  const r = await fetch(`http://localhost:3223/search-result/${sessionId}/select`, { method: "POST", headers: {      'Accept': 'application/json',
      'Content-Type': 'application/json'},
    body: JSON.stringify({
      option: selection,
    })})
  if (r.status === 200) {
    const data = await r.json()
    return {status: 200, data: data.data}
  } else {
    const data = await r.json()
    return {status: 400, data}
  }
}