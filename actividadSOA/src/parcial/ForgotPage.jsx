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

  // 🔥 GENERAR CÓDIGO
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
        setStep(3); // 🔥 pasa automáticamente
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
      <div>
        <h2>Recuperar Cuenta</h2>

        {error && <p>{error}</p>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {loading ? (
              <p>Enviando código...</p>
            ) : (
              <button type="submit">Enviar código</button>
            )}

            <div className="links">
              <Link to="/">Volver al inicio de sesion</Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <div>
            <p>Código enviado a: <b>{email}</b></p>

            <input
              type="text"
              placeholder="Ingresa el código"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
            />

            {codeError && <p>{codeError}</p>}
          </div>
        )}

      
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type={showPassword ? "text" : "password"}
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
            <h3>¡Éxito!</h3>
            <p>La contraseña del correo {email} fue actualizada</p>

            <Link to="/">Ir al inicio de sesion</Link>
            <br />
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForgotPage;