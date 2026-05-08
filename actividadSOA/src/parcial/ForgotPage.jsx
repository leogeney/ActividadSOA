import { useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "./Firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

function ForgotPage() {
  const [step, setStep] = useState(1);
  const [telefono, setTelefono] = useState("");
  const [emailFound, setEmailFound] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Oculta el email: te***@gmail.com
  const maskEmail = (email) => {
    const [user, domain] = email.split("@");
    const visible = user.slice(0, 2);
    return `${visible}${"*".repeat(user.length - 2)}@${domain}`;
  };

  // Paso 1 — buscar cuenta por teléfono
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();

    const telefonoLimpio = telefono.replace(/\s+/g, "");

    if (!telefonoLimpio) {
      setError("El número de teléfono es obligatorio");
      return;
    }

    if (!/^\d{10,15}$/.test(telefonoLimpio)) {
      setError("Número de teléfono inválido");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const q = query(
        collection(db, "users"),
        where("telefono", "==", telefonoLimpio)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("No encontramos una cuenta con ese número de teléfono");
        return;
      }

      const userData = snapshot.docs[0].data();
      setEmailFound(userData.email);
      setStep(2);

    } catch (err) {
      setError("Error al buscar la cuenta. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Paso 2 — enviar correo de recuperación
  const handleSendEmail = async () => {
    setLoading(true);
    setError("");

    try {
      const actionCodeSettings = {
        url: "http://localhost:5173/reset-password",
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, emailFound, actionCodeSettings);
      setStep(3);

    } catch (err) {
      switch (err.code) {
        case "auth/too-many-requests":
          setError("Demasiados intentos. Intenta más tarde");
          break;
        default:
          setError("Error al enviar el correo. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handlePhoneSubmit} noValidate>
        <h2>Recuperar cuenta</h2>

        {error && <div className="error">{error}</div>}

        {/* PASO 1 — Ingresar teléfono */}
        {step === 1 && (
          <>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "20px" }}>
              Ingresa el número de teléfono asociado a tu cuenta
            </p>

            <div className="field">
              <label>Número de teléfono</label>
              <input
                type="tel"
                placeholder="3001234567"
                value={telefono}
                onChange={(e) => {
                  setTelefono(e.target.value);
                  setError("");
                }}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Buscando..." : "Buscar cuenta"}
            </button>

            <div className="links">
              <Link to="/">Volver al inicio de sesión</Link>
            </div>
          </>
        )}

        {/* PASO 2 — Confirmar cuenta encontrada */}
        {step === 2 && (
          <>
            <div style={{
              background: "rgba(168,85,247,0.1)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderRadius: "10px",
              padding: "16px",
              textAlign: "center",
              marginBottom: "20px"
            }}>
              <p style={{ fontSize: "28px", marginBottom: "8px" }}>👤</p>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
                Encontramos una cuenta asociada a ese número
              </p>
              <p style={{ color: "white", fontWeight: "700", fontSize: "16px", marginTop: "8px" }}>
                {maskEmail(emailFound)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSendEmail}
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setTelefono(""); setError(""); }}
              style={{ background: "rgba(255,255,255,0.05)", color: "white", marginTop: "10px" }}
            >
              Usar otro número
            </button>

            <div className="links">
              <Link to="/">Volver al inicio de sesión</Link>
            </div>
          </>
        )}

        {/* PASO 3 — Correo enviado */}
        {step === 3 && (
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
              <p><strong>Correo enviado correctamente</strong></p>
              <p style={{ fontSize: "13px", marginTop: "6px" }}>
                Revisa tu bandeja de entrada en{" "}
                <strong>{maskEmail(emailFound)}</strong>{" "}
                y abre el enlace para cambiar tu contraseña.
              </p>
            </div>

            <button
              type="button"
              onClick={() => { setStep(1); setTelefono(""); setEmailFound(""); setError(""); }}
              style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
            >
              Intentar con otro número
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