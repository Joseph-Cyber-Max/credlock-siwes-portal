import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, ShieldCheck } from "lucide-react";

const API = "https://script.google.com/macros/s/AKfycbyTj3mbqgJA9ySkyr1gDUxS5tYKQs_r5hbMG53ol36pjjSkXBEUxjlG226woRADwUR-qg/exec";

export default function Registration() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", institution: "", programme: "", level: "", organization: "", password: "", confirmPassword: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); setBusy(false); return; }
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "register", payload: form }) });
      const j = await r.json();
      if (!j.success) throw new Error(j.message || "Registration failed.");
      setMessage(j.message || "Registration submitted successfully.");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <div className="auth-page"><div className="auth-brand"><div className="brand-mark">C</div><div><b>Credlock</b><small>SIWES Portal</small></div></div><form className="auth-card" onSubmit={submit}><span className="eyebrow">STUDENT REGISTRATION</span><h1>Create your portal account</h1><p>Register your SIWES profile. Your account will be activated after verification.</p><div className="form-grid">{[["fullName","Full name","text"],["email","Email","email"],["phone","Phone","tel"],["institution","Institution","text"],["programme","Programme","text"],["level","Level","text"],["organization","SIWES organization","text"],["password","Password","password"],["confirmPassword","Confirm password","password"]].map(([name,label,type])=><label key={name}>{label}<input name={name} type={type} value={form[name]} onChange={change} required /></label>)}</div>{error&&<div className="error">{error}</div>}{message&&<div className="success">{message}</div>}<button className="primary wide" disabled={busy}><UserPlus size={17}/>{busy ? "Submitting…" : "Register"}</button><div className="auth-foot"><ShieldCheck size={15}/> Your registration is handled by the portal backend.</div><p className="auth-link">Already registered? <Link to="/">Sign in</Link></p></form></div>;
}
