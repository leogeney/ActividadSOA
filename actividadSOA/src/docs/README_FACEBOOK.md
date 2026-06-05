# Autenticación con Facebook en Firebase y React

## Descripción

Se implementó la autenticación con Facebook utilizando Firebase Authentication en una aplicación SPA desarrollada con React, permitiendo que los usuarios inicien sesión con sus cuentas de Facebook de manera rápida y segura.

---

## Paso 1: Crear una App en Meta for Developers

1. Ingresar a [Meta for Developers](https://developers.facebook.com).
2. Ir a **My Apps → Create App**.
3. Seleccionar el tipo **Consumer**.
4. Completar el formulario:

| Campo | Valor |
|---|---|
| App name | Nombre de tu aplicación |
| Contact email | Tu correo electrónico |

5. Hacer clic en **Create App**.

---

## Paso 2: Activar Facebook Login

1. Dentro de la app creada, ir a **Add a product**.
2. Buscar **Facebook Login** y hacer clic en **Set up**.
3. Seleccionar la plataforma **Web**.
4. En **Site URL** ingresar:

```txt
https://tu-proyecto.firebaseapp.com
```

5. Guardar cambios.

---

## Paso 3: Configurar la URL de Callback

1. Ir a **Facebook Login → Settings**.
2. En el campo **Valid OAuth Redirect URIs** agregar:

```txt
https://tu-proyecto.firebaseapp.com/__/auth/handler
```

3. Guardar cambios.

---

## Paso 4: Obtener credenciales

1. Ir a **Settings → Basic**.
2. Copiar el **App ID** y el **App Secret**.

> ⚠️ _El App Secret es sensible, no lo expongas en el código ni en repositorios públicos._

---

## Paso 5: Activar Facebook en Firebase

1. Ingresar a [Firebase Console](https://console.firebase.google.com).
2. Seleccionar el proyecto.
3. Ir a **Authentication → Sign-in method**.
4. Buscar el proveedor **Facebook**.
5. Habilitar la opción.
6. Pegar el **App ID** y **App Secret** obtenidos en el paso anterior.
7. Guardar cambios.

---

## Paso 6: Configuración de Firebase

Se actualizó el archivo `Firebase.js` para agregar el proveedor de Facebook.

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, FacebookAuthProvider } from "firebase/auth";

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
export const facebookProvider = new FacebookAuthProvider();
```

---

## Paso 7: Implementación del Login con Facebook

Se utilizó el método `signInWithPopup()` para abrir la ventana de autenticación de Facebook.

```javascript
import { signInWithPopup } from "firebase/auth";
import { auth, facebookProvider } from "./Firebase";

const loginFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    console.log(result.user);
    alert("Inicio de sesión exitoso");
  } catch (error) {
    console.error(error);
  }
};
```

---

## Paso 8: Botón de inicio de sesión

Se agregó un botón en la vista `Login` para permitir el acceso con Facebook.

```jsx
<button onClick={loginFacebook}>
  Ingresar con Facebook
</button>
```

---

## Paso 9: Verificación en Firebase

Tras iniciar sesión correctamente, el usuario queda registrado en **Authentication → Users**.

Firebase almacena automáticamente:

| Campo | Descripción |
|---|---|
| Nombre | Nombre del usuario de Facebook |
| Correo | Correo electrónico asociado |
| Proveedor | Facebook |
| Fecha de creación | Timestamp del primer acceso |

---

## Resultado Final

La autenticación con Facebook fue implementada correctamente con Firebase Authentication y React, permitiendo que los usuarios accedan al sistema de forma segura mediante sus cuentas de Facebook.