/**
 * This is a Next.js page.
 */
import { differenceInSeconds } from "date-fns";
import { useEffect, useState } from "react";
import { trpc } from "../utils/trpc";

type Log = {
  time: Date;
  message: string;
};

export default function IndexPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  const addLog = (msg: string) => {
    setLogs((logs) =>
      [
        ...logs,
        {
          time: new Date(),
          message: msg,
        },
      ].slice(-20)
    );
  };

  const logging = (name: string) => ({
    onSuccess: () => {
      addLog(`${name} request ✅`);
    },
    onError: () => {
      addLog(`${name} request ❌`);
    },
    onMutate: () => {
      addLog(`${name} request started`);
    },
  });
  const { mutate: publicMutation } = trpc.publicTest.useMutation({
    ...logging("public"),
  });

  const { mutate: privateMutation } = trpc.privateTest.useMutation({
    ...logging("private"),
  });

  const { mutate: loginMutation } = trpc.login.useMutation({
    ...logging("login"),
    onSuccess: ({ accessToken, refreshToken }) => {
      addLog(`login request ✅`);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    },
  });

  return (
    <div style={styles}>
      {/**
       * The type is defined and can be autocompleted
       * 💡 Tip: Hover over `data` to see the result type
       * 💡 Tip: CMD+Click (or CTRL+Click) on `text` to go to the server definition
       * 💡 Tip: Secondary click on `text` and "Rename Symbol" to rename it both on the client & server
       */}
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

        <h2>Logs</h2>
        <pre
          style={{
            height: 500,
          }}
        >
          {logs.map((log, i) => (
            <div key={log.time.getTime()}>{log.message}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}

const styles = {
  width: "100vw",
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const TokenInfos = () => {
  // rerender every 200ms, with useEffect
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((tick) => tick + 1);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

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
      <div>Refresh token: {refreshToken ? "set (expires never)" : null}</div>
    </div>
  );
};
