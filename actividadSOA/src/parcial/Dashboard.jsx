import { useEffect, useState } from "react";
import { auth, db } from "./Firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/", { replace: true });
        return;
      }
      setUser(currentUser);
      try {
        const docSnap = await getDoc(doc(db, "users", currentUser.uid));
        const data = docSnap.exists() ? docSnap.data() : {};
        const userRole = data.role || "user";
        setRole(userRole);
        setUserData(data);

        if (userRole === "admin") {
          const snapshot = await getDocs(collection(db, "users"));
          const list = snapshot.docs.map((d) => d.data());
          setAllUsers(list);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        setRole("user");
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/", { replace: true });
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div className="spinner"></div>
        <style>{`
          .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255,255,255,0.1);
            border-top: 5px solid #a855f7;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Background Decor */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>
              {role === "admin" ? "Admin Control" : "Mi Espacio"}
              <span style={{ marginLeft: '10px', fontSize: '20px' }}>
                {role === "admin" ? "🛡️" : "👤"}
              </span>
            </h2>
            <p style={styles.subtitle}>{user?.email}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              ...styles.badge, 
              background: role === "admin" ? "linear-gradient(135deg, #a855f7, #7e22ce)" : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              boxShadow: role === "admin" ? "0 4px 15px rgba(168, 85, 247, 0.4)" : "0 4px 15px rgba(59, 130, 246, 0.4)"
            }}>
              {role === "admin" ? "Administrador" : "Miembro Pro"}
            </span>
          </div>
        </div>

        <div style={styles.divider} />

        {/* VISTA ADMIN */}
        {role === "admin" && (
          <div style={styles.sectionFadeIn}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Directorio de Usuarios</h3>
              <span style={styles.countTag}>{allUsers.length} total</span>
            </div>
            
            {allUsers.length === 0 ? (
              <p style={styles.empty}>No se encontraron registros en la base de datos.</p>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Usuario</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Registro</th>
                      <th style={styles.th}>Estado</th>
                      <th style={styles.th}>Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u, i) => (
                      <tr key={u.uid || i} className="table-row" style={styles.tr}>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '600' }}>{u.nombre || u.username || "Sin nombre"}</div>
                          <div style={{ fontSize: '11px', opacity: 0.6 }}>{u.apellido || ""}</div>
                        </td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>{formatDate(u.tiempoInicial || u.createdAt)}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            color: u.activo !== false ? "#4ade80" : "#fb7185",
                            background: u.activo !== false ? "rgba(74, 222, 128, 0.1)" : "rgba(251, 113, 133, 0.1)",
                          }}>
                            {u.activo !== false ? "● Activo" : "○ Inactivo"}
                          </span>
                        </td>
                        <td style={styles.td}>
                           <span style={{ ...styles.miniBadge, border: `1px solid ${u.role === 'admin' ? '#a855f7' : '#3b82f6'}` }}>
                            {u.role || "user"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VISTA USUARIO */}
        {role === "user" && (
          <div style={styles.sectionFadeIn}>
            <h3 style={styles.sectionTitle}>Detalles de Perfil</h3>
            <div style={styles.infoBox}>
              <div style={styles.infoGrid}>
                <InfoItem label="Nombre Completo" value={`${userData?.nombre || user?.displayName || "—"} ${userData?.apellido || ""}`} />
                <InfoItem label="ID de Usuario" value={userData?.username || "No asignado"} />
                <InfoItem label="Correo Electrónico" value={user?.email} />
                <InfoItem label="Fecha de Alta" value={formatDate(userData?.tiempoInicial || userData?.createdAt)} />
                <InfoItem label="Última Salida" value={formatDate(userData?.salida)} />
                <InfoItem label="Estado de Cuenta" value={
                  <span style={{ color: userData?.activo !== false ? "#4ade80" : "#fb7185", fontWeight: '600' }}>
                    {userData?.activo !== false ? "Verificada" : "Inactiva"}
                  </span>
                } />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
          <button onClick={handleLogout} style={styles.buttonLogout} className="btn-hover">
            Finalizar Sesión
          </button>
        </div>
      </div>

      {/* Global CSS for animations & hovers */}
      <style>{`
        .table-row { transition: background 0.2s ease; }
        .table-row:hover { background: rgba(255,255,255,0.03); }
        .btn-hover { transition: all 0.3s ease; }
        .btn-hover:hover { 
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(168, 85, 247, 0.4);
          filter: brightness(1.1);
        }
      `}</style>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0a0a0c",
    backgroundImage: "radial-gradient(circle at 50% 50%, #1a0b2e 0%, #0a0a0c 100%)",
    color: "#e2e8f0",
    padding: "20px",
    fontFamily: "'Inter', system-ui, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: '#7e22ce',
    filter: 'blur(100px)',
    opacity: '0.15',
    top: '10%',
    left: '10%',
    zIndex: 0,
  },
  blob2: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: '#3b82f6',
    filter: 'blur(100px)',
    opacity: '0.15',
    bottom: '10%',
    right: '10%',
    zIndex: 0,
  },
  card: {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "40px",
    borderRadius: "24px",
    width: "100%",
    maxWidth: "1000px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    margin: 0,
    background: "linear-gradient(to right, #fff, #a1a1aa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#94a3b8",
    fontSize: "14px",
    letterSpacing: "0.5px",
  },
  badge: {
    padding: "6px 16px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "700",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  divider: {
    height: "1px",
    background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.1), rgba(255,255,255,0))",
    margin: "25px 0",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#f8fafc",
    margin: 0,
  },
  countTag: {
    fontSize: "12px",
    background: "rgba(255,255,255,0.05)",
    padding: "4px 10px",
    borderRadius: "8px",
    color: "#94a3b8",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
    background: "rgba(0,0,0,0.2)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "16px",
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#cbd5e1",
  },
  tr: {
    borderBottom: "1px solid rgba(255,255,255,0.02)",
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  miniBadge: {
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "10px",
    textTransform: "uppercase",
  },
  infoBox: {
    background: "rgba(0,0,0,0.2)",
    borderRadius: "16px",
    padding: "30px",
    border: "1px solid rgba(255,255,255,0.03)",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "30px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  infoLabel: {
    fontSize: "11px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  infoValue: {
    fontSize: "15px",
    color: "#f1f5f9",
    fontWeight: "500",
  },
  buttonLogout: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "white",
    padding: "12px 28px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  sectionFadeIn: {
    animation: "fadeIn 0.5s ease-out forwards",
  },
};

export default Dashboard;