import { useEffect, useState } from "react";
import { auth } from "./Firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Si no está logueado → lo sacas
        navigate("/", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/", { replace: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Bienvenido 👋</h2>

        {user && (
          <>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>UID:</strong> {user.uid}</p>
          </>
        )}

        <button onClick={handleLogout} style={styles.button}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f001f",
    color: "white",
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    padding: "30px",
    borderRadius: "15px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#a855f7",
    color: "white",
    cursor: "pointer",
  }
};

export default Dashboard;