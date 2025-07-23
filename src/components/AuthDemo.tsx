import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom"; // ✅ import this here

export default function AuthDemo() {
  const { register, login, getProtected, logout, token, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [protectedMsg, setProtectedMsg] = useState("");
  const navigate = useNavigate(); // ✅ create navigate function

  const handleLogin = async () => {
    await login(email, password);
    if (token) {
      navigate("/dashboard"); // ✅ redirect after login
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Register</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ width: "100%", marginBottom: 8 }} />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" style={{ width: "100%", marginBottom: 8 }} />
      <button onClick={() => register(email, password)} style={{ width: "100%", marginBottom: 16 }}>Register</button>

      <h2>Login</h2>
      <button onClick={handleLogin} style={{ width: "100%", marginBottom: 16 }}>Login</button>

      <h2>Protected</h2>
      <button onClick={async () => {
        const data = await getProtected();
        setProtectedMsg(data?.message || "");
      }} style={{ width: "100%", marginBottom: 8 }}>Get Protected Message</button>
      <div>{protectedMsg}</div>

      <button onClick={logout} style={{ width: "100%", marginTop: 16 }}>Logout</button>
      {token && <div style={{ marginTop: 8 }}>Logged in! Token: {token.slice(0, 10)}...</div>}
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
    </div>
  );
}
