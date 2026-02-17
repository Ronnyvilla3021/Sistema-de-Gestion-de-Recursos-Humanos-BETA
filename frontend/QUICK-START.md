# ⚡ GUÍA RÁPIDA DE INSTALACIÓN LOCAL

## 📥 PREREQUISITOS

Descarga e instala (TODO GRATIS):
1. **Node.js**: https://nodejs.org/ (versión LTS)
2. **VS Code**: https://code.visualstudio.com/
3. **Git**: https://git-scm.com/

## 🚀 CONFIGURACIÓN EN 10 PASOS

### 1️⃣ Crear carpeta del proyecto
```bash
mkdir hr-system
cd hr-system
```

### 2️⃣ Crear estructura
```bash
mkdir backend frontend
```

### 3️⃣ Configurar BACKEND
```bash
cd backend
npm init -y
npm install express pg cors dotenv bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

### 4️⃣ Copiar archivos del backend
Copia los siguientes archivos que te proporcioné:
- ✅ `backend/src/index.js`
- ✅ `backend/src/config/database.js`
- ✅ `backend/src/config/schema.sql`
- ✅ `backend/src/controllers/auth.controller.js`
- ✅ `backend/src/controllers/employee.controller.js`
- ✅ `backend/src/middlewares/auth.middleware.js`
- ✅ `backend/src/routes/auth.routes.js`
- ✅ `backend/src/routes/employee.routes.js`
- ✅ `backend/.gitignore`

### 5️⃣ Crear base de datos en Neon
1. Ve a https://neon.tech/
2. Regístrate gratis con GitHub
3. Crea un proyecto: "hr-system-db"
4. Ejecuta el contenido de `schema.sql` en el SQL Editor
5. Copia el Connection String

### 6️⃣ Crear archivo `.env` en backend
```bash
# En la carpeta backend, crea el archivo .env con:
PORT=5000
DATABASE_URL=postgresql://[tu-connection-string-aqui]
JWT_SECRET=mi_clave_super_secreta_12345
NODE_ENV=development
```

### 7️⃣ Actualizar package.json del backend
En `backend/package.json`, actualiza la sección scripts:
```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js"
}
```

### 8️⃣ Configurar FRONTEND
```bash
cd ../frontend
npm create vite@latest . -- --template react
npm install
npm install react-router-dom axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 9️⃣ Copiar archivos del frontend
Copia los siguientes archivos:
- ✅ `frontend/tailwind.config.js`
- ✅ `frontend/src/index.css`
- ✅ `frontend/src/App.jsx`
- ✅ `frontend/src/services/api.js`
- ✅ `frontend/src/contexts/AuthContext.jsx`
- ✅ `frontend/src/components/ProtectedRoute.jsx`
- ✅ `frontend/src/components/layout/Layout.jsx`
- ✅ `frontend/src/components/employees/EmployeeModal.jsx`
- ✅ `frontend/src/pages/Login.jsx`
- ✅ `frontend/src/pages/Dashboard.jsx`
- ✅ `frontend/src/pages/Employees.jsx`
- ✅ `frontend/.gitignore`

### 🔟 Crear archivo `.env` en frontend
```bash
# En la carpeta frontend, crea el archivo .env con:
VITE_API_URL=http://localhost:5000/api
```

---

## ▶️ EJECUTAR EL PROYECTO

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
Deberías ver:
```
🚀 Server running on port 5000
✅ Database connected successfully
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```
Deberías ver:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## 🎯 PROBAR LA APLICACIÓN

1. Abre http://localhost:5173/
2. Login con:
   - Email: `admin@hr.com`
   - Password: `admin123`
3. ¡Listo! Deberías ver el dashboard

---

## 📁 ESTRUCTURA FINAL DEL PROYECTO

```
hr-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── schema.sql
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── employee.controller.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── employee.routes.js
│   │   └── index.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Layout.jsx
│   │   │   ├── employees/
│   │   │   │   └── EmployeeModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Employees.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── .gitignore
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## ❓ PROBLEMAS COMUNES

### "Cannot find module 'express'"
```bash
cd backend
npm install
```

### "VITE not found"
```bash
cd frontend
npm install
```

### Error de conexión a la base de datos
- Verifica que el `DATABASE_URL` en `.env` sea correcto
- Asegúrate de que la base de datos en Neon esté activa

### Puerto 5000 ya está en uso
Cambia el puerto en `backend/.env`:
```
PORT=5001
```
Y actualiza `frontend/.env`:
```
VITE_API_URL=http://localhost:5001/api
```

---

## 🎓 SIGUIENTES PASOS

1. ✅ Ejecuta el proyecto localmente
2. ✅ Prueba crear, editar y eliminar empleados
3. ✅ Sube tu código a GitHub
4. ✅ Despliega siguiendo el archivo DEPLOY.md
5. ✅ Agrégalo a tu portafolio

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa que todos los archivos estén en las carpetas correctas
2. Verifica que las dependencias estén instaladas
3. Revisa los errores en la consola
4. Asegúrate de que los archivos `.env` existan y tengan los valores correctos

¡Éxito! 🚀