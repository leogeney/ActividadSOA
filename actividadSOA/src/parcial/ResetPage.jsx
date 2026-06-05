import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "./Firebase";
import { sendPasswordResetEmail } from "firebase/auth";

function ResetPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("El correo es obligatorio");
      return;
    }

    if (!email.includes("@")) {
      setError("Correo inválido");
      return;
    }

    try {
      setLoading(true);
      setError("");

     const actionCodeSettings = {
  url: "http://localhost:5173/reset-password",
  handleCodeInApp: true
};

await sendPasswordResetEmail(
  auth,
  email,
  actionCodeSettings
);

      setSuccess(true);

    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No existe una cuenta con ese correo");
          break;
        case "auth/invalid-email":
          setError("Correo inválido");
          break;
        case "auth/too-many-requests":
          setError("Demasiados intentos. Intenta más tarde");
          break;
        default:
          setError("Error al enviar correo");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <form className="reset-form" onSubmit={handleSubmit}>
        <h2 className="reset-title">¿Olvidaste tu contraseña?</h2>

        {!success ? (
          <>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "14px",
                textAlign: "center",
                marginBottom: "20px"
              }}
            >
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
            </p>

            {error && <div className="reset-error">{error}</div>}

            <div className="reset-field">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
            </div>

            <button
              className="reset-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </>
        ) : (
          <>
            <div className="reset-modal-content">
              <p style={{ fontSize: "40px" }}>📬</p>

              <h3>Correo enviado</h3>

              <p>
                Hemos enviado un enlace de recuperación a:
              </p>

              <strong>{email}</strong>
            </div>
          </>
        )}

        <div className="reset-links">
          <Link to="/">Volver al inicio de sesión</Link>
        </div>
      </form>
    </div>
  );
}

export default ResetPage;