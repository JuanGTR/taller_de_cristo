import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons/faGoogle";
import { faApple } from "@fortawesome/free-brands-svg-icons/faApple";

export default function LoginPage() {
  const {
    login,
    register,
    loginWithGoogle,
    loginWithApple,
  } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate("/music"); // landing after auth
    } catch (err) {
      console.error(err);
      setError(err.message || "Error de autenticación");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setBusy(true);
    try {
      await loginWithGoogle();
      navigate("/music");
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo iniciar sesión con Google");
    } finally {
      setBusy(false);
    }
  }

  async function handleApple() {
    setError("");
    setBusy(true);
    try {
      await loginWithApple();
      navigate("/music");
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo iniciar sesión con Apple");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#000",
        color: "#fff",
        padding: "16px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#111322",
          padding: "24px 28px",
          borderRadius: 18,
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 18px 48px rgba(0,0,0,0.6)",
        }}
      >
        <h1 style={{ marginBottom: 8, fontSize: 22, fontWeight: 800 }}>
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>
        <p
          style={{
            marginTop: 0,
            marginBottom: 18,
            fontSize: 13,
            color: "#bfb4db",
          }}
        >
          {mode === "login"
            ? "Entra para administrar tu música y presentaciones."
            : "Regístrate para guardar tus canciones y ajustes."}
        </p>

        {/* Email / password block */}
        <label style={{ display: "block", marginBottom: 12 }}>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Correo electrónico</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: 9,
              borderRadius: 10,
              border: "1px solid #252646",
              background: "#050618",
              color: "#fff",
              outline: "none",
              fontSize: 14,
            }}
            required
          />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          <div style={{ fontSize: 14, marginBottom: 4 }}>Contraseña</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 9,
              borderRadius: 10,
              border: "1px solid #252646",
              background: "#050618",
              color: "#fff",
              outline: "none",
              fontSize: 14,
            }}
            required
          />
        </label>

        {error && (
          <div style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 8 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          style={{
            width: "100%",
            marginTop: 4,
            padding: "10px 0",
            borderRadius: 999,
            border: "none",
            background:
              "linear-gradient(135deg, #2a0055 0%, #470089 55%, #7a0dd6 100%)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.7 : 1,
            boxShadow: "0 12px 32px rgba(0,0,0,0.8)",
          }}
        >
          {busy
            ? "Procesando..."
            : mode === "login"
            ? "Entrar"
            : "Registrarme"}
        </button>

        {/* Divider */}
        <div
          style={{
            margin: "14px 0 10px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: "#7f80a8",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "#242444" }} />
          <span>o continúa con</span>
          <div style={{ flex: 1, height: 1, background: "#242444" }} />
        </div>

        {/* Social auth buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid #252646",
              background: "#050618",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: busy ? "default" : "pointer",
            }}
          >
           <FontAwesomeIcon icon={faGoogle} />
            <span>Continuar con Google</span>
          </button>

          <button
            type="button"
            onClick={handleApple}
            disabled={busy}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid #252646",
              background: "#000",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: busy ? "default" : "pointer",
            }}
          >
            <span
              style={{
                fontSize: 16,
              }}
            >
              <FontAwesomeIcon icon={faApple} />
            </span>
            <span>Continuar con Apple</span>
          </button>
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            color: "#bfb4db",
          }}
        >
          {mode === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                style={{
                  color: "#9ab4ff",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
                onClick={() => setMode("register")}
              >
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                style={{
                  color: "#9ab4ff",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
                onClick={() => setMode("login")}
              >
                Inicia sesión
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
