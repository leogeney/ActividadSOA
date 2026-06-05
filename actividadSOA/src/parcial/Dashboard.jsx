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
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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

  const filteredUsers = allUsers.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.nombre || "").toLowerCase().includes(q) ||
      (u.apellido || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  const getInitials = () => {
    const name = userData?.nombre || user?.displayName || user?.email || "U";
    const last = userData?.apellido || "";
    if (last) return `${name[0]}${last[0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getFullName = () => {
    if (userData?.nombre) {
      return `${userData.nombre}${userData?.apellido ? " " + userData.apellido : ""}`;
    }
    return user?.displayName || user?.email?.split("@")[0] || "Usuario";
  };

  const tabs =
    role === "admin"
      ? [
          { id: "home", label: "Directorio", icon: "◈" },
          
        ]
      : [
          { id: "home", label: "Inicio", icon: "◈" },
          { id: "profile", label: "Mi Perfil", icon: "◉" },
        ];

  if (loading) {
    return (
      <div style={styles.container}>
        <div className="spinner"></div>
        <style>{`
          .spinner {
            width: 50px; height: 50px;
            border: 5px solid rgba(255,255,255,0.1);
            border-top: 5px solid #a855f7;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      {/* ── HEADER ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          {/* Logo / Brand */}
          <div style={styles.brand}>
            <div style={styles.brandIcon}>⬡</div>
            <span style={styles.brandName}>LOS GALACTICOS</span>
          </div>

          {/* Nav tabs */}
          <nav style={styles.nav}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.navBtn,
                  ...(activeTab === tab.id ? styles.navBtnActive : {}),
                }}
                className="nav-btn"
              >
                <span style={{ marginRight: "7px", fontSize: "12px" }}>{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && <span style={styles.navIndicator} />}
              </button>
            ))}
          </nav>

          {/* Right side: avatar + logout */}
          <div style={styles.headerRight}>
            {/* Avatar pill */}
            <button
              onClick={() => setActiveTab("profile")}
              style={{
                ...styles.avatarPill,
                ...(activeTab === "profile" ? styles.avatarPillActive : {}),
              }}
              className="avatar-pill"
              title="Ver perfil"
            >
              <AvatarImg photoURL={user?.photoURL} initials={getInitials()} size={32} />
              <span style={styles.avatarName}>{getFullName()}</span>
              <span
                style={{
                  ...styles.roleDot,
                  background: role === "admin" ? "#a855f7" : "#3b82f6",
                }}
              />
            </button>

            {/* Logout button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={styles.logoutBtn}
              className="logout-btn"
              title="Cerrar sesión"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span style={{ marginLeft: "7px" }}>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── LOGOUT CONFIRM MODAL ── */}
      {showLogoutConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowLogoutConfirm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalIcon}>⚠</div>
            <h3 style={styles.modalTitle}>¿Cerrar sesión?</h3>
            <p style={styles.modalText}>
              Tu sesión actual se cerrará y tendrás que volver a iniciar sesión para acceder.
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={styles.modalCancel}
                className="modal-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                style={styles.modalConfirm}
                className="modal-confirm"
              >
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={styles.main}>
        <div style={styles.card}>

          {/* ── TAB: HOME (admin = directorio / user = bienvenida) ── */}
          {activeTab === "home" && (
            <div style={styles.fadeIn}>
              {role === "admin" ? (
                <>
                  <div style={styles.sectionHeader}>
                    <div>
                      <h2 style={styles.cardTitle}>
                        Directorio de Usuarios
                        <span style={{ marginLeft: 10, fontSize: 18 }}>🛡️</span>
                      </h2>
                      <p style={styles.cardSubtitle}>Gestiona todos los miembros registrados</p>
                    </div>
                    <span style={styles.countTag}>
                      {filteredUsers.length} / {allUsers.length} total
                    </span>
                  </div>

                  <div style={styles.searchWrapper}>
                    <span style={styles.searchIcon}>🔍</span>
                    <input
                      type="text"
                      placeholder="Buscar por nombre, email, rol..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={styles.searchInput}
                      className="search-input"
                    />
                    {search && (
                      <button onClick={() => setSearch("")} style={styles.clearBtn}>✕</button>
                    )}
                  </div>

                  {filteredUsers.length === 0 ? (
                    <p style={styles.empty}>
                      {search ? `Sin resultados para "${search}".` : "No hay registros."}
                    </p>
                  ) : (
                    <div style={styles.tableWrapper}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            {["Usuario", "Email", "Registro", "Estado", "Rol"].map((h) => (
                              <th key={h} style={styles.th}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((u, i) => (
                            <tr key={u.uid || i} className="table-row" style={styles.tr}>
                              <td style={styles.td}>
                                <div style={{ fontWeight: "600" }}>
                                  {u.nombre || u.username || "Sin nombre"}
                                </div>
                                <div style={{ fontSize: "11px", opacity: 0.6 }}>{u.apellido || ""}</div>
                              </td>
                              <td style={styles.td}>{u.email}</td>
                              <td style={styles.td}>{formatDate(u.tiempoInicial || u.createdAt)}</td>
                              <td style={styles.td}>
                                <span style={{
                                  ...styles.statusBadge,
                                  color: u.activo !== false ? "#4ade80" : "#fb7185",
                                  background: u.activo !== false ? "rgba(74,222,128,0.1)" : "rgba(251,113,133,0.1)",
                                }}>
                                  {u.activo !== false ? "● Activo" : "○ Inactivo"}
                                </span>
                              </td>
                              <td style={styles.td}>
                                <span style={{
                                  ...styles.miniBadge,
                                  border: `1px solid ${u.role === "admin" ? "#a855f7" : "#3b82f6"}`,
                                }}>
                                  {u.role || "user"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                /* User welcome */
                <div style={styles.welcomeBox}>
                  <AvatarImg photoURL={user?.photoURL} initials={getInitials()} size={80} />
                  <h2 style={styles.welcomeTitle}>Bienvenido, {userData?.nombre || "Usuario"} 👋</h2>
                  <p style={styles.welcomeSub}>
                    Accede a tu perfil desde el menú superior o desde el botón de abajo.
                  </p>
                  <button
                    onClick={() => setActiveTab("profile")}
                    style={styles.welcomeBtn}
                    className="btn-hover"
                  >
                    Ver mi perfil →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: PROFILE ── */}
          {activeTab === "profile" && (
            <div style={styles.fadeIn}>
              {/* Profile hero */}
              <div style={styles.profileHero}>
                <AvatarImg photoURL={user?.photoURL} initials={getInitials()} size={72} />
                <div style={styles.profileHeroInfo}>
                  <h2 style={styles.profileName}>{getFullName()}</h2>
                  <p style={styles.profileEmail}>{user?.email}</p>
                  <span style={{
                    ...styles.profileRoleBadge,
                    background: role === "admin"
                      ? "linear-gradient(135deg,#a855f7,#7e22ce)"
                      : "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                  }}>
                    {role === "admin" ? "🛡️ Administrador" : "👤 Miembro"}
                  </span>
                </div>
                <div style={{
                  ...styles.profileStatus,
                  color: userData?.activo !== false ? "#4ade80" : "#fb7185",
                  background: userData?.activo !== false ? "rgba(74,222,128,0.08)" : "rgba(251,113,133,0.08)",
                  border: `1px solid ${userData?.activo !== false ? "rgba(74,222,128,0.25)" : "rgba(251,113,133,0.25)"}`,
                }}>
                  {userData?.activo !== false ? "● Cuenta activa" : "○ Cuenta inactiva"}
                </div>
              </div>

              <div style={styles.divider} />

              {/* Info grid */}
              <h3 style={styles.sectionLabel}>Información Personal</h3>
              <div style={styles.infoGrid}>
                
                <InfoCard label="Username" value={userData?.username || "No asignado"} icon="🪪" />
                <InfoCard label="Correo Electrónico" value={user?.email} icon="✉️" />
                <InfoCard label="Fecha de Alta" value={formatDate(userData?.tiempoInicial || userData?.createdAt)} icon="📅" />
                <InfoCard label="Última Salida" value={formatDate(userData?.salida)} icon="🕐" />
              </div>

              <div style={styles.divider} />

              {/* Logout from profile */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  style={styles.profileLogoutBtn}
                  className="btn-hover"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Finalizar Sesión
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'DM Sans', system-ui, sans-serif; }
        .table-row { transition: background 0.2s; }
        .table-row:hover { background: rgba(255,255,255,0.03); }
        .btn-hover { transition: all 0.25s ease; }
        .btn-hover:hover { transform: translateY(-2px); filter: brightness(1.12); box-shadow: 0 8px 20px rgba(168,85,247,0.35); }
        .nav-btn { transition: all 0.2s ease; }
        .nav-btn:hover { color: #f1f5f9 !important; background: rgba(255,255,255,0.06) !important; }
        .avatar-pill { transition: all 0.2s ease; }
        .avatar-pill:hover { background: rgba(255,255,255,0.08) !important; }
        .logout-btn { transition: all 0.2s ease; }
        .logout-btn:hover { background: rgba(251,113,133,0.15) !important; color: #fb7185 !important; border-color: rgba(251,113,133,0.3) !important; }
        .modal-cancel { transition: all 0.2s; }
        .modal-cancel:hover { background: rgba(255,255,255,0.08) !important; }
        .modal-confirm { transition: all 0.2s; }
        .modal-confirm:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .search-input::placeholder { color: #475569; }
        .search-input:focus { outline: none; border-color: rgba(168,85,247,0.5) !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

/* ── Sub-components ── */

function AvatarImg({ photoURL, initials, size }) {
  const [imgError, setImgError] = useState(false);

  const base = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    boxShadow: size >= 60 ? "0 0 30px rgba(168,85,247,0.35)" : "none",
  };

  if (photoURL && !imgError) {
    return (
      <div style={base}>
        <img
          src={photoURL}
          alt="Foto de perfil"
          onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        ...base,
        background: "linear-gradient(135deg,#a855f7,#3b82f6)",
        fontSize: size >= 60 ? `${Math.round(size * 0.33)}px` : "12px",
        fontWeight: "800",
        color: "white",
        letterSpacing: "-0.5px",
      }}
    >
      {initials}
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div style={styles.infoCard}>
      <span style={styles.infoCardIcon}>{icon}</span>
      <div>
        <div style={styles.infoCardLabel}>{label}</div>
        <div style={styles.infoCardValue}>{value || "—"}</div>
      </div>
    </div>
  );
}

/* ── Styles ── */
const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background: "#0a0a0c",
    backgroundImage: "radial-gradient(circle at 50% 50%, #1a0b2e 0%, #0a0a0c 100%)",
    color: "#e2e8f0",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "fixed", width: "350px", height: "350px",
    background: "#7e22ce", filter: "blur(110px)",
    opacity: 0.12, top: "5%", left: "5%", zIndex: 0, pointerEvents: "none",
  },
  blob2: {
    position: "fixed", width: "350px", height: "350px",
    background: "#1d4ed8", filter: "blur(110px)",
    opacity: 0.12, bottom: "5%", right: "5%", zIndex: 0, pointerEvents: "none",
  },

  /* HEADER */
  header: {
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(10,10,12,0.75)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  headerInner: {
    maxWidth: "1100px", margin: "0 auto",
    display: "flex", alignItems: "center",
    padding: "0 24px", height: "64px", gap: "16px",
  },
  brand: { display: "flex", alignItems: "center", gap: "10px", marginRight: "8px" },
  brandIcon: { fontSize: "22px", color: "#a855f7", lineHeight: 1 },
  brandName: {
    fontSize: "17px", fontWeight: "800", letterSpacing: "-0.3px",
    background: "linear-gradient(to right, #fff, #94a3b8)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  nav: { display: "flex", alignItems: "center", gap: "4px", flex: 1 },
  navBtn: {
    position: "relative", display: "flex", alignItems: "center",
    background: "none", border: "none", color: "#64748b",
    padding: "8px 16px", borderRadius: "10px", cursor: "pointer",
    fontSize: "14px", fontWeight: "500",
  },
  navBtnActive: { color: "#f1f5f9", background: "rgba(255,255,255,0.06)" },
  navIndicator: {
    position: "absolute", bottom: "-1px", left: "50%",
    transform: "translateX(-50%)", width: "20px", height: "2px",
    background: "linear-gradient(to right,#a855f7,#3b82f6)",
    borderRadius: "2px",
  },
  headerRight: { display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" },
  avatarPill: {
    display: "flex", alignItems: "center", gap: "10px",
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "40px", padding: "5px 14px 5px 5px",
    cursor: "pointer",
  },
  avatarPillActive: {
    background: "rgba(168,85,247,0.1)", borderColor: "rgba(168,85,247,0.3)",
  },
  avatar: { flexShrink: 0 },
  avatarName: { fontSize: "13px", fontWeight: "600", color: "#cbd5e1", whiteSpace: "nowrap" },
  roleDot: { width: "7px", height: "7px", borderRadius: "50%", flexShrink: 0 },
  logoutBtn: {
    display: "flex", alignItems: "center",
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    color: "#94a3b8", padding: "8px 16px", borderRadius: "10px",
    cursor: "pointer", fontSize: "13px", fontWeight: "600",
  },

  /* MODAL */
  modalOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(6px)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 200,
  },
  modal: {
    background: "rgba(20,20,28,0.98)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px", padding: "40px", maxWidth: "380px", width: "90%",
    textAlign: "center", animation: "modalIn 0.2s ease-out",
    boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
  },
  modalIcon: { fontSize: "36px", marginBottom: "16px" },
  modalTitle: { fontSize: "20px", fontWeight: "800", color: "#f8fafc", margin: "0 0 10px" },
  modalText: { fontSize: "14px", color: "#94a3b8", margin: "0 0 28px", lineHeight: 1.6 },
  modalActions: { display: "flex", gap: "12px" },
  modalCancel: {
    flex: 1, padding: "12px", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
    color: "#94a3b8", cursor: "pointer", fontSize: "14px", fontWeight: "600",
  },
  modalConfirm: {
    flex: 1, padding: "12px",
    background: "linear-gradient(135deg,#ef4444,#b91c1c)",
    border: "none", borderRadius: "12px",
    color: "white", cursor: "pointer", fontSize: "14px", fontWeight: "700",
  },

  /* MAIN */
  main: { maxWidth: "1100px", margin: "0 auto", padding: "32px 24px", position: "relative", zIndex: 1 },
  card: {
    background: "rgba(255,255,255,0.025)", backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px",
    padding: "36px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
  },
  fadeIn: { animation: "fadeIn 0.35s ease-out forwards" },

  /* SECTION HEADER */
  sectionHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "22px", fontWeight: "800", margin: "0 0 6px",
    background: "linear-gradient(to right,#fff,#a1a1aa)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  cardSubtitle: { fontSize: "13px", color: "#64748b", margin: 0 },
  countTag: {
    fontSize: "12px", background: "rgba(255,255,255,0.05)",
    padding: "4px 12px", borderRadius: "8px", color: "#94a3b8", whiteSpace: "nowrap",
  },
  sectionLabel: {
    fontSize: "13px", fontWeight: "700", color: "#64748b",
    textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 18px",
  },

  /* WELCOME (user home) */
  welcomeBox: {
    textAlign: "center", padding: "60px 20px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
  },
  welcomeAvatar: { flexShrink: 0 },
  welcomeTitle: { fontSize: "26px", fontWeight: "800", color: "#f8fafc", margin: 0 },
  welcomeSub: { fontSize: "14px", color: "#64748b", margin: 0 },
  welcomeBtn: {
    marginTop: "8px", padding: "12px 28px",
    background: "linear-gradient(135deg,#a855f7,#3b82f6)",
    border: "none", borderRadius: "12px",
    color: "white", fontWeight: "700", fontSize: "14px", cursor: "pointer",
  },

  /* PROFILE TAB */
  profileHero: {
    display: "flex", alignItems: "center", gap: "24px",
    background: "rgba(0,0,0,0.2)", borderRadius: "16px",
    padding: "28px 32px", marginBottom: "28px",
    border: "1px solid rgba(255,255,255,0.04)", flexWrap: "wrap",
  },
  profileAvatarLg: { flexShrink: 0 },
  profileHeroInfo: { flex: 1 },
  profileName: { fontSize: "22px", fontWeight: "800", color: "#f8fafc", margin: "0 0 4px" },
  profileEmail: { fontSize: "13px", color: "#94a3b8", margin: "0 0 12px" },
  profileRoleBadge: {
    display: "inline-block", padding: "5px 14px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "700", color: "white", letterSpacing: "0.5px",
  },
  profileStatus: {
    marginLeft: "auto", padding: "8px 16px",
    borderRadius: "10px", fontSize: "12px", fontWeight: "600",
  },

  /* INFO GRID */
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "14px", marginBottom: "28px",
  },
  infoCard: {
    display: "flex", alignItems: "flex-start", gap: "14px",
    background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: "12px", padding: "18px 20px",
  },
  infoCardIcon: { fontSize: "18px", marginTop: "2px", flexShrink: 0 },
  infoCardLabel: { fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" },
  infoCardValue: { fontSize: "15px", color: "#f1f5f9", fontWeight: "500", wordBreak: "break-all" },

  /* TABLE */
  searchWrapper: { position: "relative", display: "flex", alignItems: "center", marginBottom: "20px" },
  searchIcon: { position: "absolute", left: "14px", fontSize: "14px", pointerEvents: "none" },
  searchInput: {
    width: "100%", padding: "11px 40px",
    background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px", color: "#f1f5f9", fontSize: "14px", boxSizing: "border-box",
  },
  clearBtn: {
    position: "absolute", right: "12px", background: "none", border: "none",
    color: "#64748b", cursor: "pointer", fontSize: "13px",
  },
  tableWrapper: { overflowX: "auto", borderRadius: "12px", background: "rgba(0,0,0,0.2)" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: {
    padding: "14px 16px", fontSize: "11px", color: "#64748b",
    textTransform: "uppercase", letterSpacing: "1px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  td: { padding: "14px 16px", fontSize: "14px", color: "#cbd5e1" },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.02)" },
  statusBadge: { padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" },
  miniBadge: { padding: "2px 8px", borderRadius: "6px", fontSize: "10px", textTransform: "uppercase" },

  divider: {
    height: "1px", margin: "24px 0",
    background: "linear-gradient(to right,rgba(255,255,255,0),rgba(255,255,255,0.08),rgba(255,255,255,0))",
  },
  profileLogoutBtn: {
    display: "flex", alignItems: "center",
    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
    color: "#fb7185", padding: "11px 22px", borderRadius: "12px",
    cursor: "pointer", fontSize: "14px", fontWeight: "600",
  },
  empty: { color: "#64748b", textAlign: "center", padding: "40px 0", fontSize: "14px" },
  container: {
    minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
    background: "#0a0a0c",
  },
};

export default Dashboard;