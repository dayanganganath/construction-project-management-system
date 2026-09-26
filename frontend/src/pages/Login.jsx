import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password.trim()) {
      setError("Username and password are required.");
      return;
    }

    // Temporary local login
    if (form.username === "admin" && form.password === "admin123") {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("username", form.username);

      navigate("/");
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>CPMS</h1>
          <p>Construction Project Management System</p>
        </div>

        <h2>Login</h2>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <p className="login-demo">
          Demo Login: admin / admin123
        </p>
      </div>
    </div>
  );
}

export default Login;