/**
 * This is a Next.js page.
 */
import { differenceInSeconds } from "date-fns";
import { useEffect, useState } from "react";
import { tokenRefreshNeeded } from "~/utils/tokenRefresh";
import { trpc } from "../utils/trpc";

export default function IndexPage() {
  const { mutate: publicMutation } = trpc.publicTest.useMutation();

  const { mutate: privateMutation } = trpc.privateTest.useMutation();

  const { mutate: loginMutation } = trpc.login.useMutation({
    onSuccess: ({ accessToken, refreshToken }) => {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    },
  });

  return (
    <div>
      <div className="">
        <h1>token-refresh-link example</h1>

        <TokenInfos />
        <button onClick={() => publicMutation()}>Request (public)</button>
        <button onClick={() => privateMutation()}>Request (private)</button>
        <button onClick={() => loginMutation()}>Login</button>
        <button
          onClick={() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

const TokenInfos = () => {
  const [_, setTick] = useState(0);

  const [accessToken, setAccessToken] = useState<string | null>();
  const [isTokenRefreshNeeded, setIsTokenRefreshNeeded] = useState(false);

  const [refreshToken, setRefreshToken] = useState<string | null>();

  useEffect(() => {
    const interval = setInterval(() => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      setAccessToken(accessToken);
      setIsTokenRefreshNeeded(tokenRefreshNeeded());
      setRefreshToken(refreshToken);
      setTick((tick) => tick + 1);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const accessTokenExpiresIn = accessToken
    ? differenceInSeconds(new Date(accessToken), new Date())
    : 0;

  return (
    <div>
      <div>
        Access token:{" "}
        {accessToken ? (
          <>
            {accessTokenExpiresIn > 0 ? (
              <>(expires in {accessTokenExpiresIn}s)</>
            ) : (
              <>(expired)</>
            )}
          </>
        ) : null}
      </div>
      <div>tokenRefreshNeeded: {isTokenRefreshNeeded ? "true" : "false"}</div>
      <div>Refresh token: {refreshToken}</div>
    </div>
  );
};
