# Autenticación con Google en Firebase y React

## Descripción

Se implementó la autenticación con Google utilizando Firebase Authentication en una aplicación SPA desarrollada con React, permitiendo que los usuarios inicien sesión con sus cuentas de Google de manera rápida y segura.

---

## Paso 1: Activar Google en Firebase

1. Ingresar a [Firebase Console](https://console.firebase.google.com).
2. Seleccionar el proyecto.
3. Ir a **Authentication → Sign-in method**.
4. Buscar el proveedor **Google**.
5. Habilitar la opción y guardar cambios.


---

## Paso 2: Configuración de Firebase

Se creó el archivo `Firebase.js` para conectar la aplicación React con Firebase.

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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
export const googleProvider = new GoogleAuthProvider();
```


---

## Paso 3: Implementación del Login con Google

Se utilizó el método `signInWithPopup()` para abrir la ventana de autenticación de Google.

```javascript
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./Firebase";

const loginGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log(result.user);
    alert("Inicio de sesión exitoso");
  } catch (error) {
    console.error(error);
  }
};
```

---

## Paso 4: Botón de inicio de sesión

Se agregó un botón en la vista `Login` para permitir el acceso con Google.

```jsx
<button onClick={loginGoogle}>
  Ingresar con Google
</button>
```


---

## Paso 5: Verificación en Firebase

Tras iniciar sesión correctamente, el usuario queda registrado en **Authentication → Users**.

Firebase almacena automáticamente:

| Campo | Descripción |
|---|---|
| Nombre | Nombre del usuario de Google |
| Correo | Correo electrónico asociado |
| Proveedor | Google |
| Fecha de creación | Timestamp del primer acceso |

---

## Resultado Final

La autenticación con Google fue implementada correctamente con Firebase Authentication y React, permitiendo que los usuarios accedan al sistema de forma segura mediante sus cuentas de Google.