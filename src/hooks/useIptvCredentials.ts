import { useState, useEffect } from "react";

/** Read IPTV credentials stored after login. Returns null if not logged in. */
export function useIptvCredentials() {
  const [creds, setCreds] = useState<{ username: string; password: string } | null>(null);

  useEffect(() => {
    const username = sessionStorage.getItem("iptv_user");
    const password = sessionStorage.getItem("iptv_pass");
    if (username && password) {
      setCreds({ username, password });
    }
  }, []);

  return creds;
}
