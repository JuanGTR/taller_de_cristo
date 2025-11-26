import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons/faGoogle";
import { faApple } from "@fortawesome/free-brands-svg-icons/faApple";

// 🔹 Helper: map Firebase auth errors to friendly messages
function getAuthErrorMessage(err, { mode = "login", provider = "password" } = {}) {
  const code = err?.code || "";
  const message = err?.message || "";

  // Prefer Firebase error code when available
  if (code.startsWith("auth/")) {
    switch (code) {
      case "auth/invalid-email":
        return "El correo electrónico no es válido. Revisa que esté bien escrito.";

      case "auth/user-not-found":
        return "No encontramos una cuenta con ese correo. Verifica el correo o crea una cuenta nueva.";

      case "auth/wrong-password":
        return "La contraseña es incorrecta. Vuelve a intentarlo.";

      case "auth/too-many-requests":
        return "Demasiados intentos fallidos. Intenta de nuevo más tarde o restablece tu contraseña.";

      case "auth/email-already-in-use":
        return "Ya existe una cuenta con este correo. Inicia sesión en lugar de registrarte.";

      case "auth/weak-password":
        return "La contraseña es muy débil. Usa al menos 6 caracteres.";

      case "auth/unauthorized-domain":
        return "Este dominio no está autorizado para usar el inicio de sesión. Revisa la configuración de Firebase (Authorized domains).";

      case "auth/popup-closed-by-user":
        return "Cerraste la ventana de inicio de sesión antes de terminar. Intenta de nuevo.";

      case "auth/cancelled-popup-request":
        return "Se canceló el intento de inicio de sesión. Intenta de nuevo.";

      default:
        break;
    }
  }

  // Message-based fallback (por si solo viene el texto)
  if (message.includes("auth/unauthorized-domain")) {
    return "Este dominio no está autorizado para usar el inicio de sesión. Revisa la configuración de Firebase.";
  }

  // Contextual generic fallback
  if (provider === "google") {
    return "No se pudo iniciar sesión con Google. Intenta de nuevo en unos segundos.";
  }
  if (provider === "apple") {
    return "No se pudo iniciar sesión con Apple. Intenta de nuevo en unos segundos.";
  }

  if (mode === "register") {
    return "No se pudo crear la cuenta. Verifica el correo y la contraseña e inténtalo de nuevo.";
  }

  return "No se pudo iniciar sesión. Verifica tus datos e inténtalo de nuevo.";
}

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
      setError(getAuthErrorMessage(err, { mode, provider: "password" }));
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
      setError(getAuthErrorMessage(err, { mode, provider: "google" }));
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
      setError(getAuthErrorMessage(err, { mode, provider: "apple" }));
    } finally {
      setBusy(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError(""); // 🔹 limpia errores al cambiar de login/registro
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
          <div
            style={{
              color: "#ff6b6b",
              fontSize: 13,
              marginBottom: 8,
              background: "rgba(255, 107, 107, 0.06)",
              borderRadius: 8,
              padding: "6px 8px",
              border: "1px solid rgba(255, 107, 107, 0.35)",
            }}
          >
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

          {/* Apple remains commented until you're ready to wire it */}
          {/*
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
          */}
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
                onClick={() => switchMode("register")}
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
                onClick={() => switchMode("login")}
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
