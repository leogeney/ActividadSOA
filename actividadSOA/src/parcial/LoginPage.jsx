import { useState } from "react";
import { auth, googleProvider } from "./Firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // LOGIN NORMAL
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("Usuario:", userCredential.user);
      setError("");
      alert("Login exitoso");

    } catch (err) {
      setError("Correo o contraseña incorrectos");
    }

    setLoading(false);
  };

  // LOGIN CON GOOGLE
  const handleGoogleLogin = async () => {
    if (loading) return; // evita doble clic

    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google:", result.user);

      setError("");
      alert("Login con Google exitoso");

    } catch (err) {
      // ❌ IGNORA ESTE ERROR ESPECÍFICO
      if (err.code !== "auth/cancelled-popup-request") {
        setError("Error con Google");
      }
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>

        {error && <p>{error}</p>}

        <div>
          <label>Correo electrónico</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <input
          type="submit"
          value={loading ? "Cargando..." : "Iniciar sesión"}
          disabled={loading}
        />

        {/* BOTÓN GOOGLE */}
        <button
          type="button"
          className="google"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Iniciar sesión con Google"}
        </button>

        <div className="links">
          <a href="/register">Registrarse</a>
          <a href="/Reset">Cambiar contraseña</a>
          <a href="/forgot">Recuperar cuenta</a>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;