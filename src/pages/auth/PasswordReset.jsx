import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, ShieldCheck } from "lucide-react";

const API = "https://script.google.com/macros/s/AKfycbyTj3mbqgJA9ySkyr1gDUxS5tYKQs_r5hbMG53ol36pjjSkXBEUxjlG226woRADwUR-qg/exec";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "requestPasswordReset", payload: { email } }) });
      const j = await r.json(); if (!j.success) throw new Error(j.message || "Unable to process request.");
      setMessage(j.message || "If the account exists, reset instructions have been sent.");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <div className="auth-page"><div className="auth-brand"><div className="brand-mark">C</div><div><b>Credlock</b><small>SIWES Portal</small></div></div><form className="auth-card compact" onSubmit={submit}><span className="eyebrow">ACCOUNT RECOVERY</span><h1>Reset your password</h1><p>Enter the email address associated with your SIWES account.</p><label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></label>{error && <div className="error">{error}</div>}{message && <div className="success">{message}</div>}<button className="primary wide" disabled={busy}><KeyRound size={17}/>{busy ? "Processing…" : "Request password reset"}</button><div className="auth-foot"><ShieldCheck size={15}/> Account recovery is verified by the portal backend.</div><p className="auth-link"><Link to="/">Back to sign in</Link></p></form></div>;
}
