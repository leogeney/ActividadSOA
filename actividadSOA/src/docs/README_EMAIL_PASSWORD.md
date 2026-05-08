# Autenticación con Email y Contraseña en Firebase y React

## Descripción

Se implementó la autenticación con email y contraseña utilizando Firebase Authentication en una aplicación SPA desarrollada con React, permitiendo que los usuarios se registren e inicien sesión con sus propias credenciales de forma segura.

---

## Paso 1: Activar Email/Password en Firebase

1. Ingresar a [Firebase Console](https://console.firebase.google.com).
2. Seleccionar el proyecto.
3. Ir a **Authentication → Sign-in method**.
4. Buscar el proveedor **Email/Password**.
5. Habilitar la opción.
6. Guardar cambios.

---

## Paso 2: Configuración de Firebase

Se creó el archivo `Firebase.js` para conectar la aplicación React con Firebase.

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_BUCKET",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
```

---

## Paso 3: Registro de usuario

Se utilizó el método `createUserWithEmailAndPassword()` para registrar nuevos usuarios.

```javascript
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./Firebase";

const registrar = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log(result.user);
    alert("Usuario registrado exitosamente");
  } catch (error) {
    console.error(error);
  }
};
```

---

## Paso 4: Inicio de sesión

Se utilizó el método `signInWithEmailAndPassword()` para autenticar usuarios existentes.

```javascript
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./Firebase";

const login = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log(result.user);
    alert("Inicio de sesión exitoso");
  } catch (error) {
    console.error(error);
  }
};
```

---

## Paso 5: Cierre de sesión

Se utilizó el método `signOut()` para cerrar la sesión del usuario activo.

```javascript
import { signOut } from "firebase/auth";
import { auth } from "./Firebase";

const logout = async () => {
  try {
    await signOut(auth);
    alert("Sesión cerrada correctamente");
  } catch (error) {
    console.error(error);
  }
};
```

---

## Paso 6: Formulario de registro e inicio de sesión

Se agregaron los formularios en la vista `Login` para permitir el registro e inicio de sesión con email y contraseña.

```jsx
<input type="email" placeholder="Correo electrónico" onChange={(e) => setEmail(e.target.value)} />
<input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} />
<button onClick={() => registrar(email, password)}>Registrarse</button>
<button onClick={() => login(email, password)}>Iniciar Sesión</button>
```

---

## Paso 7: Manejo de errores comunes

Firebase retorna códigos de error específicos que permiten mostrar mensajes claros al usuario.

| Código de error | Descripción |
|---|---|
| `auth/email-already-in-use` | El correo ya está registrado |
| `auth/invalid-email` | El formato del correo no es válido |
| `auth/weak-password` | La contraseña debe tener mínimo 6 caracteres |
| `auth/user-not-found` | No existe una cuenta con ese correo |
| `auth/wrong-password` | La contraseña es incorrecta |

---

## Paso 8: Verificación en Firebase

Tras registrarse correctamente, el usuario queda registrado en **Authentication → Users**.

Firebase almacena automáticamente:

| Campo | Descripción |
|---|---|
| Correo | Correo electrónico registrado |
| Proveedor | Password |
| Fecha de creación | Timestamp del primer acceso |

---

## Resultado Final

La autenticación con email y contraseña fue implementada correctamente con Firebase Authentication y React, permitiendo que los usuarios se registren e inicien sesión en el sistema con sus propias credenciales de forma segura.