import jwt, {JwtHeader} from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
})

function getKey(header: JwtHeader, callback: Function) {
  client.getSigningKey(header.kid, (err, key) => {
    callback(null, key?.getPublicKey())
  })
}


async function isTokenValid(token: string) {
  if (token) {
    const bearerToken = token.split(" ")

    return new Promise((resolve, reject) => {
      jwt.verify(
          bearerToken[1],
          getKey,
          {
            audience: process.env.AUTH0_AUDIENCE,
            issuer: `https://${process.env.AUTH0_DOMAIN}/`,
            algorithms: ["RS256"]
          },
          (error, decoded) => {
            if (error) {
              reject({error})
            }
            if (decoded) {
              resolve({decoded})
            }
          }
      )
    })
  }

  return { error: "No token provided" }
}

export { isTokenValid as default }