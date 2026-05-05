import { useEffect, useState } from "react";
import { auth } from "./Firebase";
import { useNavigate } from "react-router-dom";

function WelcomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
      } else {
        navigate("/", { replace: true });
      }
    });
    return () => unsubscribe();
  }, []);

  if (!user) return null;

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="avatar">
          {user.photoURL ? (
            <img src={user.photoURL} alt="foto de perfil" />
          ) : (
            <span>{user.displayName?.charAt(0) || user.email?.charAt(0)}</span>
          )}
        </div>

        <h1>¡Bienvenido!</h1>
        <p className="name">{user.displayName || "Usuario"}</p>
        <p className="email">{user.email}</p>

        <p className="message">Tu cuenta ha sido registrada exitosamente 🎉</p>

        <button onClick={() => navigate("/Dashboard", { replace: true })}>
          Ir al dashboard
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;