import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "./Firebase";
import {
  signInWithEmailAndPassword,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";

function ResetPage() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // STEP 1 — Verificar que el usuario existe y sabe su contraseña actual
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!email) return setError("El email es obligatorio");
    if (!email.includes("@")) return setError("Email inválido");
    if (!currentPassword) return setError("Ingresa tu contraseña actual");

    setError("");
    setLoading(true);

    try {
      // 🔥 Verificamos que el usuario existe y la contraseña actual es correcta
      await signInWithEmailAndPassword(auth, email, currentPassword);
      setStep(2);
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/invalid-credential":
          setError("Correo o contraseña actual incorrectos");
          break;
        case "auth/wrong-password":
          setError("Contraseña actual incorrecta");
          break;
        case "auth/invalid-email":
          setError("Correo inválido");
          break;
        case "auth/too-many-requests":
          setError("Demasiados intentos. Espera un momento");
          break;
        default:
          setError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — Cambiar la contraseña real en Firebase
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword)
      return setError("Todos los campos son obligatorios");
    if (password.length < 6)
      return setError("Mínimo 6 caracteres");
    if (!/\d/.test(password))
      return setError("Debe contener al menos un número");
    if (password !== confirmPassword)
      return setError("Las contraseñas no coinciden");
    if (password === currentPassword)
      return setError("La nueva contraseña debe ser diferente a la actual");

    setError("");
    setLoading(true);

    try {
      const user = auth.currentUser;

      // 🔥 Re-autenticar antes de cambiar contraseña (requerido por Firebase)
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // 🔥 Cambiar la contraseña real en Firebase
      await updatePassword(user, password);

      setShowModal(true);
    } catch (err) {
      switch (err.code) {
        case "auth/requires-recent-login":
          setError("Sesión expirada. Vuelve al paso anterior");
          setStep(1);
          break;
        case "auth/weak-password":
          setError("Contraseña muy débil");
          break;
        default:
          setError("Error al cambiar contraseña: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <form className="reset-form">
        <h2 className="reset-title">Cambiar Contraseña</h2>

        {error && <div className="reset-error">{error}</div>}

        {/* STEP 1 — Email + contraseña actual */}
        {step === 1 && (
          <>
            <div className="reset-field">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="Ingresa tu email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
              />
            </div>

            <div className="reset-field">
              <label>Contraseña actual</label>
              <input
                type="password"
                placeholder="Tu contraseña actual"
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setError(""); }}
              />
            </div>

            <button className="reset-btn" onClick={handleEmailSubmit} disabled={loading}>
              {loading ? "Verificando..." : "Continuar"}
            </button>

            <div className="reset-links">
              <Link to="/">Volver al inicio de sesión</Link>
            </div>
          </>
        )}

        {/* STEP 2 — Nueva contraseña */}
        {step === 2 && (
          <>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", marginBottom: "14px", textAlign: "center" }}>
              Cambiando contraseña de <strong style={{color:"white"}}>{email}</strong>
            </p>

            <div className="reset-field">
              <label>Nueva contraseña</label>
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
              />
            </div>

            <div className="reset-field">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              />
            </div>

            <button className="reset-btn" onClick={handlePasswordSubmit} disabled={loading}>
              {loading ? "Cambiando..." : "Cambiar contraseña"}
            </button>
          </>
        )}
      </form>

      {/* MODAL ÉXITO */}
      {showModal && (
        <div className="reset-modal">
          <div className="reset-modal-content">
            <p style={{ fontSize: "40px" }}>🔐</p>
            <h3>¡Contraseña actualizada!</h3>
            <p style={{ fontSize: "13px", margin: "8px 0 16px" }}>
              La contraseña de <strong>{email}</strong> fue cambiada exitosamente
            </p>
            <Link to="/">Ir al inicio de sesión</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPage;