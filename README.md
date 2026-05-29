
# Proyecto Semillero UTN 2026 - Sistema de Apoyo Pedagógico

## 🛠️ Estructura 
- `/backend`: API construida con **NestJS** 
- `/frontend`: Aplicación web  construida con **Next.js**.

---

## 🚀 Guía de Inicio Rápido para Colaboradores

### 1. Clonar el repositorio

### 2. Configurar y Levantar el Backend (NestJS)

Abre una terminal y dirígete a la carpeta del backend para instalar sus dependencias y ejecutarlo:

```bash
cd backend
npm install
npm run start:dev

```
> El backend estará corriendo por defecto en: `http://localhost:3000`

### 3. Configurar y Levantar el Frontend (Next.js)

En una **nueva ventana de la terminal**, dirígete a la carpeta del frontend para instalar sus dependencias y ejecutarlo:

```bash
cd frontend
npm install
npm run dev

```

> El frontend estará corriendo por defecto en: `http://localhost:3000` (o `http://localhost:3001` si el puerto 3000 está ocupado por Nest).

---

## 📌 Flujo de Trabajo en GitHub (Issues y Tareas)

Para mantener el orden del equipo:

1. Revisa la pestaña de **Issues** o el **Project Board** de este repositorio para ver tus tareas asignadas.
2. Antes de empezar a programar una tarea, crea una rama local descriptiva (ej. `feature/autenticacion`).
3. Al terminar tu tarea, sube tu rama y abre un **Pull Request (PR)** hacia la rama `develop` para que el equipo revise tu código antes de integrarlo.

```

### Para guardar este cambio en GitHub, ejecuta en tu terminal raíz:
```bash
git add .
git commit -m "Pequeño mensaje descriptivo del cambio realizado"
git push origin "Nombre de la rama"

```
