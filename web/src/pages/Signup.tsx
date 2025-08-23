import type { FormEvent } from "react";
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Auth.css";

export default function Signup() {
  const nav = useNavigate();
  const loc = useLocation() as any;
  const from = loc.state?.from ?? "/";
  const login = useAuth((s) => s.login);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;
    login({ id: "1", name, email }, "dev-token");
    nav(from, { replace: true });
  }

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <h2 className="auth-title">Create Account</h2>

        <form onSubmit={onSubmit} className="auth-card">
          <div className="auth-field">
            <label>Name</label>
            <input
              required
              className="input"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              required
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              required
              className="input"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn-primary-lg auth-submit" type="submit">
            Create Account
          </button>
        </form>

        <p className="auth-alt">
          Already have an account?{" "}
          <Link to="/login" state={{ from }} className="auth-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
