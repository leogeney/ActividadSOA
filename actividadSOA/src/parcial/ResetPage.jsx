import { useState } from "react";
import { Link } from "react-router-dom";

function ResetPage() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();

    if (!email) return setError("El email es obligatorio");
    if (!email.includes("@")) return setError("Email inválido");

    setError("");
    setStep(2);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (!password || !confirmPassword)
      return setError("Todos los campos son obligatorios");

    if (password.length < 6)
      return setError("Mínimo 6 caracteres");

    if (!/\d/.test(password))
      return setError("Debe contener al menos un número");

    if (password !== confirmPassword)
      return setError("Las contraseñas no coinciden");

    setError("");
    setShowModal(true);
  };

  return (
    <div className="reset-container">
      <form className="reset-form">
        <h2 className="reset-title">Cambiar Contraseña</h2>

        {error && <div className="reset-error">{error}</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="reset-field">
              <label>Correo</label>
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

            <button className="reset-btn" onClick={handleEmailSubmit}>
              Continuar
            </button>

            <div className="reset-links">
              <Link to="/">Volver al inicio de sesión</Link>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="reset-field">
              <label>Nueva contraseña</label>
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />
            </div>

            <div className="reset-field">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
              />
            </div>

            <button className="reset-btn" onClick={handlePasswordSubmit}>
              Cambiar contraseña
            </button>
          </>
        )}
      </form>

      {showModal && (
        <div className="reset-modal">
          <div className="reset-modal-content">
            <h3>¡Contraseña actualizada!</h3>
            <p>La contraseña de {email} fue cambiada</p>

            <Link to="/">Ir al inicio</Link>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPage;