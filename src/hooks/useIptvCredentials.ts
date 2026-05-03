import { useState, useEffect } from "react";

/** Read the temporary app session token created after IPTV login. */
export function useIptvCredentials() {
  const [session, setSession] = useState<{ appSessionToken: string } | null>(null);

  useEffect(() => {
    const appSessionToken = sessionStorage.getItem("app_session_token");
    if (appSessionToken) setSession({ appSessionToken });
  }, []);

  return session;
}
