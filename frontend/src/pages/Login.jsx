import { useState } from "react";
import api, { setCredentials } from "../services/api";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.get("/auth/me", { auth: { username, password } });
      setCredentials(username, password);
      setPassword("");
      onLogin(response.data);
    } catch {
      setError("Login failed. Check your username and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Construction Management</h1>
        <p>Sign in to view your projects.</p>
        <label htmlFor="username">Username</label>
        <input id="username" autoComplete="username" required value={username}
          onChange={(event) => setUsername(event.target.value)} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" required
          value={password} onChange={(event) => setPassword(event.target.value)} />
        {error && <p role="alert" className="login-error">{error}</p>}
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

export default Login;
