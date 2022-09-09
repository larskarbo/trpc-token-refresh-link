# tRPC Token Refresh Link

| Seamlessly update your JWT access token token right before it expires.

## Installation

```
npm install token-refresh-link
```

## Implementation

```ts
import { tokenRefreshLink as tokenRefresh } from "trpc-token-refresh-link"

...ts
links: [
  ...
  tokenRefreshLink({
    tokenRefreshNeeded: () => boolean
    fetchAccessToken: async () => void
  }),
  ...
  httpLink({
    url,
  })
],
...
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

There are two ways to do token refreshing:

- Do requests, wait for a 403 response from a server. If your receive a 403, refresh the token before retrying the request.
- Calculate the expiration time locally and pre emptively refresh the token _before_ sending the request.

This link implements the second approach.

You need:

- Have a way to read and decode the access token on the client. If you use http secure etc, this will not work.

Implementation:
In your _app.tsx or whatever. Trpc, add the tokenRefreshLink.
You will need to provide two functions:

- shouldRefreshToken. Function that decides yes or no: should we initiate a refresh token?
- refreshAccessToken: Function that actually fetches the token. Here you also need to store it somewhere and handle errors and custom logging out.
