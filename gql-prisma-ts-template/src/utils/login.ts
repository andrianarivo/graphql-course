export interface LoginResponse {
  access_token?: string
  expires_in?: number
  token_type?: string
  error?: string
  error_description?: string
}

export default async function login(credentials: { username: string; password: string }): Promise<LoginResponse> {
  const { username, password } = credentials
  const data = {
    grant_type: 'password',
    username,
    password,
    audience: process.env.AUTH0_AUDIENCE || '',
    client_id: process.env.AUTH0_CLIENT_ID || '',
  }
  const formBody = []
  for (let i = 0; i < Object.entries(data).length; i += 1) {
    const [key, value] = Object.entries(data)[i]
    const encodedKey = encodeURIComponent(key)
    const encodedValue = encodeURIComponent(value)
    formBody.push(`${encodedKey}=${encodedValue}`)
  }
  const body = formBody.join('&')
  const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  const responseData = await response.json()
  if (!response.ok) {
    throw new Error(responseData.error_description)
  }
  return responseData
}

/* const response = login({
  username: 'cvsdf',
  password: 'sdf'
})

console.log(response) */
