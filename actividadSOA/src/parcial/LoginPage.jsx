import { useState } from "react";


function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    
    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (!email.includes("@")) {
      setError("Email inválido");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    setError("");
    alert("Datos correctos: " + email + " - " + password);
  };

  return (
    <div>
      <h2>Login</h2>
 {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Correo electronico</label>
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} required
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

       

        <input type="submit" value="Iniciar sesión"  className="login"/>

      
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