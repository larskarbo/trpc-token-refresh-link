import { tokenRefreshLink as tokenRefresh } from "../../../dist/index.js";

export const RENEW_MS_BEFORE_EXPIRATION = 5000;

export const getAccessTokenExpiration = (accessToken: string) => {
	return new Date(accessToken).getTime();
};

export const tokenRefreshNeeded = () => {
	const accessToken = localStorage.getItem("accessToken");

	if (!accessToken) return false;

	const expirationTimeInMilliseconds = getAccessTokenExpiration(accessToken);

	if (!expirationTimeInMilliseconds) {
		// If there is no expiration time, the token is not valid
		return true;
	}

	const now = new Date();

	const millisecondsUntilExpiration =
		expirationTimeInMilliseconds - now.getTime();

	if (millisecondsUntilExpiration >= RENEW_MS_BEFORE_EXPIRATION) {
		// token is valid for a while, no need to renew
		return false;
	} else {
		// we need to renew (it is either already expired or soon expiring)
		return true;
	}
};

export const tokenRefreshLink = tokenRefresh({
	tokenRefreshNeeded,
	fetchAccessToken: async () => {
		try {
			console.log("fetching new access token 🌱");
			const rsp = await fetch("/api/renew-token", {
				method: "POST",
			});

			if (rsp.ok) {
				const { accessToken } = (await rsp.json()) as { accessToken: string };
				localStorage.setItem("accessToken", accessToken);
			} else {
				const { error } = (await rsp.json()) as { error: string };
				throw error;
			}
		} catch (err) {
			// token refreshing failed, usually you would want to logout the user here
		}
	},
});
