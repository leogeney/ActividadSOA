import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "./Firebase";
import { sendPasswordResetEmail } from "firebase/auth";

function ForgotPage() {
  const [step, setStep] = useState(1); // 1: email, 2: éxito
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("El email es obligatorio");
      return;
    }
    if (!email.includes("@")) {
      setError("Email inválido");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 🔥 Firebase envía el correo de recuperación real
      await sendPasswordResetEmail(auth, email);
      setStep(2); // Mostrar pantalla de éxito
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No existe una cuenta con ese correo");
          break;
        case "auth/invalid-email":
          setError("El correo no es válido");
          break;
        case "auth/too-many-requests":
          setError("Demasiados intentos. Espera un momento");
          break;
        default:
          setError("Error al enviar el correo: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleEmailSubmit}>
        <h2>Recuperar Cuenta</h2>

        {error && <div className="error">{error}</div>}

        {/* STEP 1 — Ingresar email */}
        {step === 1 && (
          <>
            <div className="field">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="Ingresa tu email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar correo de recuperación"}
            </button>

            <div className="links">
              <Link to="/">Volver al inicio de sesión</Link>
            </div>
          </>
        )}

        {/* STEP 2 — Correo enviado */}
        {step === 2 && (
          <>
            <div style={{
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.4)",
              borderRadius: "10px",
              padding: "16px",
              textAlign: "center",
              color: "#86efac",
              marginBottom: "16px"
            }}>
              <p style={{ fontSize: "32px", marginBottom: "8px" }}>📬</p>
              <p><strong>¡Correo enviado!</strong></p>
              <p style={{ fontSize: "13px", marginTop: "6px" }}>
                Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue el enlace para restablecer tu contraseña.
              </p>
            </div>

            <button
              type="button"
              onClick={() => { setStep(1); setEmail(""); }}
              style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
            >
              Enviar a otro correo
            </button>

            <div className="links">
              <Link to="/">Volver al inicio de sesión</Link>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default ForgotPage;