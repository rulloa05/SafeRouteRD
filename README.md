# 🛡️ Safe Routes Guardian

<p align="center">
  <img src="public/assets/logo-color.svg" alt="Safe Routes Guardian Logo" width="100"/>
</p>

<p align="center">
  <strong>Navegación inteligente adaptada a tu vehículo y las condiciones reales de las vías</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-19-red?logo=angular" />
  <img src="https://img.shields.io/badge/Leaflet-1.9.4-green?logo=leaflet" />
  <img src="https://img.shields.io/badge/OSRM-Rutas_Reales-blue" />
  <img src="https://img.shields.io/badge/ODS_11-Ciudades_Sostenibles-teal" />
</p>

---

## 📋 Descripción

**Safe Routes Guardian** es una aplicación móvil de navegación que va más allá de los GPS tradicionales. A diferencia de Waze o Google Maps, calcula rutas considerando el **tipo de vehículo del usuario** y las **condiciones reales del pavimento** — baches, calles no pavimentadas, inundaciones y obras activas — para proteger el vehículo y optimizar cada viaje.

Contribuye al **ODS 11 — Ciudades y Comunidades Sostenibles** al reducir el daño vehicular y mejorar la movilidad urbana en República Dominicana.

---

## 👥 Equipo de Desarrollo

| Nombre | Rol | GitHub |
|--------|-----|--------|
| Rafael Ulloa | Líder del Proyecto | [@rulloa05](https://github.com/rulloa05) |
| Carla Sbarra Camilo | Diseño UI/UX & Figma | — |
| Marlon Dotel Alcántara | Análisis Técnico | [@Marlonfofi10](https://github.com/Marlonfofi10) |
| Elianyi Otaño Romero | Validación & QA | — |
| Hector Morales Veloz | Prototipo & Desarrollo | — |

**Universidad:** UNAPEC — ISC615 Programación de Aplicaciones (ENE-ABR 2026)

---

## ✨ Características Principales

- 🗺️ **Mapa en tiempo real** con Leaflet + OpenStreetMap
- 🚗 **Rutas por tipo de vehículo** — Sedán, SUV, Motocicleta, Pick-up
- 🛣️ **Rutas reales** calculadas con OSRM (Open Source Routing Machine)
- 🔍 **Autocomplete inteligente** de destinos con Nominatim OSM
- ⚠️ **Reporte de incidentes** — baches, inundaciones, obras, accidentes
- 🔔 **Alertas activas** sobre condiciones viales en tiempo real
- ⛽ **Calculadora de combustible** por tipo de vehículo y distancia
- 📋 **Historial de viajes** con calificaciones y comentarios
- 👤 **Perfil de usuario** con preferencias de navegación

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Uso |
|-----------|-----|
| Angular 19 (Standalone) | Framework principal |
| TypeScript | Lenguaje de programación |
| Leaflet 1.9.4 | Mapas interactivos |
| OpenStreetMap | Tiles de mapa gratuitos |
| OSRM API | Cálculo de rutas reales |
| Nominatim API | Geocodificación y autocomplete |
| SCSS | Estilos con design tokens |
| Bootstrap Icons | Iconografía |

---

## 🚀 Instalación y Uso

### Requisitos
- Node.js 18+
- npm 9+

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/rulloa05/SafeRouteRD.git

# 2. Entrar al directorio
cd SafeRouteRD

# 3. Instalar dependencias
npm install

# 4. Correr en modo desarrollo
npx ng serve --open
```

La aplicación abre en `http://localhost:4200`

### Compilar para producción

```bash
npx ng build
```

---

## 📱 Pantallas de la Aplicación

| Pantalla | Descripción |
|----------|-------------|
| Splash | Presentación de la app con mini mapa |
| Login / Registro | Autenticación de usuarios |
| Selección de vehículo | Configura tu tipo de vehículo |
| Mapa principal | Rutas recomendadas y alertas |
| Establecer destino | Búsqueda con autocomplete real |
| Detalle de ruta | Condiciones viales y alternativas |
| Ruta activa | Navegación en tiempo real |
| Calculadora | Estimación de combustible |
| Perfil | Configuración y preferencias |

---

## 🗂️ Estructura del Proyecto

```
src/
├── app/
│   ├── auth/           # Login, registro, OTP, selección vehículo
│   ├── map/            # Mapa principal, destino, rutas, navegación
│   ├── routes/         # Historial, reservas, comentarios
│   ├── profile/        # Perfil, configuración, soporte
│   ├── calculator/     # Calculadora de combustible
│   └── shared/
│       ├── services/   # Auth, Route, Logger
│       ├── guards/     # Auth guard
│       ├── models/     # Interfaces TypeScript
│       └── ui/         # Componentes reutilizables
├── styles/
│   ├── _variables.scss # Design tokens
│   └── _mixins.scss
└── public/assets/      # Logo y recursos
```

---

## 🌍 Contribución al ODS 11

Safe Routes Guardian contribuye a las **Ciudades y Comunidades Sostenibles** al:

- ✅ Reducir el daño vehicular causado por malas condiciones viales
- ✅ Optimizar el consumo de combustible con rutas más eficientes
- ✅ Empoderar a los ciudadanos con información vial en tiempo real
- ✅ Fomentar la participación ciudadana mediante reportes de incidentes

---

## 📧 Contacto

- r.ulloa8@unapec.edu.do
- c.sbarra@unapec.edu.do
- m.dotel7@unapec.edu.do

---

<p align="center">Desarrollado con ❤️ en Santo Domingo, República Dominicana 🇩🇴</p>
