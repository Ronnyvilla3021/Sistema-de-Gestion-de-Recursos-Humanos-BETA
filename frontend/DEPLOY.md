# 🚀 GUÍA DE DESPLIEGUE COMPLETA - 100% GRATIS

## 📌 PARTE 1: PREPARAR BASE DE DATOS (Neon.tech)

### Paso 1: Crear cuenta en Neon
1. Ve a: https://neon.tech/
2. Click en "Sign Up" (Registrarse)
3. Usa tu cuenta de GitHub para registrarte (más fácil)
4. Acepta los términos

### Paso 2: Crear proyecto de base de datos
1. Click en "Create a project"
2. Nombre: `hr-system-db`
3. Región: Selecciona la más cercana
4. Click en "Create Project"

### Paso 3: Ejecutar el schema SQL
1. En el panel izquierdo, click en "SQL Editor"
2. Copia TODO el contenido del archivo `backend/src/config/schema.sql`
3. Pégalo en el editor SQL
4. Click en "Run" o presiona Ctrl+Enter
5. Deberías ver: "Success" en cada tabla creada

### Paso 4: Copiar Connection String
1. En el panel, busca "Connection String"
2. Copia el string completo (empieza con `postgresql://`)
3. Guárdalo en un notepad, lo necesitarás después

---

## 📌 PARTE 2: DESPLEGAR BACKEND (Render.com)

### Paso 1: Subir código a GitHub
```bash
# En tu terminal, en la raíz del proyecto:
git init
git add .
git commit -m "Initial commit"

# Crea un repositorio en GitHub.com
# Luego ejecuta:
git remote add origin https://github.com/TU-USUARIO/hr-system.git
git branch -M main
git push -u origin main
```

### Paso 2: Crear cuenta en Render
1. Ve a: https://render.com/
2. Click en "Get Started for Free"
3. Regístrate con tu cuenta de GitHub

### Paso 3: Crear Web Service para Backend
1. En el dashboard de Render, click "New +"
2. Selecciona "Web Service"
3. Click en "Connect account" para conectar GitHub
4. Busca y selecciona tu repositorio `hr-system`
5. Click en "Connect"

### Paso 4: Configurar el servicio
**Configuración básica:**
- Name: `hr-system-backend`
- Region: Selecciona la más cercana
- Branch: `main`
- Root Directory: `backend`
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Instance Type: `Free`

### Paso 5: Agregar Variables de Entorno
Click en "Advanced" y luego "Add Environment Variable":

```
PORT = 5000
DATABASE_URL = [tu_connection_string_de_neon]
JWT_SECRET = mi_clave_super_secreta_12345
NODE_ENV = production
```

### Paso 6: Desplegar
1. Click en "Create Web Service"
2. Espera 3-5 minutos mientras se despliega
3. Cuando termine, verás "Live" en verde
4. Copia la URL (ejemplo: `https://hr-system-backend.onrender.com`)

### Paso 7: Verificar que funciona
Abre en el navegador: `https://tu-backend-url.onrender.com/`
Deberías ver: `{"message":"HR System API - Running"}`

---

## 📌 PARTE 3: DESPLEGAR FRONTEND (Vercel)

### Paso 1: Actualizar variable de entorno
En tu proyecto local, abre `frontend/.env` y cambia:
```
VITE_API_URL=https://TU-BACKEND-URL.onrender.com/api
```

### Paso 2: Hacer commit del cambio
```bash
git add frontend/.env
git commit -m "Update API URL for production"
git push
```

### Paso 3: Crear cuenta en Vercel
1. Ve a: https://vercel.com/
2. Click en "Sign Up"
3. Regístrate con GitHub

### Paso 4: Importar proyecto
1. En el dashboard de Vercel, click "Add New..."
2. Click en "Project"
3. Click en "Import Git Repository"
4. Busca y selecciona `hr-system`
5. Click en "Import"

### Paso 5: Configurar proyecto
**Configure Project:**
- Framework Preset: `Vite`
- Root Directory: Click "Edit" y escribe `frontend`
- Build Command: `npm run build` (ya está por defecto)
- Output Directory: `dist` (ya está por defecto)

### Paso 6: Agregar Variable de Entorno
Click en "Environment Variables":
```
Name: VITE_API_URL
Value: https://TU-BACKEND-URL.onrender.com/api
```

### Paso 7: Desplegar
1. Click en "Deploy"
2. Espera 1-2 minutos
3. Verás confetti 🎉 cuando termine
4. Click en "Visit" para ver tu app

---

## 🎯 PASO FINAL: PROBAR TODO

### Prueba 1: Verificar Backend
Ve a: `https://tu-backend.onrender.com/api/employees`
- Deberías ver un error de autenticación (eso es bueno, significa que está funcionando)

### Prueba 2: Hacer Login
1. Ve a tu app en Vercel: `https://tu-app.vercel.app`
2. Deberías ver la pantalla de login
3. Usa las credenciales:
   - Email: `admin@hr.com`
   - Password: `admin123`
4. Si ves el Dashboard, ¡FELICIDADES! 🎉

### Prueba 3: Crear un empleado
1. Click en "Empleados" en el menú
2. Click en "Nuevo Empleado"
3. Llena el formulario
4. Click en "Guardar"
5. Deberías ver el empleado en la lista

---

## 🔧 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "Failed to fetch"
- Verifica que la URL del backend en `VITE_API_URL` sea correcta
- Asegúrate de que el backend esté "Live" en Render

### Error: "Database connection error"
- Verifica el `DATABASE_URL` en las variables de entorno de Render
- Asegúrate de que la base de datos en Neon esté activa

### Error: "Invalid token"
- Borra el localStorage del navegador
- Haz login nuevamente

### El backend tarda mucho en responder
- Los servicios gratuitos de Render se "duermen" después de inactividad
- La primera petición puede tardar 30-60 segundos
- Después será normal

---

## 📝 CHECKLIST FINAL

✅ Base de datos creada en Neon
✅ Schema.sql ejecutado correctamente
✅ Backend desplegado en Render
✅ Variables de entorno configuradas en Render
✅ Frontend desplegado en Vercel
✅ Variable VITE_API_URL configurada en Vercel
✅ Puedo hacer login
✅ Puedo ver el dashboard
✅ Puedo crear empleados

---

## 🎓 PARA TU CV

**Sistema de Gestión de Recursos Humanos**
- Tecnologías: React, Node.js, Express, PostgreSQL
- Deploy: Vercel (Frontend), Render (Backend), Neon (Database)
- Demo: [tu-app.vercel.app]
- Código: [github.com/tu-usuario/hr-system]

---

## 🆘 ¿NECESITAS AYUDA?

Si algo no funciona:
1. Revisa los logs en Render (pestaña "Logs")
2. Revisa la consola del navegador (F12)
3. Verifica que todas las URLs estén correctas
4. Asegúrate de que las variables de entorno estén bien escritas

¡Éxito con tu proyecto! 🚀