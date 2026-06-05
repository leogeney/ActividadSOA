# Autenticación con GitHub en Firebase y React

## Descripción

Se implementó la autenticación con GitHub utilizando Firebase Authentication en una aplicación SPA desarrollada con React, permitiendo que los usuarios inicien sesión con sus cuentas de GitHub de manera rápida y segura.

---

## Paso 1: Crear OAuth App en GitHub

1. Ingresar a [GitHub](https://github.com) e ir a **Settings**.
2. En el menú lateral ir a **Developer settings → OAuth Apps**.
3. Hacer clic en **New OAuth App**.
4. Completar el formulario:

| Campo | Valor |
|---|---|
| Application name | Nombre de tu app |
| Homepage URL | `https://tu-proyecto.firebaseapp.com` |
| Authorization callback URL | `https://tu-proyecto.firebaseapp.com/__/auth/handler` |

5. Hacer clic en **Register application**.
6. Copiar el **Client ID** y generar un **Client Secret**.



---

## Paso 2: Activar GitHub en Firebase

1. Ingresar a [Firebase Console](https://console.firebase.google.com).
2. Seleccionar el proyecto.
3. Ir a **Authentication → Sign-in method**.
4. Buscar el proveedor **GitHub**.
5. Habilitar la opción.
6. Pegar el **Client ID** y **Client Secret** obtenidos en el paso anterior.
7. Guardar cambios.




---

## Paso 3: Configuración de Firebase

Se actualizó el archivo `Firebase.js` para agregar el proveedor de GitHub.

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider } from "firebase/auth";

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
export const githubProvider = new GithubAuthProvider();
```



---

## Paso 4: Implementación del Login con GitHub

Se utilizó el método `signInWithPopup()` para abrir la ventana de autenticación de GitHub.

```javascript
import { signInWithPopup } from "firebase/auth";
import { auth, githubProvider } from "./Firebase";

const loginGithub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    console.log(result.user);
    alert("Inicio de sesión exitoso");
  } catch (error) {
    console.error(error);
  }
};
```

---

## Paso 5: Botón de inicio de sesión

Se agregó un botón en la vista `Login` para permitir el acceso con GitHub.

```jsx
<button onClick={loginGithub}>
  Ingresar con GitHub
</button>
```



---

## Paso 6: Verificación en Firebase

Tras iniciar sesión correctamente, el usuario queda registrado en **Authentication → Users**.

Firebase almacena automáticamente:

| Campo | Descripción |
|---|---|
| Nombre | Nombre del usuario de GitHub |
| Correo | Correo electrónico asociado |
| Proveedor | GitHub |
| Fecha de creación | Timestamp del primer acceso |

---

## Resultado Final

La autenticación con GitHub fue implementada correctamente con Firebase Authentication y React, permitiendo que los usuarios accedan al sistema de forma segura mediante sus cuentas de GitHub.