import { useState } from "react";


function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password || !username) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (!email.includes("@")) {
      setError("Email inválido. Debe contener @");
      return;
    }

    const emailParts = email.split("@");
    if (emailParts.length !== 2 || !emailParts[1].includes(".")) {
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

    setError("");
    alert(`Registro exitoso!\nEmail: ${email}\nUsername: ${username}`);

    setEmail("");
    setPassword("");
    setUsername("");
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

        <button type="submit">Crear cuenta</button>

        <div className="links">
          <a href="/">¿Ya tienes una cuenta? Inicia sesión</a>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;