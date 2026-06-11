import { useState, useEffect } from "react";
import { auth, db, googleProvider, githubProvider, facebookProvider } from "./Firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  linkWithCredential,
  GithubAuthProvider,
  signOut, FacebookAuthProvider
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

async function ensureUserDoc(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const nameParts = (user.displayName || "").split(" ");
    const nombre   = nameParts[0] || "";
    const apellido = nameParts.slice(1).join(" ") || "";
    await setDoc(ref, {
      uid:           user.uid,
      email:         user.email || "",
      username:      user.displayName || user.email?.split("@")[0] || "usuario",
      nombre:        nombre,
      apellido:      apellido,
      role:          "user",
      activo:        true,
      tiempoInicial: serverTimestamp(),
      salida:        null,
      createdAt:     serverTimestamp(),
    });
  }
}

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ─── Al cargar la página cierra cualquier sesión activa ──────────────────
  useEffect(() => {
    signOut(auth);
    sessionStorage.removeItem("pendingGithubToken");
  }, []);

  // ─── Email / contraseña ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Todos los campos son obligatorios");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/Welcome", { replace: true });
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/invalid-credential":
          setError("Ya la cuenta existe con otra aunteticación");
          break;
        case "auth/wrong-password":
          setError("Contraseña incorrecta");
          break;
        case "auth/invalid-email":
          setError("Correo inválido");
          break;
        default:
          setError("Error al iniciar sesión");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Google ──────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setError("");
      await signOut(auth);
      const result = await signInWithPopup(auth, googleProvider);

      // Si venía de un intento fallido de GitHub, vincular automáticamente
      const pendingToken = sessionStorage.getItem("pendingGithubToken");
      if (pendingToken) {
        try {
          const githubCredential = GithubAuthProvider.credential(pendingToken);
          await linkWithCredential(result.user, githubCredential);
        } catch (linkErr) {
          // Si ya estaba vinculado no pasa nada
        }
        sessionStorage.removeItem("pendingGithubToken");
      }

      await ensureUserDoc(result.user);
      navigate("/Welcome", { replace: true });

    } catch (err) {
      await signOut(auth);
      if (err.code !== "auth/cancelled-popup-request") {
        setError("Error con Google");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── GitHub ──────────────────────────────────────────────────────────────
  const handleGithubLogin = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setError("");
      await signOut(auth);
      const result = await signInWithPopup(auth, githubProvider);
      await ensureUserDoc(result.user);
      navigate("/Welcome", { replace: true });

    } catch (err) {
      await signOut(auth);
      if (err.code === "auth/account-exists-with-different-credential") {
        const githubCredential = GithubAuthProvider.credentialFromError(err);
        if (githubCredential) {
          sessionStorage.setItem("pendingGithubToken", githubCredential.accessToken);
        }
        setError("Este correo ya tiene cuenta con Google. Haz clic en 'Continuar con Google' para entrar.");
      } else if (err.code !== "auth/cancelled-popup-request") {
        setError("Error con GitHub: " + err.code);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Facebook ─────────────────────────────────────────────────────────────
  const handleFacebookLogin = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setError("");
      await signOut(auth);
      const result = await signInWithPopup(auth, facebookProvider);
      if (result?.user) {
        await ensureUserDoc(result.user);
        navigate("/Welcome", { replace: true });
      }
    } catch (err) {
      await signOut(auth);
      if (err.code !== "auth/cancelled-popup-request") {
        setError("Error con Facebook: " + err.code);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} noValidate>
        <h2>Iniciar sesión</h2>

        {error && <p className="error">{error}</p>}

        <div className="field">
          <label>Correo electrónico</label>
          <input
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Contraseña</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Iniciar sesión"}
        </button>

        <button type="button" className="google" onClick={handleGoogleLogin} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
            <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>

        <button type="button" className="github" onClick={handleGithubLogin} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          Continuar con GitHub
        </button>

        <button type="button" className="facebook" onClick={handleFacebookLogin} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="white">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
          </svg>
          Continuar con Facebook
        </button>

        <div className="links">
          <a href="/register">Crear cuenta</a>
          <a href="/reset">¿Olvidaste tu contraseña?</a>
          <a href="/forgot">¿Olvidaste tu cuenta?</a>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;