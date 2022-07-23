export const uploadJSON = async (data) => {
  const formData = new FormData()
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  formData.append('file', blob, 'data.json')

  const result = await fetch('http://47.241.31.74:5001/api/v0/add', { method: 'POST', body: formData })
  return result.json()
}

export const fetchJSON = async (hash) => {
  const result = await fetch(`http://47.241.31.74:8080/ipfs/${hash}`)
  return result.json()
}
