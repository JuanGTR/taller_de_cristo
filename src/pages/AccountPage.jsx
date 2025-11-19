// src/pages/AccountPage.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function AccountPage() {
  const { user } = useAuth();

  if (!user) {
    // Should never hit because route is wrapped in RequireAuth
    return null;
  }

  const providerData = user.providerData || [];

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px 16px 40px",
        background: "#000",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#0b0b0b",
          borderRadius: 20,
          border: "1px solid #1f1f1f",
          boxShadow: "0 18px 48px rgba(0,0,0,0.75)",
          padding: "20px 20px 24px",
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: 4,
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          Cuenta
        </h1>
        <p
          style={{
            margin: 0,
            marginBottom: 18,
            fontSize: 13,
            color: "#bfb4db",
          }}
        >
          Información básica de tu cuenta de Altar Pro.
        </p>

        <div
          style={{
            display: "grid",
            gap: 14,
            fontSize: 14,
          }}
        >
          <section
            style={{
              padding: "12px 12px 10px",
              borderRadius: 14,
              background: "#111111",
              border: "1px solid #262626",
            }}
          >
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#c9b8f6",
                marginBottom: 6,
              }}
            >
              Perfil
            </div>

            <div style={{ marginBottom: 4 }}>
              <strong>Correo:</strong>{" "}
              <span style={{ color: "#f4eaff" }}>
                {user.email || "—"}
              </span>
            </div>

            <div style={{ marginBottom: 4 }}>
              <strong>ID de usuario:</strong>{" "}
              <span style={{ fontSize: 12, color: "#9a9ac4" }}>
                {user.uid}
              </span>
            </div>

            <div>
              <strong>Verificado:</strong>{" "}
              <span style={{ color: user.emailVerified ? "#8be48b" : "#ffb36b" }}>
                {user.emailVerified ? "Sí" : "No"}
              </span>
            </div>
          </section>

          <section
            style={{
              padding: "12px 12px 10px",
              borderRadius: 14,
              background: "#111111",
              border: "1px solid #262626",
            }}
          >
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#c9b8f6",
                marginBottom: 6,
              }}
            >
              Métodos de acceso
            </div>

            {providerData.length === 0 && (
              <div style={{ color: "#bfb4db", fontSize: 13 }}>
                No se encontraron proveedores. (Probablemente email/contraseña.)
              </div>
            )}

            {providerData.map((p) => (
              <div
                key={p.providerId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #1c1c1c",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {p.providerId === "password"
                      ? "Email y contraseña"
                      : p.providerId === "google.com"
                      ? "Google"
                      : p.providerId === "apple.com"
                      ? "Apple"
                      : p.providerId}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9a9ac4",
                      marginTop: 2,
                    }}
                  >
                    {p.email || p.uid || "Sin datos adicionales"}
                  </div>
                </div>
              </div>
            ))}
          </section>

          <section
            style={{
              padding: "12px 12px 10px",
              borderRadius: 14,
              background: "#111111",
              border: "1px solid #262626",
              fontSize: 13,
              color: "#bfb4db",
            }}
          >
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#c9b8f6",
                marginBottom: 6,
              }}
            >
              Notas
            </div>
            <p style={{ margin: 0 }}>
              En el futuro aquí podrás controlar cosas como tu iglesia / organización,
              equipos y opciones avanzadas de seguridad.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
