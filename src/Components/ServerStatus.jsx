import { useCallback, useEffect, useRef, useState } from "react";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
const ATTEMPT_TIMEOUT_MS = 8000;
const RETRY_DELAY_MS = 5000;
const MAX_ATTEMPTS = 30;

async function pingServer() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE_URL}/`, { signal: controller.signal, cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// Free hosting puts the backend to sleep when idle. Check once on open and,
// if it does not answer, say so and keep checking for a bounded time.
function ServerStatus() {
  const [state, setState] = useState("checking");
  const runRef = useRef(0);

  const check = useCallback(async () => {
    const run = ++runRef.current;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      if (await pingServer()) {
        if (run === runRef.current) setState("ready");
        return;
      }
      if (run !== runRef.current) return;
      setState("waking");
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      if (run !== runRef.current) return;
    }
    if (run === runRef.current) setState("failed");
  }, []);

  useEffect(() => {
    check();
    return () => { runRef.current += 1; };
  }, [check]);

  if (state === "ready" || state === "checking") return null;

  return (
    <div role="status" aria-live="polite" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, padding: "10px 14px",
      background: "#1f2937", color: "#fff", fontSize: 14, textAlign: "center",
    }}>
      {state === "waking"
        ? "Server start ho raha hai (free hosting, idle ke baad dheere jaagta hai). Thoda wait karo - login/save abhi fail ho sakta hai."
        : <>Server abhi jawab nahi de raha. <button type="button" onClick={() => { setState("waking"); check(); }} style={{ marginLeft: 8 }}>Dobara check karo</button></>}
    </div>
  );
}

export default ServerStatus;
