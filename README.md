# 📊 Gastos del Hogar

Aplicación web para gestionar los gastos del hogar de manera simple y eficiente.

## 📁 Estructura del Proyecto

- `index.html`: Estructura principal de la aplicación
- `css/styles.css`: Estilos personalizados, modo claro/oscuro y diseño responsive
- `js/app.js`: Lógica de gastos, estadísticas, gráficos, tema y exportación a PDF
- `package.json`: Configuración y dependencias del proyecto

## 🚀 Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

3. **Abrir en el navegador:**
La aplicación se abrirá automáticamente en `http://localhost:3000`

## 📦 Paquetes NPM Incluidos

### Dependencias de Desarrollo:
- **live-server** (`^1.2.2`): Servidor de desarrollo con recarga automática

### Dependencias Principales:
- **Bootstrap** (`^5.3.9`): Framework CSS y modo oscuro (`data-bs-theme`)
- **Chart.js** (`^4.6.2`): Gráficos interactivos de gastos
- **Font Awesome Free** (`^7.3.1`): Iconos
- **jsPDF** (`^4.2.1`) & **jsPDF-AutoTable** (`^5.0.9`): Exportación de reportes en PDF

## 🛠️ Scripts Disponibles

- `npm start`: Inicia el servidor de desarrollo
- `npm run dev`: Inicia en puerto 3000
- `npm run build`: Compila el proyecto
- `npm test`: Ejecuta tests (pendiente de configurar)

## ✨ Características

- Registro de gastos por categoría y mes (`MM-AAAA`) con almacenamiento en `localStorage`
- Estadísticas globales (total, cantidad y promedio) y gráfico de torta por categoría
- Consulta mensual con eliminación de gastos y exportación a PDF
- Modo claro / oscuro con persistencia y detección de preferencia del sistema
- Diseño adaptable a dispositivos móviles
