import { useEffect, useState, useRef } from "react";
import { auth, db, googleProvider, githubProvider, facebookProvider } from "./Firebase";
import { onAuthStateChanged, signOut, linkWithPopup, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, where, limit, startAfter } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
applyPlugin(jsPDF);
import { 
  FaHome, FaCalendarAlt, FaClipboardList, FaUser, FaGem, FaShieldAlt,
  FaSearch, FaTimes, FaFilePdf, FaClock, FaPhone, FaIdCard, FaEnvelope,
  FaKey, FaHandPeace, FaExclamationTriangle, FaTrash, FaGithub,
  FaCheck, FaPlus, FaEdit, FaEye, FaArrowRight, FaGoogle, FaFacebook
} from "react-icons/fa";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ── Appointments CRUD state ──
  const [appointments, setAppointments] = useState([]);
  const [showApptModal, setShowApptModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [deletingAppt, setDeletingAppt] = useState(null);
  const [apptSearch, setApptSearch] = useState("");
  const [formClient, setFormClient] = useState("");
  const [formService, setFormService] = useState("");
  const [formStatus, setFormStatus] = useState("pendiente");
  const [formPhone, setFormPhone] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [takenSlots, setTakenSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [linkedProviders, setLinkedProviders] = useState([]);
  const [linkingProvider, setLinkingProvider] = useState(null);
  const [linkMsg, setLinkMsg] = useState("");

  // ── Audit logs state ──
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditFilter, setAuditFilter] = useState("todas");
  const [loadingAudit, setLoadingAudit] = useState(false);

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

        // Cargar citas (pasar el rol recién obtenido, no el state que aún no se actualizó)
        fetchAppointments(userRole, currentUser);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setRole("user");
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const closeAuditSession = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "auditLogs"),
        where("userId", "==", user.uid)
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const ta = a.horaIngreso?.toDate?.()?.getTime?.() || 0;
        const tb = b.horaIngreso?.toDate?.()?.getTime?.() || 0;
        return tb - ta;
      });
      for (const docData of docs) {
        if (docData.estado === "activa") {
          const ingressTime = docData.horaIngreso?.toDate?.() || new Date();
          const now = new Date();
          const durationMs = now.getTime() - ingressTime.getTime();
          const mins = Math.floor(durationMs / 60000);
          const hrs = Math.floor(mins / 60);
          const duracion = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
          await updateDoc(doc(db, "auditLogs", docData.id), {
            horaSalida: serverTimestamp(),
            duracion: duracion,
            estado: "cerrada",
          });
          break;
        }
      }
    } catch (e) {
      console.warn("Error closing audit:", e);
    }
  };

  const handleLogout = async () => {
    await closeAuditSession();
    await signOut(auth);
    navigate("/", { replace: true });
  };

  // ── Vincular proveedores OAuth ──
  const refreshLinkedProviders = () => {
    if (!user) return;
    const providers = user.providerData.map((p) => p.providerId);
    setLinkedProviders(providers);
  };

  // ── Detectar cierre de navegador ──
  useEffect(() => {
    if (!user) return;
    const projectId = "claseyhoryi";
    const handleBeforeUnload = async () => {
      const auditId = sessionStorage.getItem("audit_" + user.uid);
      if (auditId) {
        try {
          const token = await user.getIdToken();
          const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/auditLogs/${auditId}`;
          const now = new Date().toISOString();
          fetch(url, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fields: {
                estado: { stringValue: "cerrada" },
                horaSalida: { timestampValue: now },
                duracion: { stringValue: "sesión cerrada" },
              },
            }),
            keepalive: true,
          });
        } catch (_) {}
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user]);

  useEffect(() => {
    if (user) refreshLinkedProviders();
  }, [user]);

  const handleLinkProvider = async (providerName) => {
    if (!user) return;
    setLinkingProvider(providerName);
    setLinkMsg("");
    try {
      let provider;
      if (providerName === "google") provider = googleProvider;
      else if (providerName === "github") provider = githubProvider;
      else if (providerName === "facebook") provider = facebookProvider;
      await linkWithPopup(user, provider);
      refreshLinkedProviders();
      setLinkMsg(`${providerName} vinculado correctamente`);
    } catch (err) {
      if (err.code === "auth/credential-already-in-use") {
        setLinkMsg(`${providerName} ya está vinculado a otra cuenta`);
      } else if (err.code !== "auth/cancelled-popup-request") {
        setLinkMsg("Error: " + err.code);
      }
    } finally {
      setLinkingProvider(null);
    }
  };

  // ── Audit logs ──
  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      let q;
      if (role === "admin") {
        q = query(collection(db, "auditLogs"));
      } else {
        q = query(
          collection(db, "auditLogs"),
          where("userId", "==", user?.uid || "")
        );
      }
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => {
        const ta = a.horaIngreso?.toDate?.()?.getTime?.() || 0;
        const tb = b.horaIngreso?.toDate?.()?.getTime?.() || 0;
        return tb - ta;
      });
      setAuditLogs(list);
    } catch (e) {
      console.error("Error fetching audit logs:", e);
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    if (activeTab === "audit" && user && role === "admin") fetchAuditLogs();
  }, [activeTab, user, role]);

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchSearch =
      !auditSearch ||
      log.email?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.nombre?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.metodo?.toLowerCase().includes(auditSearch.toLowerCase());
    const matchFilter =
      auditFilter === "todas" ||
      log.estado === auditFilter ||
      log.metodo === auditFilter;
    return matchSearch && matchFilter;
  });

  const exportPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Reporte General", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString("es-CO")}`, 14, 22);

    // ── Sección: Usuarios registrados ──
    doc.setFontSize(14);
    doc.text("Usuarios Registrados", 14, 32);
    doc.setFontSize(10);
    let allUsers = [];
    try {
      const snap = await getDocs(collection(db, "users"));
      allUsers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (_) {}

    const userRows = allUsers.map((u) => [
      u.nombre || "", u.apellido || "", u.email || "", u.role || "user",
      u.activo !== false ? "Activo" : "Inactivo",
    ]);
    doc.autoTable({
      startY: 36,
      head: [["Nombre", "Apellido", "Email", "Rol", "Estado"]],
      body: userRows,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [120, 50, 220] },
    });

    // ── Sección: Auditoría de accesos ──
    const auditStartY = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(14);
    doc.text("Auditoría de Accesos", 14, auditStartY - 4);

    const rows = filteredAuditLogs.map((log) => [
      log.nombre || log.email,
      log.email,
      log.metodo,
      log.horaIngreso?.toDate?.().toLocaleString("es-CO") || "—",
      log.horaSalida?.toDate?.().toLocaleString("es-CO") || "—",
      log.duracion || "—",
      log.estado,
    ]);

    doc.autoTable({
      startY: auditStartY,
      head: [["Nombre", "Email", "Método", "Ingreso", "Salida", "Duración", "Estado"]],
      body: rows,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [120, 50, 220] },
    });

    doc.save("reporte.pdf");
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

  // ── CRUD: Citas ──

  const fetchAppointments = async (rol, usr) => {
    const effectiveRole = rol || role;
    const effectiveUser = usr || user;
    try {
      let q;
      if (effectiveRole === "admin") {
        q = query(collection(db, "citas"), orderBy("createdAt", "desc"));
      } else {
        q = query(collection(db, "citas"), where("creadoPor", "==", effectiveUser?.uid || ""));
      }
      const snapshot = await getDocs(q);
      let list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (effectiveRole !== "admin") list.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
      setAppointments(list);
    } catch (err) {
      console.error("Error cargando citas:", err);
    }
  };

  const resetApptForm = () => {
    setFormClient("");
    setFormService("");
    setFormStatus("pendiente");
    setFormPhone("");
    setFormDate("");
    setFormTime("");
    setFormErrors({});
    setTakenSlots([]);
    setIsCancelling(false);
  };

  const openCreateAppt = () => {
    setEditingAppt(null);
    resetApptForm();
    setFormClient(userData?.nombre || user?.displayName || "");
    setFormPhone(userData?.telefono || "");
    setShowApptModal(true);
  };

  const openEditAppt = (appt) => {
    setIsCancelling(false);
    setEditingAppt(appt);
    setFormClient(appt.cliente || "");
    setFormService(appt.servicio || "");
    setFormStatus(appt.estado || "pendiente");
    setFormPhone(appt.telefono || "");
    const d = appt.fecha?.toDate
      ? appt.fecha.toDate().toISOString().split("T")[0]
      : appt.fecha || "";
    setFormDate(d);
    setFormTime(appt.hora || "");
    setFormErrors({});
    setShowApptModal(true);
  };

  const TIME_SLOTS = [];
  for (let h = 8; h <= 17; h++) {
    TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 17) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
  }

  const fetchTakenSlots = async (dateStr) => {
    if (!dateStr) { setTakenSlots([]); return; }
    setLoadingSlots(true);
    try {
      const q = query(collection(db, "citas"), where("fecha", "==", dateStr));
      const snap = await getDocs(q);
      const taken = [];
      for (const d of snap.docs) {
        const c = d.data();
        if (!c.hora) continue;
        if (editingAppt && d.id === editingAppt.id) continue;
        const [ch, cm] = c.hora.split(":").map(Number);
        const base = ch * 60 + cm;
        taken.push(base);
      }
      const takenSet = new Set(taken);
      const result = TIME_SLOTS.reduce((acc, slot) => {
        const [sh, sm] = slot.split(":").map(Number);
        const smin = sh * 60 + sm;
        let isTaken = false;
        for (const t of takenSet) {
          if (Math.abs(smin - t) < 30) { isTaken = true; break; }
        }
        acc[slot] = isTaken;
        return acc;
      }, {});
      setTakenSlots(result);
    } catch (err) {
      console.error("Error cargando slots:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const checkTimeConflict = async () => {
    if (!formDate || !formTime) return null;
    try {
      const q = query(collection(db, "citas"), where("fecha", "==", formDate));
      const snap = await getDocs(q);
      const [h, m] = formTime.split(":").map(Number);
      const newMinutes = h * 60 + m;
      for (const docSnap of snap.docs) {
        const c = docSnap.data();
        if (editingAppt && docSnap.id === editingAppt.id) continue;
        if (!c.hora) continue;
        const [ch, cm] = c.hora.split(":").map(Number);
        const cMinutes = ch * 60 + cm;
        if (Math.abs(newMinutes - cMinutes) < 30) {
          return `Ya existe una cita a las ${c.hora} (${c.cliente}). Debe haber al menos 30 min de diferencia.`;
        }
      }
    } catch (err) {
      console.error("Error verificando conflicto de horario:", err);
    }
    return null;
  };

  const validateApptForm = () => {
    const errors = {};
    if (isCancelling) {
      // no validation needed for cancel
    } else if (editingAppt && role === "admin") {
      if (!formClient.trim()) errors.cliente = "El nombre del cliente es obligatorio";
      if (formClient.trim().length > 100) errors.cliente = "Máximo 100 caracteres";
      if (formService.length > 300) errors.servicio = "Máximo 300 caracteres";
      if (!formDate.trim()) errors.fecha = "La fecha es obligatoria";
      if (!formTime.trim()) errors.hora = "La hora es obligatoria";
    } else if (editingAppt) {
      // user editing servicio/hora only — no required validations
      if (formService.length > 300) errors.servicio = "Máximo 300 caracteres";
    } else {
      if (!formClient.trim()) errors.cliente = "El nombre del cliente es obligatorio";
      if (formClient.trim().length > 100) errors.cliente = "Máximo 100 caracteres";
      if (formService.length > 300) errors.servicio = "Máximo 300 caracteres";
      if (!formDate.trim()) errors.fecha = "La fecha es obligatoria";
      if (!formTime.trim()) errors.hora = "La hora es obligatoria";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApptSubmit = async (e) => {
    e.preventDefault();
    if (!validateApptForm()) return;
    if (!isCancelling) {
      const conflict = await checkTimeConflict();
      if (conflict) {
        setFormErrors({ hora: conflict });
        setSubmitting(false);
        return;
      }
    }
    setSubmitting(true);
    try {
      let newStatus = formStatus;
      if (editingAppt && role === "admin") newStatus = "completada";
      else if (!editingAppt && role !== "admin") newStatus = "pendiente";
      const data = {
        cliente: formClient.trim(),
        servicio: formService.trim(),
        estado: newStatus,
        telefono: formPhone.trim(),
        fecha: formDate || null,
        hora: formTime || null,
      };

      if (editingAppt) {
        await updateDoc(doc(db, "citas", editingAppt.id), {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "citas"), {
          ...data,
          creadoPor: user?.uid || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setShowApptModal(false);
      resetApptForm();
      await fetchAppointments(role, user);
    } catch (err) {
      console.error("Error guardando cita:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAppt = async () => {
    if (!deletingAppt) return;
    try {
      await deleteDoc(doc(db, "citas", deletingAppt.id));
      setDeletingAppt(null);
      await fetchAppointments(role, user);
    } catch (err) {
      console.error("Error eliminando cita:", err);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const q = apptSearch.toLowerCase();
    return (
      (a.cliente || "").toLowerCase().includes(q) ||
      (a.servicio || "").toLowerCase().includes(q) ||
      (a.estado || "").toLowerCase().includes(q) ||
      (a.telefono || "").toLowerCase().includes(q)
    );
  });

  const statusColors = {
    pendiente: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
    confirmada: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    completada: { color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
    cancelada: { color: "#fb7185", bg: "rgba(251,113,133,0.1)" },
  };

  const statusLabels = {
    pendiente: "Pendiente",
    confirmada: "Confirmada",
    completada: "Completada",
    cancelada: "Cancelada",
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

  useEffect(() => {
    if (formDate && !isCancelling) fetchTakenSlots(formDate);
    else setTakenSlots([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDate, isCancelling]);

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

  // ── TABS unificados para ambos roles ──
  const tabs = [
    { id: "home", label: role === "admin" ? "Directorio" : "Inicio", icon: <FaHome /> },
    { id: "appointments", label: "Citas", icon: <FaCalendarAlt /> },
    ...(role === "admin" ? [{ id: "audit", label: "Auditoría", icon: <FaClipboardList /> }] : []),
    { id: "profile", label: "Mi Perfil", icon: <FaUser /> },
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
            <div style={styles.brandIcon}><FaGem /></div>
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
                <span style={{ marginRight: "7px", fontSize: "14px", display: "flex" }}>{tab.icon}</span>
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
            <div style={styles.modalIcon}><FaExclamationTriangle /></div>
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

      {/* ── APPOINTMENT FORM MODAL (Create / Edit) ── */}
      {showApptModal && (
        <div style={styles.modalOverlay} onClick={() => { setShowApptModal(false); resetApptForm(); }}>
          <div style={styles.apptModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.apptModalHeader}>
              <h3 style={styles.apptModalTitle}>
                {editingAppt ? "Editar Cita" : "Nueva Cita"}
              </h3>
              <button
                onClick={() => { setShowApptModal(false); resetApptForm(); }}
                style={styles.apptModalClose}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleApptSubmit} style={styles.apptForm}>
              {isCancelling ? (
                <>
                  <div style={{ ...styles.formNotice, marginBottom: "16px" }}>
                    Solo puedes cancelar esta cita. Los demás campos son de solo lectura.
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Cliente</label>
                    <input type="text" value={formClient} disabled style={styles.formInputDisabled} className="form-input" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Servicio</label>
                    <textarea value={formService} disabled rows="2" style={{ ...styles.formInput, ...styles.formTextarea, opacity: 0.5 }} className="form-input" />
                  </div>
                  <div style={styles.formRow}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Fecha</label>
                      <input type="date" value={formDate} disabled style={{ ...styles.formInput, opacity: 0.5 }} className="form-input" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Hora</label>
                      <input type="time" value={formTime} disabled style={{ ...styles.formInput, opacity: 0.5 }} className="form-input" />
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Estado *</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      style={styles.formInput}
                      className="form-input"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="cancelada">Cancelar cita</option>
                    </select>
                  </div>
                </>
              ) : editingAppt && role === "admin" ? (
                <>
                  <div style={{ ...styles.formNotice, marginBottom: "16px" }}>
                    Al guardar, el estado cambiará a "Completada".
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Cliente *</label>
                    <input
                      type="text"
                      value={formClient}
                      onChange={(e) => setFormClient(e.target.value)}
                      placeholder="Nombre del cliente"
                      style={{
                        ...styles.formInput,
                        ...(formErrors.cliente ? styles.formInputError : {}),
                      }}
                      className="form-input"
                    />
                    {formErrors.cliente && <span style={styles.formError}>{formErrors.cliente}</span>}
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Servicio</label>
                    <textarea
                      value={formService}
                      onChange={(e) => setFormService(e.target.value)}
                      placeholder="Ej: Corte de cabello, manicure, asesoría..."
                      rows="2"
                      style={{
                        ...styles.formInput,
                        ...styles.formTextarea,
                        ...(formErrors.servicio ? styles.formInputError : {}),
                      }}
                      className="form-input"
                    />
                    {formErrors.servicio && <span style={styles.formError}>{formErrors.servicio}</span>}
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Teléfono</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="300 123 4567"
                      style={styles.formInput}
                      className="form-input"
                    />
                  </div>
                  <div style={styles.formRow}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Fecha *</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        style={{
                          ...styles.formInput,
                          ...(formErrors.fecha ? styles.formInputError : {}),
                        }}
                        className="form-input"
                      />
                      {formErrors.fecha && <span style={styles.formError}>{formErrors.fecha}</span>}
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Hora *</label>
                    {formDate ? (
                      loadingSlots ? (
                        <span style={{ color: "#64748b", fontSize: "13px" }}>Cargando horarios...</span>
                      ) : (
                        <>
                          <div style={styles.slotGrid}>
                            {TIME_SLOTS.map((slot) => {
                              const taken = takenSlots[slot];
                              const selected = formTime === slot;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  disabled={taken}
                                  onClick={() => setFormTime(slot)}
                                  style={selected ? styles.slotBtnSelected : taken ? styles.slotBtnTaken : styles.slotBtn}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                          {formErrors.hora && <span style={styles.formError}>{formErrors.hora}</span>}
                        </>
                      )
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "13px" }}>Selecciona una fecha primero</span>
                    )}
                  </div>
                </>
              ) : editingAppt ? (
                <>
                  <div style={{ ...styles.formNotice, marginBottom: "16px" }}>
                    Solo puedes actualizar el servicio y la hora.
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Cliente</label>
                    <input type="text" value={formClient} disabled style={styles.formInputDisabled} className="form-input" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Servicio</label>
                    <textarea
                      value={formService}
                      onChange={(e) => setFormService(e.target.value)}
                      placeholder="Ej: Corte de cabello, manicure, asesoría..."
                      rows="2"
                      style={styles.formInput}
                      className="form-input"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Teléfono</label>
                    <input type="text" value={formPhone} disabled style={styles.formInputDisabled} className="form-input" />
                  </div>
                  <div style={styles.formRow}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Fecha</label>
                      <input type="date" value={formDate} disabled style={{ ...styles.formInput, opacity: 0.5 }} className="form-input" />
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Hora</label>
                    {formDate ? (
                      loadingSlots ? (
                        <span style={{ color: "#64748b", fontSize: "13px" }}>Cargando horarios...</span>
                      ) : (
                        <>
                          <div style={styles.slotGrid}>
                            {TIME_SLOTS.map((slot) => {
                              const taken = takenSlots[slot];
                              const selected = formTime === slot;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  disabled={taken}
                                  onClick={() => setFormTime(slot)}
                                  style={selected ? styles.slotBtnSelected : taken ? styles.slotBtnTaken : styles.slotBtn}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                          {formErrors.hora && <span style={styles.formError}>{formErrors.hora}</span>}
                        </>
                      )
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "13px" }}>Selecciona una fecha primero</span>
                    )}
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Estado</label>
                    <input type="text" value={statusLabels[formStatus] || formStatus} disabled style={styles.formInputDisabled} className="form-input" />
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Cliente *</label>
                    <input
                      type="text"
                      value={formClient}
                      onChange={(e) => setFormClient(e.target.value)}
                      placeholder="Nombre del cliente"
                      disabled={role !== "admin"}
                      style={{
                        ...(role !== "admin" ? styles.formInputDisabled : styles.formInput),
                        ...(formErrors.cliente ? styles.formInputError : {}),
                      }}
                      className="form-input"
                    />
                    {formErrors.cliente && <span style={styles.formError}>{formErrors.cliente}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Servicio</label>
                    <textarea
                      value={formService}
                      onChange={(e) => setFormService(e.target.value)}
                      placeholder="Ej: Corte de cabello, manicure, asesoría..."
                      rows="2"
                      style={{
                        ...styles.formInput,
                        ...styles.formTextarea,
                        ...(formErrors.servicio ? styles.formInputError : {}),
                      }}
                      className="form-input"
                    />
                    {formErrors.servicio && <span style={styles.formError}>{formErrors.servicio}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Teléfono</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="300 123 4567"
                      style={styles.formInput}
                      className="form-input"
                    />
                  </div>

                  <div style={styles.formRow}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Fecha *</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        style={{
                          ...styles.formInput,
                          ...(formErrors.fecha ? styles.formInputError : {}),
                        }}
                        className="form-input"
                      />
                      {formErrors.fecha && <span style={styles.formError}>{formErrors.fecha}</span>}
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Hora *</label>
                    {formDate ? (
                      loadingSlots ? (
                        <span style={{ color: "#64748b", fontSize: "13px" }}>Cargando horarios...</span>
                      ) : (
                        <>
                          <div style={styles.slotGrid}>
                            {TIME_SLOTS.map((slot) => {
                              const taken = takenSlots[slot];
                              const selected = formTime === slot;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  disabled={taken}
                                  onClick={() => setFormTime(slot)}
                                  style={selected ? styles.slotBtnSelected : taken ? styles.slotBtnTaken : styles.slotBtn}
                                  className={taken ? "" : "slot-btn"}
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                          {formErrors.hora && <span style={styles.formError}>{formErrors.hora}</span>}
                        </>
                      )
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "13px" }}>Selecciona una fecha primero</span>
                    )}
                  </div>
                </>
              )}

              <div style={styles.apptModalActions}>
                <button
                  type="button"
                  onClick={() => { setShowApptModal(false); resetApptForm(); }}
                  style={styles.modalCancel}
                  className="modal-cancel"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    ...styles.apptSubmitBtn,
                    opacity: submitting ? 0.6 : 1,
                  }}
                  className="btn-hover"
                >
                  {submitting
                    ? "Guardando..."
                    : isCancelling
                      ? "Cancelar Cita"
                      : editingAppt
                        ? "Actualizar Cita"
                        : "Crear Cita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE APPOINTMENT CONFIRM MODAL ── */}
      {deletingAppt && (
        <div style={styles.modalOverlay} onClick={() => setDeletingAppt(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalIcon}><FaTrash /></div>
            <h3 style={styles.modalTitle}>¿Eliminar cita?</h3>
            <p style={styles.modalText}>
              Se eliminará la cita de <strong>"{deletingAppt.cliente}"</strong> de forma permanente.
              Esta acción no se puede deshacer.
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setDeletingAppt(null)}
                style={styles.modalCancel}
                className="modal-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAppt}
                style={styles.modalConfirm}
                className="modal-confirm"
              >
                Sí, eliminar
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
                        <span style={{ marginLeft: 10, fontSize: 16, display: "inline-flex" }}><FaShieldAlt /></span>
                      </h2>
                      <p style={styles.cardSubtitle}>Gestiona todos los miembros registrados</p>
                    </div>
                    <span style={styles.countTag}>
                      {filteredUsers.length} / {allUsers.length} total
                    </span>
                  </div>

                  <div style={styles.searchWrapper}>
                    <span style={styles.searchIcon}><FaSearch /></span>
                    <input
                      type="text"
                      placeholder="Buscar por nombre, email, rol..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={styles.searchInput}
                      className="search-input"
                    />
                    {search && (
                      <button onClick={() => setSearch("")} style={styles.clearBtn}><FaTimes /></button>
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
                  <h2 style={styles.welcomeTitle}>Bienvenido, {userData?.nombre || "Usuario"} <FaHandPeace style={{ marginLeft: 6 }} /></h2>
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

          {/* ── TAB: AUDIT ── */}
          {activeTab === "audit" && (
            <div style={styles.fadeIn}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.cardTitle}>
                    Auditoría de Accesos
                    <span style={{ marginLeft: 10, fontSize: 16, display: "inline-flex" }}><FaClipboardList /></span>
                  </h2>
                  <p style={styles.cardSubtitle}>Registro de ingresos y salidas del sistema</p>
                </div>
                <button onClick={exportPDF} style={styles.exportBtn} className="btn-hover">
                  <FaFilePdf style={{ marginRight: 6 }} /> Exportar PDF
                </button>
              </div>

              {/* ── Usuarios registrados ── */}
              <h3 style={{ ...styles.sectionLabel, marginTop: 0 }}>Usuarios Registrados</h3>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Nombre", "Apellido", "Email", "Rol", "Estado"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.length === 0 ? (
                      <tr><td colSpan={5} style={{ ...styles.td, textAlign: "center", color: "#64748b" }}>No hay usuarios registrados</td></tr>
                    ) : (
                      allUsers.map((u, i) => (
                        <tr key={u.uid || i} className="table-row" style={styles.tr}>
                          <td style={styles.td}>{u.nombre || "—"}</td>
                          <td style={styles.td}>{u.apellido || "—"}</td>
                          <td style={styles.td}>{u.email}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.miniBadge,
                              border: `1px solid ${u.role === "admin" ? "#a855f7" : "#3b82f6"}`,
                            }}>
                              {u.role || "user"}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusBadge,
                              color: u.activo !== false ? "#4ade80" : "#fb7185",
                              background: u.activo !== false ? "rgba(74,222,128,0.1)" : "rgba(251,113,133,0.1)",
                            }}>
                              {u.activo !== false ? "● Activo" : "○ Inactivo"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={styles.divider} />

              {/* ── Auditoría de accesos ── */}
              <h3 style={styles.sectionLabel}>Historial de Accesos</h3>
              <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ ...styles.searchWrapper, flex: 1, minWidth: 200 }}>
                  <span style={styles.searchIcon}><FaSearch /></span>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email, método..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    style={styles.searchInput}
                    className="search-input"
                  />
                  {auditSearch && (
                    <button onClick={() => setAuditSearch("")} style={styles.clearBtn}><FaTimes /></button>
                  )}
                </div>
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: 14,
                    outline: "none",
                  }}
                >
                  <option value="todas">Todas</option>
                  <option value="activa">Activas</option>
                  <option value="cerrada">Cerradas</option>
                  <option value="email">Email</option>
                  <option value="google">Google</option>
                  <option value="github">GitHub</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>

              {loadingAudit ? (
                <p style={styles.empty}>Cargando...</p>
              ) : filteredAuditLogs.length === 0 ? (
                <p style={styles.empty}>
                  {auditSearch || auditFilter !== "todas"
                    ? "Sin resultados para la búsqueda."
                    : "No hay registros de auditoría."}
                </p>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {["Usuario", "Email", "Método", "Ingreso", "Salida", "Duración", "Estado"].map((h) => (
                          <th key={h} style={styles.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAuditLogs.map((log) => (
                        <tr key={log.id} className="table-row" style={styles.tr}>
                          <td style={styles.td}>{log.nombre || "—"}</td>
                          <td style={styles.td}>{log.email}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.miniBadge,
                              border: `1px solid ${
                                log.metodo === "google" ? "#ea4335"
                                : log.metodo === "github" ? "#f0f6fc"
                                : log.metodo === "facebook" ? "#1877f2"
                                : "#a855f7"
                              }`,
                            }}>
                              {log.metodo}
                            </span>
                          </td>
                          <td style={styles.td}>{formatDate(log.horaIngreso)}</td>
                          <td style={styles.td}>{formatDate(log.horaSalida)}</td>
                          <td style={styles.td}>{log.duracion || "—"}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusBadge,
                              color: log.estado === "activa" ? "#4ade80" : "#fb7185",
                              background: log.estado === "activa" ? "rgba(74,222,128,0.1)" : "rgba(251,113,133,0.1)",
                            }}>
                              {log.estado === "activa" ? "● Activa" : "○ Cerrada"}
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
                    {role === "admin" ? <><FaShieldAlt style={{ marginRight: 4 }} /> Administrador</> : <><FaUser style={{ marginRight: 4 }} /> Miembro</>}
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
                <InfoCard label="Username" value={userData?.username || "No asignado"} icon={<FaIdCard />} />
                <InfoCard label="Correo Electrónico" value={user?.email} icon={<FaEnvelope />} />
                <InfoCard label="Fecha de Alta" value={formatDate(userData?.tiempoInicial || userData?.createdAt)} icon={<FaCalendarAlt />} />
                <InfoCard label="Última Salida" value={formatDate(userData?.salida)} icon={<FaClock />} />
              </div>

              <div style={styles.divider} />

              {/* Link providers */}
              <h3 style={styles.sectionLabel}>Vincular Cuentas</h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: -8, marginBottom: 12 }}>
                Vincula proveedores para poder iniciar sesión con cualquiera de ellos usando el mismo correo.
              </p>
              {linkMsg && (
                <p style={{
                  padding: "8px 12px", borderRadius: 8, marginBottom: 10, fontSize: 13,
                  background: linkMsg.includes("Error") ? "rgba(251,113,133,0.15)" : "rgba(74,222,128,0.15)",
                  color: linkMsg.includes("Error") ? "#fb7185" : "#4ade80",
                  border: `1px solid ${linkMsg.includes("Error") ? "rgba(251,113,133,0.3)" : "rgba(74,222,128,0.3)"}`,
                }}>
                  {linkMsg}
                </p>
              )}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { id: "google", label: "Google", color: "#ea4335", icon: "G" },
                  { id: "facebook", label: "Facebook", color: "#1877f2", icon: "f" },
                  { id: "github", label: "GitHub", color: "#f0f6fc", icon: <FaGithub /> },
                ].map((p) => {
                  const isLinked = linkedProviders.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => !isLinked && handleLinkProvider(p.id)}
                      disabled={isLinked || linkingProvider !== null}
                      style={{
                        padding: "10px 18px",
                        borderRadius: 10,
                        border: `1px solid ${isLinked ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.12)"}`,
                        background: isLinked ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)",
                        color: isLinked ? "#4ade80" : "rgba(255,255,255,0.7)",
                        cursor: isLinked ? "default" : "pointer",
                        fontSize: 14,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        opacity: linkingProvider === p.id ? 0.6 : 1,
                      }}
                    >
                      <span style={{
                        width: 28, height: 28, borderRadius: 6, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        background: isLinked ? "rgba(74,222,128,0.2)" : p.color + "22",
                        color: isLinked ? "#4ade80" : p.color,
                        fontWeight: 700, fontSize: 14,
                      }}>
                        {isLinked ? <FaCheck style={{color:"#4ade80"}} /> : p.icon}
                      </span>
                      {p.label}
                      {isLinked && <span style={{ fontSize: 11, opacity: 0.6 }}>(vinculado)</span>}
                      {linkingProvider === p.id && <span style={{ fontSize: 11 }}>vinculando...</span>}
                    </button>
                  );
                })}
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

          {/* ---- TAB: APPOINTMENTS ---- */}
          {activeTab === "appointments" && (
            <div style={styles.fadeIn}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.cardTitle}>
                    Citas
                    <span style={{ marginLeft: 10, fontSize: 16, display: "inline-flex" }}><FaCalendarAlt /></span>
                  </h2>
                  <p style={styles.cardSubtitle}>Administra las citas agendadas</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={styles.countTag}>
                    {filteredAppointments.length} / {appointments.length} total
                  </span>
                  <button onClick={openCreateAppt} style={styles.createBtn} className="btn-hover">
                    + Nueva Cita
                  </button>
                </div>
              </div>

              <div style={styles.searchWrapper}>
                <span style={styles.searchIcon}><FaSearch /></span>
                <input
                  type="text"
                  placeholder={role === "admin" ? "Buscar por cliente, servicio, estado..." : "Buscar en mis citas..."}
                  value={apptSearch}
                  onChange={(e) => setApptSearch(e.target.value)}
                  style={styles.searchInput}
                  className="search-input"
                />
                {apptSearch && (
                  <button onClick={() => setApptSearch("")} style={styles.clearBtn}><FaTimes /></button>
                )}
              </div>

              {filteredAppointments.length === 0 ? (
                <p style={styles.empty}>
                  {apptSearch
                    ? `Sin resultados para "${apptSearch}".`
                    : "No hay citas aun. Agenda la primera!"}
                </p>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {["Cliente", "Servicio", "Fecha", "Hora", "Estado", "Acciones"].map((h) => (
                          <th key={h} style={styles.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((a, i) => {
                        const sc = statusColors[a.estado] || statusColors.pendiente;
                        return (
                          <tr key={a.id || i} className="table-row" style={styles.tr}>
                            <td style={styles.td}>
                              <div style={{ fontWeight: "600" }}>{a.cliente || "Sin nombre"}</div>
                              {a.telefono && (
                                <div style={{ fontSize: "11px", opacity: 0.5, marginTop: "2px" }}>
<FaPhone style={{ marginRight: 4 }} /> {a.telefono}
                                </div>
                              )}
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontSize: "13px" }}>
                                {a.servicio || <span style={{ opacity: 0.4, fontStyle: "italic" }}>Sin especificar</span>}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontSize: "13px" }}>
                                {a.fecha
                                  ? a.fecha.toDate
                                    ? a.fecha.toDate().toLocaleDateString("es-CO")
                                    : a.fecha
                                  : <span style={{ opacity: 0.4 }}>—</span>}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontSize: "13px" }}>
                                {a.hora || <span style={{ opacity: 0.4 }}>—</span>}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={{
                                ...styles.statusBadge,
                                color: sc.color,
                                background: sc.bg,
                              }}>
                                {statusLabels[a.estado] || a.estado}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <div style={{ display: "flex", gap: "8px" }}>
                                {role === "admin" ? (
                                  <>
                                    {a.estado !== "completada" && (
                                      <button
                                        onClick={async () => {
                                          try {
                                            await updateDoc(doc(db, "citas", a.id), { estado: "completada", updatedAt: serverTimestamp() });
                                            await fetchAppointments(role, user);
                                          } catch (err) { console.error(err); }
                                        }}
                                        style={styles.actionBtnComplete}
                                        title="Completar cita"
                                        className="action-btn-complete"
                                      >
                                        Completar
                                      </button>
                                    )}
                                    <button
                                      onClick={() => openEditAppt(a)}
                                      style={styles.actionBtnEdit}
                                      title="Editar cita"
                                      className="action-btn-edit"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => setDeletingAppt(a)}
                                      style={styles.actionBtnDelete}
                                      title="Eliminar cita"
                                      className="action-btn-delete"
                                    >
                                      Eliminar
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => openEditAppt(a)}
                                      style={{
                                        ...styles.actionBtnEditUser,
                                        ...(a.estado === "cancelada" || a.estado === "completada" ? { opacity: 0.4, cursor: "not-allowed" } : {}),
                                      }}
                                      title="Editar servicio u hora"
                                      className="action-btn-edit"
                                      disabled={a.estado === "cancelada" || a.estado === "completada"}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => {
                                        setIsCancelling(true);
                                        setEditingAppt(a);
                                        setFormClient(a.cliente || "");
                                        setFormService(a.servicio || "");
                                        setFormStatus(a.estado || "pendiente");
                                        setFormPhone(a.telefono || "");
                                        const d = a.fecha?.toDate ? a.fecha.toDate().toISOString().split("T")[0] : a.fecha || "";
                                        setFormDate(d);
                                        setFormTime(a.hora || "");
                                        setFormErrors({});
                                        setShowApptModal(true);
                                      }}
                                      style={{
                                        ...styles.actionBtnDelete,
                                        ...(a.estado === "cancelada" || a.estado === "completada" ? { opacity: 0.4, cursor: "not-allowed" } : {}),
                                      }}
                                      title="Cancelar cita"
                                      className="action-btn-delete"
                                      disabled={a.estado === "cancelada" || a.estado === "completada"}
                                    >
                                      Cancelar
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
        .action-btn-edit { transition: all 0.2s; }
        .action-btn-edit:hover { background: rgba(251,191,36,0.2) !important; }
        .action-btn-complete { transition: all 0.2s; }
        .action-btn-complete:hover { background: rgba(74,222,128,0.2) !important; }
        .action-btn-delete { transition: all 0.2s; }
        .action-btn-delete:hover { background: rgba(251,113,133,0.2) !important; }
        .search-input::placeholder { color: #475569; }
        .search-input:focus { outline: none; border-color: rgba(168,85,247,0.5) !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.1); }
        .form-input { transition: border-color 0.2s; }
        .form-input:focus { outline: none; border-color: rgba(168,85,247,0.5) !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.1); }
        .form-input::placeholder { color: #475569; }
        .form-input select { color-scheme: dark; }
        .slot-btn { transition: all 0.2s; }
        .slot-btn:hover:not(:disabled) { background: rgba(168,85,247,0.15) !important; border-color: rgba(168,85,247,0.3) !important; }
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
  main: { maxWidth: "1100px", margin: "0 auto", padding: "32px 24px", position: "relative", zIndex: 1 },
  card: {
    background: "rgba(255,255,255,0.025)", backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px",
    padding: "36px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
  },
  fadeIn: { animation: "fadeIn 0.35s ease-out forwards" },
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
  exportBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    background: "linear-gradient(135deg,#a855f7,#3b82f6)",
    border: "none", borderRadius: "10px", padding: "10px 18px",
    color: "white", fontWeight: "700", fontSize: "13px", cursor: "pointer",
  },
  empty: { color: "#64748b", textAlign: "center", padding: "40px 0", fontSize: "14px" },

  // ── Appointment CRUD styles ──
  createBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    background: "linear-gradient(135deg,#a855f7,#3b82f6)",
    border: "none", borderRadius: "10px", padding: "10px 18px",
    color: "white", fontWeight: "700", fontSize: "13px", cursor: "pointer",
    whiteSpace: "nowrap",
  },
  apptModal: {
    background: "rgba(20,20,28,0.98)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px", padding: "32px", maxWidth: "520px", width: "90%",
    animation: "modalIn 0.2s ease-out",
    boxShadow: "0 30px 60px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto",
  },
  apptModalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "24px",
  },
  apptModalTitle: {
    fontSize: "20px", fontWeight: "800", color: "#f8fafc", margin: 0,
  },
  apptModalClose: {
    background: "rgba(255,255,255,0.06)", border: "none",
    color: "#94a3b8", width: "32px", height: "32px", borderRadius: "8px",
    cursor: "pointer", fontSize: "14px", display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  apptForm: { display: "flex", flexDirection: "column", gap: "18px" },
  formGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  formLabel: {
    fontSize: "12px", fontWeight: "600", color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  formInput: {
    width: "100%", padding: "11px 14px", boxSizing: "border-box",
    background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px", color: "#f1f5f9", fontSize: "14px",
  },
  formInputError: { borderColor: "rgba(251,113,133,0.5) !important" },
  formTextarea: { resize: "vertical", minHeight: "70px" },
  formRow: { display: "flex", gap: "14px" },
  formError: { fontSize: "11px", color: "#fb7185", marginTop: "2px" },
  formInputDisabled: {
    width: "100%", padding: "11px 14px", boxSizing: "border-box",
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "10px", color: "#64748b", fontSize: "14px", cursor: "not-allowed",
  },
  formNotice: {
    padding: "10px 14px", borderRadius: "10px", fontSize: "13px",
    background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)",
    color: "#fbbf24",
  },
  apptModalActions: {
    display: "flex", gap: "12px", marginTop: "8px",
  },
  apptSubmitBtn: {
    flex: 1, padding: "12px",
    background: "linear-gradient(135deg,#a855f7,#3b82f6)",
    border: "none", borderRadius: "12px",
    color: "white", cursor: "pointer", fontSize: "14px", fontWeight: "700",
  },
  actionBtnEdit: {
    padding: "6px 14px",
    background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)",
    borderRadius: "8px", color: "#60a5fa", cursor: "pointer",
    fontSize: "12px", fontWeight: "600",
  },
  actionBtnEditUser: {
    padding: "6px 14px",
    background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)",
    borderRadius: "8px", color: "#fbbf24", cursor: "pointer",
    fontSize: "12px", fontWeight: "600",
  },
  slotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
    gap: "8px", marginTop: "6px",
  },
  slotBtn: {
    padding: "8px 4px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)", color: "#cbd5e1",
    cursor: "pointer", fontSize: "13px", fontWeight: "600",
    textAlign: "center", transition: "all 0.2s",
  },
  slotBtnTaken: {
    padding: "8px 4px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)",
    background: "rgba(255,255,255,0.02)", color: "#334155",
    cursor: "not-allowed", fontSize: "13px", fontWeight: "400",
    textAlign: "center", opacity: 0.5,
  },
  slotBtnSelected: {
    padding: "8px 4px", borderRadius: "8px",
    border: "1px solid rgba(168,85,247,0.5)",
    background: "rgba(168,85,247,0.2)", color: "#c4b5fd",
    cursor: "pointer", fontSize: "13px", fontWeight: "700",
    textAlign: "center", transition: "all 0.2s",
  },
  actionBtnComplete: {
    padding: "6px 14px",
    background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)",
    borderRadius: "8px", color: "#4ade80", cursor: "pointer",
    fontSize: "12px", fontWeight: "600",
  },
  actionBtnDelete: {
    padding: "6px 14px",
    background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.25)",
    borderRadius: "8px", color: "#fb7185", cursor: "pointer",
    fontSize: "12px", fontWeight: "600",
  },
  container: {
    minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
    background: "#0a0a0c",
  },
};

export default Dashboard;