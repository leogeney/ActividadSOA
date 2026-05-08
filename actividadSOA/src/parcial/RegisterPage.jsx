import { useState } from "react";
import { auth, db } from "./Firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [tiempoInicial, setTiempoInicial] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validatePassword = (pass) => {
    if (pass.length < 8) return "La contraseña debe tener mínimo 8 caracteres";
    if (!/[A-Z]/.test(pass)) return "Debe contener al menos una mayúscula";
    if (!/[a-z]/.test(pass)) return "Debe contener al menos una minúscula";
    if (!/\d/.test(pass)) return "Debe contener al menos un número";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass))
      return "Debe contener al menos un carácter especial";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const telefonoLimpio = telefono.replace(/\s+/g, "");

    if (
      !email ||
      !telefonoLimpio ||
      !password ||
      !confirmPassword ||
      !username ||
      !nombre ||
      !apellido
    ) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (!/^\d{10,15}$/.test(telefonoLimpio)) {
      setError("Número de teléfono inválido");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${nombre} ${apellido}`
      });

      const tiempoInicialTs = tiempoInicial
        ? Timestamp.fromDate(new Date(tiempoInicial))
        : serverTimestamp();

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        telefono: telefonoLimpio,
        username,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        role: "user",
        activo: true,
        tiempoInicial: tiempoInicialTs,
        salida: null,
        createdAt: serverTimestamp()
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
        default:
          setError("Error al crear cuenta");
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
            type="email"
            placeholder="correo@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />
        </div>

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

        <div className="field">
          <label>Nombre</label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="field">
          <label>Apellido</label>
          <input
            type="text"
            placeholder="Tu apellido"
            value={apellido}
            onChange={(e) => {
              setApellido(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="field">
          <label>Nombre de usuario</label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="field">
  <label>Contraseña</label>
  <input
    type="password"
    placeholder="Tu contraseña"
    value={password}
    onChange={(e) => {
      setPassword(e.target.value);
      setError("");
    }}
  />

  <div style={{ marginTop: "8px", fontSize: "12px", lineHeight: "1.6" }}>
    <small style={{ color: password.length >= 8 ? "green" : "red" }}>
      {password.length >= 8 ? "✓" : "✗"} Mínimo 8 caracteres
    </small>
    <br />

    <small style={{ color: /[A-Z]/.test(password) ? "green" : "red" }}>
      {/[A-Z]/.test(password) ? "✓" : "✗"} Al menos una letra mayúscula
    </small>
    <br />

    <small style={{ color: /[a-z]/.test(password) ? "green" : "red" }}>
      {/[a-z]/.test(password) ? "✓" : "✗"} Al menos una letra minúscula
    </small>
    <br />

    <small style={{ color: /\d/.test(password) ? "green" : "red" }}>
      {/\d/.test(password) ? "✓" : "✗"} Al menos un número
    </small>
    <br />

    <small
      style={{
        color: /[!@#$%^&*(),.?":{}|<>]/.test(password)
          ? "green"
          : "red"
      }}
    >
      {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "✓" : "✗"} Al menos un carácter especial
    </small>
  </div>
</div>

        <div className="field">
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

        <button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear cuenta"}
        </button>

        <div className="links">
          <a href="/">¿Ya tienes cuenta?</a>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;