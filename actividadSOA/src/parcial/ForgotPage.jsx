import { useState } from "react";
import { Link } from "react-router-dom";


function ForgotPage() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [realCode, setRealCode] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const generarCodigo = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setRealCode(newCode);
    alert("Código enviado (simulación): " + newCode);
  };

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
    setLoading(true);

    setTimeout(() => {
      generarCodigo();
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleCodeChange = (value) => {
    setCode(value);

    if (value.length === 6) {
      if (value !== realCode) {
        setCodeError("Código incorrecto");
      } else {
        setCodeError("");
        setStep(3);
      }
    }
  };

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
      <form>
        <h2>Recuperar Cuenta</h2>

        {error && <div className="error">{error}</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="field">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="Ingresa tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button onClick={handleEmailSubmit} type="submit">
              {loading ? "Enviando..." : "Enviar código"}
            </button>

            <div className="links">
              <Link to="/">Volver al inicio de sesión</Link>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <p style={{ color: "#fff", marginBottom: "10px" }}>
              Código enviado a <b>{email}</b>
            </p>

            <div className="field">
              <label>Código de verificación</label>
              <input
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
              />
            </div>

            {codeError && <div className="error">{codeError}</div>}
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <div className="field">
              <label>Nueva contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Confirmar contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" onClick={handlePasswordSubmit}>
              Cambiar contraseña
            </button>
          </>
        )}
      </form>

      {/* MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>¡Éxito!</h3>
            <p>La contraseña de {email} fue actualizada</p>

            <Link to="/">Ir al inicio de sesión</Link>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForgotPage;