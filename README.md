

<p align="center">
  <img width="300" src="https://user-images.githubusercontent.com/10865165/189316451-8f80befb-6205-49b6-8eb9-733b7a4d4bc2.jpg" />
</p>

# tRPC Token Refresh Link


| Seamlessly update your JWT access token token right before it expires.

- ✅ Works with batching
- ✅ Works with many requests at once. Will only do one token refresh request


## Demo

![shot-A5GEaVUB](https://user-images.githubusercontent.com/10865165/203061560-209a02c6-cb9c-4201-84f7-827d61914e1f.gif)


## Installation

```
npm install trpc-token-refresh-link
```

## Implementation

```ts
import { tokenRefreshLink } from "trpc-token-refresh-link"

tokenRefreshLink({
  tokenRefreshNeeded: () => boolean
  fetchAccessToken: async () => void
}),
```

## Example

```ts
...
links: [
  tokenRefreshLink({
    tokenRefreshNeeded: () => {
      // on every request, this function is called

      const token = ... // get the token from localstorage or cookies

      if(/* There is no token */){
        return false
      }

      if(/* Token is valid */){
        return false
      }

      if(/* Token is expired or expires soon (in 10 seconds) */){
        return true
      }
    },
    fetchAccessToken: async () => {
      // if true is returned from tokenRefreshNeeded, this function will be called
      
      // do your magic to fetch a refresh token here
      // example:
      try {
        const res = (await fetch("/api/renew-token", {
          method: "POST",
        }).then((res) => res.json())) as { accessToken: string }

        saveAccessToken(res.accessToken) // save token to cookies
      } catch (err) {

        // token refreshing failed, let's log the user out
        if (err instanceof Error && err.message.includes("401")) {
          clearAccessToken()
          location.reload()
        }
      }
    },
  }),
  httpLink({
    url,
  })
],
...
```

## Philosophy

This library calculates the expirationtime for the access token before sending it to the server.

This means we can refresh the token in advance, not requiring the roundtrip to the server for that.

This approach means that you need to have a way to read and decode the access token on the client. If you use a http-only access token (not available to js), this approach will not work.

## Credits and similar libraries

- This library is heavily inspired from [newsiberian/apollo-link-token-refresh](https://github.com/newsiberian/apollo-link-token-refresh).
- [axios-auth-refresh](https://github.com/Flyrell/axios-auth-refresh) - Axios interceptors that do a token refresh on 403 responses
