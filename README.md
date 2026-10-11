# UrbanCool Frontend

GIS-based Decision Support System for Urban Heat Analysis & Intervention Planning. Built with **React 19**, **TypeScript**, **Vite**, **MapLibre GL JS**, and **Three.js**.

---

## 🗺️ Map Configuration & API Key Requirements

### **Is an API key required for the map?**
**No API key is required!** 

- **Basemap Engine:** UrbanCool uses **MapLibre GL JS** (an open-source fork of Mapbox GL) and connects to public raster tiles from **CARTO Voyager** and **OpenStreetMap**.
- **Zero Configuration:** The application runs 100% out-of-the-box in both development and production. No account registration, API tokens, credit cards, or billing configurations are required.
- **Optional Custom Styles:** If you wish to use custom proprietary Mapbox or MapTiler vector tiles in the future, you may configure `VITE_MAP_STYLE_URL` or `VITE_MAPBOX_TOKEN` in `frontend/.env`. If not supplied, it defaults seamlessly to the free CARTO Voyager open basemap.

---

## 🎨 Theme & Design System

The application features a cohesive, warm **Beige Light Theme** across the Mapping Workspace:
- **Primary Background:** Warm creamy alabaster (`#fdfbf7`, `#f7f3ec`)
- **Typography:** Deep espresso charcoal (`#2d241c`), mocha taupe (`#5c4d3c`), and warm sandstone (`#8c7a68`)
- **Accents:** Earthy terracotta (`#c2410c`), warm amber (`#b45309`), and copper (`#a87b51`)
- **Components:** Frosted glass panels (`rgba(255, 255, 255, 0.88)` with `backdrop-filter: blur(20px)`), refined borders, and subtle warm drop shadows.

---

## 🚀 Development & Build

### Install Dependencies
```bash
npm install
```

### Run Local Development Server
```bash
npm run dev
```
The application will be accessible at: `http://localhost:5173`

### Linting & Typecheck
```bash
npm run lint    # Runs oxlint
npm run build   # Compiles TypeScript and creates optimized Vite bundle
```
