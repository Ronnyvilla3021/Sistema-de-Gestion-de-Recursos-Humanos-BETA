# 🚀 Sistema de Gestión de Recursos Humanos (HR System)

Sistema full stack para administración de empleados, control de asistencia y gestión de nómina.

## 📋 Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (Autenticación)
- Bcrypt (Encriptación)

### Frontend
- React
- Tailwind CSS
- React Router
- Axios

## 🏗️ Arquitectura

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
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    └── package.json
```

## 🔧 Instalación Local

### Requisitos Previos
- Node.js 18+
- PostgreSQL (o cuenta en Neon.tech)
- Git

### 1. Clonar repositorio
```bash
git clone [tu-repositorio]
cd hr-system
```

### 2. Configurar Backend
```bash
cd backend
npm install

# Crear archivo .env con:
PORT=5000
DATABASE_URL=tu_connection_string_postgresql
JWT_SECRET=tu_clave_secreta
NODE_ENV=development
```

### 3. Crear Base de Datos
```bash
# Ejecutar el archivo schema.sql en tu base de datos PostgreSQL
# Esto creará todas las tablas necesarias
```

### 4. Configurar Frontend
```bash
cd ../frontend
npm install

# Crear archivo .env con:
VITE_API_URL=http://localhost:5000/api
```

### 5. Ejecutar Proyecto

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Abre: http://localhost:5173

## 👤 Usuario de Prueba

```
Email: admin@hr.com
Password: admin123
```

## 📊 Funcionalidades

### ✅ Implementadas
- ✓ Autenticación JWT
- ✓ Dashboard con estadísticas
- ✓ CRUD de empleados
- ✓ Filtro de búsqueda
- ✓ Gestión de departamentos
- ✓ Control de roles (Admin, HR, Supervisor)

### 🔜 Por Implementar
- Control de asistencia
- Gestión de nómina
- Reportes exportables (PDF/Excel)
- Gráficos avanzados

## 🌐 Despliegue

### Backend (Render.com)
1. Crear cuenta en Render.com
2. New > Web Service
3. Conectar repositorio GitHub
4. Configurar:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Agregar variables de entorno

### Frontend (Vercel)
1. Crear cuenta en Vercel
2. Import Project desde GitHub
3. Configurar:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Agregar variable: `VITE_API_URL=https://tu-backend.onrender.com/api`

### Base de Datos (Neon.tech)
1. Crear cuenta en Neon.tech
2. Crear proyecto nuevo
3. Copiar Connection String
4. Ejecutar schema.sql en el SQL Editor

## 📸 Screenshots

### Dashboard
![Dashboard](docs/dashboard.png)

### Gestión de Empleados
![Empleados](docs/employees.png)

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación JWT
- Validaciones backend
- Protección de rutas
- Variables de entorno

## 📝 Licencia

MIT

## 👨‍💻 Autor

[Tu Nombre]
- GitHub: [@tu-usuario]
- LinkedIn: [tu-perfil]
- Email: tu@email.com