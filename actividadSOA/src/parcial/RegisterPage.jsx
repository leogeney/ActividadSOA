import { useState } from "react";
import { auth } from "./Firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !username) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (!email.includes("@") || !email.split("@")[1]?.includes(".")) {
      setError("Email inválido. Formato: ejemplo@dominio.com");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres");
      return;
    }
    if (!/\d/.test(password)) {
      setError("La contraseña debe contener al menos un número");
      return;
    }
    if (username.length < 3) {
      setError("El username debe tener mínimo 3 caracteres");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 🔥 Esto crea el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Guarda el username como nombre visible
      await updateProfile(userCredential.user, {
        displayName: username,
      });

      navigate("/Welcome", { replace: true });

    } catch (err) {
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("Este correo ya está registrado");
          break;
        case "auth/invalid-email":
          setError("Correo inválido");
          break;
        case "auth/weak-password":
          setError("Contraseña muy débil");
          break;
        default:
          setError("Error al crear la cuenta: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>Crear cuenta</h2>

        {error && <div className="error">{error}</div>}

        <div className="field">
          <label>Correo electrónico</label>
          <input
            type="text"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Nombre de usuario</label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <div className="links">
          <a href="/">¿Ya tienes una cuenta? Inicia sesión</a>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;