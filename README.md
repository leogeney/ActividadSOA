<div align="center">

# 🏗️ Sistema de Gestión — Arquitectura Orientada a Servicios

![JavaScript](https://img.shields.io/badge/JavaScript-87.8%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS](https://img.shields.io/badge/CSS-11.4%25-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![HTML](https://img.shields.io/badge/HTML-0.8%25-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-dev--server-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Firestore](https://img.shields.io/badge/Firestore-039BE5?style=for-the-badge&logo=firebase&logoColor=white)

**Examen Final · Arquitectura Orientada a Servicios**
Ingeniería de Sistemas · UFPSO · Junio 2025

[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=flat-square)]()
[![Jira](https://img.shields.io/badge/Jira-Tablero-0052CC?style=flat-square&logo=jira)](https://ufpso-team-mor3rm8z.atlassian.net/jira/software/projects/PROYEC/boards/103)
[![GitHub](https://img.shields.io/badge/GitHub-Repositorio-181717?style=flat-square&logo=github)](https://github.com/leogeney/ActividadSOA)

</div>

---

## 📑 Tabla de Contenidos

- [Descripción](#-descripción-del-proyecto)
- [Equipo de Desarrollo](#-equipo-de-desarrollo)
- [Tecnologías](#-tecnologías-utilizadas)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Funcionalidades](#-funcionalidades)
- [Vistas Desarrolladas](#️-vistas-desarrolladas)
- [Cómo Ejecutar](#-cómo-ejecutar-el-proyecto)
- [Despliegue](#-despliegue-en-firebase-hosting)
- [Gestión del Proyecto](#-gestión-del-proyecto-jira)
- [Seguridad](#-seguridad)

---

## 📌 Descripción del Proyecto

Aplicación web desarrollada con **React + Vite** e integrada con **Firebase**, que implementa un sistema completo de autenticación, gestión de datos mediante operaciones CRUD sobre **Firestore**, auditoría de sesiones y despliegue en la nube mediante **Firebase Hosting**.

El proyecto fue desarrollado como evaluación final de la asignatura **Arquitectura Orientada a Servicios** del programa de Ingeniería de Sistemas de la UFPSO.

---

## 👥 Equipo de Desarrollo

| # | Integrante | Código | Responsabilidades |
|:---:|:---|:---:|:---|
| 1 | **Leonardo Geney** | `192210` | `LoginPage` · `RegisterPage` · `Dashboard` · `Welcome` · CRUD (2 módulos) |
| 2 | **Yhoryi Carrascal** | `192406` | `ForgotPage` · `ResetPage` · CRUD (2 módulos) |

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Uso |
|:---|:---:|:---|
| React | 18+ | Framework de interfaz de usuario |
| Vite | 5+ | Empaquetador y servidor de desarrollo |
| Firebase Authentication | 10+ | Autenticación de usuarios |
| Cloud Firestore | 10+ | Base de datos NoSQL en tiempo real |
| Firebase Hosting | — | Despliegue y publicación de la app |
| JavaScript (ES6+) | — | Lenguaje principal del proyecto |
| CSS3 | — | Estilos y diseño visual |
| Jira | — | Gestión y seguimiento del proyecto |

---

## 🗂️ Arquitectura del Proyecto

```
ActividadSOA/
├── public/
├── src/
│   ├── assets/
│   ├── components/         # Componentes reutilizables
│   ├── pages/
│   │   ├── LoginPage/      # Inicio de sesión
│   │   ├── RegisterPage/   # Registro de usuarios
│   │   ├── ForgotPage/     # Recuperación de contraseña
│   │   ├── ResetPage/      # Restablecimiento de contraseña
│   │   ├── Dashboard/      # Panel principal (Home)
│   │   ├── Welcome/        # Vista de bienvenida
│   │   └── [CRUD Modules]/ # Módulos individuales por integrante
│   ├── firebase/
│   │   └── firebaseConfig.js  # Configuración de Firebase
│   ├── routes/             # Rutas protegidas
│   ├── App.jsx
│   └── main.jsx
├── firebase.json           # Configuración Firebase Hosting (SPA)
├── .firebaserc
├── package.json
└── vite.config.js
```

---

## ✅ Funcionalidades

### 🔐 Autenticación
- [x] Registro de usuarios con correo y contraseña
- [x] Inicio de sesión con correo y contraseña
- [x] Inicio de sesión con Google
- [x] Inicio de sesión con GitHub
- [x] Inicio de sesión con Facebook
- [x] Recuperación de contraseña por correo
- [x] Restablecimiento de contraseña
- [x] Cierre de sesión

### 🗃️ CRUD — Módulos de Datos (Firestore)
- [x] **Módulo 1** (Leonardo): Crear, Consultar, Actualizar y Eliminar registros
- [x] **Módulo 2** (Leonardo): Crear, Consultar, Actualizar y Eliminar registros
- [x] **Módulo 3** (Yhoryi): Crear, Consultar, Actualizar y Eliminar registros
- [x] **Módulo 4** (Yhoryi): Crear, Consultar, Actualizar y Eliminar registros

### 🏠 Dashboard / Home
- [x] Información del usuario autenticado (nombre, correo, foto de perfil)
- [x] Navegación hacia todos los módulos CRUD
- [x] Acceso al módulo de auditoría
- [x] Visualización del perfil de usuario
- [x] Opción de cierre de sesión

### 📋 Auditoría de Sesiones
- [x] Registro de accesos en Firestore (usuario, hora de ingreso/salida, duración, método de autenticación, estado)
- [x] Interfaz con búsqueda y filtros
- [x] Exportación de reportes en formato PDF

### 🔒 Seguridad
- [x] Rutas protegidas (acceso solo a usuarios autenticados)
- [x] Redirección automática al Login para usuarios no autenticados
- [x] Reglas de seguridad en Firestore
- [x] Políticas de contraseña segura (mínimo 10 caracteres, mayúsculas, minúsculas, números y caracteres especiales)

### ☁️ Despliegue
- [x] Aplicación publicada en Firebase Hosting
- [x] Configuración SPA (`rewrites` en `firebase.json`)
- [x] URLs de recuperación/restablecimiento funcionales desde el entorno desplegado

---

## 🖥️ Vistas Desarrolladas

| # | Vista | Ruta | Responsable | Descripción |
|:---:|:---|:---:|:---|:---|
| 1 | `LoginPage` | `/` | Leonardo Geney | Inicio de sesión con múltiples proveedores |
| 2 | `RegisterPage` | `/register` | Leonardo Geney | Registro con validación de contraseña segura |
| 3 | `Dashboard` | `/dashboard` | Leonardo Geney | Panel principal con navegación y perfil |
| 4 | `Welcome` | `/welcome` | Leonardo Geney | Vista de bienvenida post-login |
| 5 | `ForgotPage` | `/forgot` | Yhoryi Carrascal | Envío de correo para recuperar contraseña |
| 6 | `ResetPage` | `/reset` | Yhoryi Carrascal | Formulario para restablecer contraseña |
| 7 | `AuditPage` | `/audit` | Ambos | Registro y visualización de auditoría |
| 8 | `CRUD Módulo 1` | `/modulo1` | Leonardo Geney | Gestión de [entidad 1] |
| 9 | `CRUD Módulo 2` | `/modulo2` | Leonardo Geney | Gestión de [entidad 2] |
| 10 | `CRUD Módulo 3` | `/modulo3` | Yhoryi Carrascal | Gestión de [entidad 3] |
| 11 | `CRUD Módulo 4` | `/modulo4` | Yhoryi Carrascal | Gestión de [entidad 4] |

---

## 🚀 Cómo Ejecutar el Proyecto

### Prerrequisitos

- Node.js `v18+`
- npm `v9+`
- Cuenta en [Firebase Console](https://console.firebase.google.com/)

### 1. Clonar el repositorio

```bash
git clone https://github.com/leogeney/ActividadSOA.git
```

### 2. Acceder al directorio del proyecto

```bash
cd ActividadSOA
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 5. Ejecutar en modo desarrollo

```bash
npm run dev
```

### 6. Abrir en el navegador

```
http://localhost:5173
```

---

## ☁️ Despliegue en Firebase Hosting

### Compilar para producción

```bash
npm run build
```

### Desplegar en Firebase

```bash
firebase deploy
```

### Configuración SPA (`firebase.json`)

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 🌐 URL Pública

> 🔗 [https://actividadsoa.web.app]((https://claseyhoryi.web.app/)) 

---

## 📊 Gestión del Proyecto (Jira)

El seguimiento del desarrollo, asignación de tareas y gestión del backlog se realizaron mediante **Jira Software**.

🔗 **Tablero Jira:** [Ver proyecto en Jira](https://ufpso-team-mor3rm8z.atlassian.net/jira/software/projects/PROYEC/boards/103)

El tablero incluye:
- Historias de usuario (HU) por cada funcionalidad
- Tareas individuales asignadas por integrante
- Backlog organizado por sprints
- Relación entre tareas de Jira y commits en GitHub

---

## 🔐 Seguridad

### Reglas de Firestore

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Política de Contraseñas

Las contraseñas deben cumplir con los siguientes requisitos:

| Requisito | Descripción |
|:---|:---|
| Longitud mínima | 10 caracteres |
| Mayúsculas | Al menos una letra mayúscula (A–Z) |
| Minúsculas | Al menos una letra minúscula (a–z) |
| Números | Al menos un dígito (0–9) |
| Caracteres especiales | Al menos uno (`@`, `#`, `$`, `!`, `%`, `*`, `?`, `&`) |

### Rutas Protegidas

Las rutas de la aplicación están protegidas mediante un componente `PrivateRoute` que verifica el estado de autenticación del usuario. Si el usuario no está autenticado, es redirigido automáticamente a `/` (Login).

---

## 📁 Evidencias del Proyecto

El documento PDF de evidencias incluye:

- [ ] Capturas del tablero Jira (historias de usuario, backlog, tareas)
- [ ] Capturas del repositorio GitHub (commits, ramas, historial)
- [ ] Evidencias de funcionalidades CRUD por integrante
- [ ] Evidencias del módulo de auditoría y reporte PDF
- [ ] Evidencias del módulo Dashboard / Bienvenida
- [ ] Evidencias de seguridad en contraseñas y protección de rutas
- [ ] Capturas de las reglas de seguridad en Firestore
- [ ] Evidencias del despliegue en Firebase Hosting
- [ ] URL pública de Firebase Hosting
- [ ] Enlace al repositorio GitHub

---

## 📄 Información Académica

| Campo | Detalle |
|:---|:---|
| Programa | Ingeniería de Sistemas |
| Asignatura | Arquitectura Orientada a Servicios |
| Docente | Wilder Andrés Duarte Neira |
| Fecha de evaluación | 12 de junio de 2025 |
| Modalidad | Trabajo en equipo (máximo 3 personas) |
| Entrega | UVIRTUAL — URL GitHub (rama `master`) |

---

<div align="center">

Desarrollado por **Leonardo Geney** y **Yhoryi Carrascal** · UFPSO 2025

</div>
