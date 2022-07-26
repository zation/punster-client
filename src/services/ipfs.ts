export const ipfsDomain = '//47.241.69.26'

export async function uploadJSON<Params = Record<string, any>>(data: Params) {
  const formData = new FormData()
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  formData.append('file', blob, 'data.json')

  const result = await fetch(`${ipfsDomain}:5001/api/v0/add`, { method: 'POST', body: formData })
  return result.json()
}

export async function fetchJSON<Return>(hash: string) {
  const result = await fetch(`${ipfsDomain}:8080/ipfs/${hash}`)
  return await result.json() as Promise<Return>;
}
