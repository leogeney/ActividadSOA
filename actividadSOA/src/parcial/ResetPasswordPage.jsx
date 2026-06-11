import { useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { auth } from "./Firebase";
import { confirmPasswordReset } from "firebase/auth";


function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const oobCode = searchParams.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (pass) => {
    if (pass.length < 10)
      return "La contraseña debe tener mínimo 10 caracteres";

    if (!/[A-Z]/.test(pass))
      return "Debe contener al menos una mayúscula";

    if (!/[a-z]/.test(pass))
      return "Debe contener al menos una minúscula";

    if (!/\d/.test(pass))
      return "Debe contener al menos un número";

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass))
      return "Debe contener al menos un carácter especial";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Todos los campos son obligatorios");
      return;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!oobCode) {
      setError("Enlace inválido");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await confirmPasswordReset(auth, oobCode, password);

      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 3000);

    } catch (err) {
      switch (err.code) {
        case "auth/expired-action-code":
          setError("El enlace expiró");
          break;

        case "auth/invalid-action-code":
          setError("El enlace no es válido o ya fue usado");
          break;

        case "auth/weak-password":
          setError("La contraseña es muy débil");
          break;

        default:
          setError("Error al actualizar contraseña");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <form className="reset-form" onSubmit={handleSubmit}>
        <h2 className="reset-title">Nueva contraseña</h2>

        {!success ? (
          <>
            {error && <div className="reset-error">{error}</div>}

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

            <div
              style={{
                marginBottom: "15px",
                fontSize: "12px",
                lineHeight: "1.6"
              }}
            >
              <small style={{ color: password.length >= 10 ? "green" : "red" }}>
                {password.length >= 10 ? <FaCheck style={{color:"#4ade80",flexShrink:0}} /> : <FaTimes style={{color:"#fb7185",flexShrink:0}} />} Mínimo 10 caracteres
              </small>
              <br />

              <small style={{ color: /[A-Z]/.test(password) ? "green" : "red" }}>
                {/[A-Z]/.test(password) ? <FaCheck style={{color:"#4ade80",flexShrink:0}} /> : <FaTimes style={{color:"#fb7185",flexShrink:0}} />} Una mayúscula
              </small>
              <br />

              <small style={{ color: /[a-z]/.test(password) ? "green" : "red" }}>
                {/[a-z]/.test(password) ? <FaCheck style={{color:"#4ade80",flexShrink:0}} /> : <FaTimes style={{color:"#fb7185",flexShrink:0}} />} Una minúscula
              </small>
              <br />

              <small style={{ color: /\d/.test(password) ? "green" : "red" }}>
                {/\d/.test(password) ? <FaCheck style={{color:"#4ade80",flexShrink:0}} /> : <FaTimes style={{color:"#fb7185",flexShrink:0}} />} Un número
              </small>
              <br />

              <small
                style={{
                  color: /[!@#$%^&*(),.?":{}|<>]/.test(password)
                    ? "green"
                    : "red"
                }}
              >
                {/[!@#$%^&*(),.?":{}|<>]/.test(password)
                  ? <FaCheck style={{color:"#4ade80",flexShrink:0}} />
                  : <FaTimes style={{color:"#fb7185",flexShrink:0}} />} Un carácter especial
              </small>
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

            <button
              className="reset-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </>
        ) : (
          <>
            <div className="reset-modal-content">
              <p style={{ fontSize: "40px" }}><FaCheck /></p>
              <h3>Contraseña actualizada</h3>
              <p>Ya puedes iniciar sesión con tu nueva contraseña</p>
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

export default ResetPasswordPage;