import { useState } from "react";
import { auth, db } from "./Firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername]             = useState("");
  const [nombre, setNombre]                 = useState("");
  const [apellido, setApellido]             = useState("");
  const [tiempoInicial, setTiempoInicial]   = useState(""); // fecha elegida por el usuario
  const [error, setError]                   = useState("");
  const [loading, setLoading]               = useState(false);
  const navigate = useNavigate();

  // ─── Validación de contraseña ───────────────────────────────────────────────
  const validatePassword = (pass) => {
    if (pass.length < 8)                           return "La contraseña debe tener mínimo 8 caracteres";
    if (!/[A-Z]/.test(pass))                       return "Debe contener al menos una letra mayúscula";
    if (!/[a-z]/.test(pass))                       return "Debe contener al menos una letra minúscula";
    if (!/\d/.test(pass))                          return "Debe contener al menos un número";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass))     return "Debe contener al menos un carácter especial";
    return null;
  };

  // ─── Indicador de fortaleza ─────────────────────────────────────────────────
  const getPasswordStrength = () => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8)                      score++;
    if (/[A-Z]/.test(password))                    score++;
    if (/[a-z]/.test(password))                    score++;
    if (/\d/.test(password))                       score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password))  score++;
    if (score <= 2) return { label: "Débil",  color: "red"    };
    if (score <= 4) return { label: "Media",  color: "orange" };
    return           { label: "Fuerte", color: "green"  };
  };

  const strength = getPasswordStrength();

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!email || !password || !confirmPassword || !username || !nombre || !apellido) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (!email.includes("@") || !email.split("@")[1]?.includes(".")) {
      setError("Email inválido");
      return;
    }
    if (nombre.trim().length < 2) {
      setError("El nombre debe tener mínimo 2 caracteres");
      return;
    }
    if (apellido.trim().length < 2) {
      setError("El apellido debe tener mínimo 2 caracteres");
      return;
    }
    if (username.length < 3) {
      setError("El username debe tener mínimo 3 caracteres");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("El username solo puede contener letras, números y guiones bajos");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Actualizar displayName
      await updateProfile(user, { displayName: `${nombre} ${apellido}` });

      // 3. Convertir tiempoInicial a Timestamp si el usuario eligió una fecha
      const tiempoInicialTs = tiempoInicial
        ? Timestamp.fromDate(new Date(tiempoInicial))
        : serverTimestamp(); // si no elige fecha, usa el momento actual

      // 4. Guardar en Firestore con TODOS los campos que usa el Dashboard
      await setDoc(doc(db, "users", user.uid), {
        uid:           user.uid,
        email:         user.email,
        username:      username,
        nombre:        nombre.trim(),
        apellido:      apellido.trim(),
        role:          "user",       // Para hacer admin, cámbialo en Firestore
        activo:        true,
        tiempoInicial: tiempoInicialTs,
        salida:        null,         // Se llena cuando el usuario "sale" / expira
        createdAt:     serverTimestamp(),
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

        {/* ─── Correo ─────────────────────────────────────────────────────── */}
        <div className="field">
          <label>Correo electrónico</label>
          <input
            type="email"                         
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
          />
        </div>

        {/* ─── Nombre y Apellido ───────────────────────────────────────────── */}
        <div className="field">
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => { setNombre(e.target.value); setError(""); }}
          />
        </div>

        <div className="field">
          <label>Apellido</label>
          <input
            type="text"
            placeholder="Tu apellido"
            value={apellido}
            onChange={(e) => { setApellido(e.target.value); setError(""); }}
          />
        </div>

        {/* ─── Username ───────────────────────────────────────────────────── */}
        <div className="field">
          <label>Nombre de usuario</label>
          <input
            type="text"
            placeholder="Solo letras, números y _"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(""); }}
          />
        </div>

        {/* ─── Tiempo inicial (opcional) ──────────────────────────────────── */}
        

        {/* ─── Contraseña ─────────────────────────────────────────────────── */}
        <div className="field">
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
          />
          {strength && (
            <small style={{ color: strength.color }}>Fortaleza: {strength.label}</small>
          )}
        </div>

        <div className="field">
          <label>Confirmar contraseña</label>
          <input
            type="password"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
          />
          {confirmPassword && (
            <small style={{ color: password === confirmPassword ? "green" : "red" }}>
              {password === confirmPassword ? "✓ Las contraseñas coinciden" : "✗ No coinciden"}
            </small>
          )}
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