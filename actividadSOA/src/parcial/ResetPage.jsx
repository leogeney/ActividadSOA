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

    if (!email) {
      setError("El email es obligatorio");
      return;
    }

    if (!email.includes("@")) {
      setError("Email inválido");
      return;
    }

    setError("");
    setStep(2);
  };

  // 🔵 PASO 2: VALIDAR CONTRASEÑA
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (password.length < 6) {
      setError("Mínimo 6 caracteres");
      return;
    }

    if (!/\d/.test(password)) {
      setError("Debe contener al menos un número");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setError("");
    setShowModal(true);
  };

  return (
    <div className="container">
      <div>
        <h2>Cambiar Contraseña</h2>

        {error && <p>{error}</p>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button type="submit">Continuar</button>

            <div className="links">
              <Link to="/">Volver al inicio de sesión</Link>
            </div>
          </form>
        )}

  
        {step === 2 && (
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button type="submit">Cambiar contraseña</button>
          </form>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>¡Contraseña actualizada!</h3>
            <p>La contraseña del correo {email} fue cambiada correctamente</p>

            <Link to="/">Ir al inicio de sesión</Link>
            <br />
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResetPage;