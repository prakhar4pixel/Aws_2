import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import DrawRectangle from "mapbox-gl-draw-rectangle-mode";
import FreehandMode from "mapbox-gl-draw-freehand-mode";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

// Explicitly register worker URL so Vite production bundles resolve the MapLibre web worker
maplibregl.setWorkerUrl(workerUrl);
import type { Feature, Polygon, MultiPolygon } from "geojson";
import { calculateAreaMetrics } from "../../utils/geo";
import type { SelectionInfo } from "../../types/gis";
import type { HeatAnalysisResponse, InterventionResponse } from "../../types/api";
import LayerControls from "./LayerControls";
import type { LayerVisibilityState } from "./LayerControls";
import MapLegend from "./MapLegend";
import { AlertTriangle, Maximize2 } from "lucide-react";

interface ClimateMapProps {
  drawMode?: "polygon" | "rectangle" | "freehand" | "delete" | "simple_select";
  onSelectionChange?: (selection: SelectionInfo) => void;
  onModeChange?: (mode: "polygon" | "rectangle" | "freehand" | "delete" | "simple_select") => void;
  initialCenter?: [number, number] | null;
  selection?: SelectionInfo | null;
  minAreaKm2?: number;
  onAutoExpand?: () => void;
  analysis?: HeatAnalysisResponse | null;
  interventions?: InterventionResponse | null;
  layers?: LayerVisibilityState;
  onLayersChange?: (layers: LayerVisibilityState) => void;
}

const customDrawStyles = [
  {
    id: "gl-draw-polygon-fill",
    type: "fill",
    filter: ["all", ["==", "$type", "Polygon"]],
    paint: {
      "fill-color": [
        "case",
        ["==", ["get", "user_min_area_valid"], "false"],
        "#e11d48",
        "#b45309",
      ],
      "fill-outline-color": [
        "case",
        ["==", ["get", "user_min_area_valid"], "false"],
        "#be123c",
        "#78350f",
      ],
      "fill-opacity": [
        "case",
        ["==", ["get", "user_min_area_valid"], "false"],
        0.35,
        ["==", ["get", "active"], "true"],
        0.28,
        0.18,
      ],
    },
  },
  {
    id: "gl-draw-lines",
    type: "line",
    filter: ["any", ["==", "$type", "LineString"], ["==", "$type", "Polygon"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": [
        "case",
        ["==", ["get", "user_min_area_valid"], "false"],
        "#be123c",
        "#b45309",
      ],
      "line-width": 3,
    },
  },
  {
    id: "gl-draw-polygon-midpoint",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
    paint: {
      "circle-radius": 4,
      "circle-color": "#b45309",
    },
  },
  {
    id: "gl-draw-vertex-outer",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"], ["!=", "mode", "static"]],
    paint: {
      "circle-radius": 6,
      "circle-color": "#ffffff",
      "circle-stroke-width": 1.5,
      "circle-stroke-color": "#78350f",
    },
  },
  {
    id: "gl-draw-vertex-inner",
    type: "circle",
    filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"], ["!=", "mode", "static"]],
    paint: {
      "circle-radius": 4,
      "circle-color": [
        "case",
        ["==", ["get", "user_min_area_valid"], "false"],
        "#be123c",
        "#b45309",
      ],
    },
  },
];

export default function ClimateMap({
  drawMode = "polygon",
  onSelectionChange,
  onModeChange,
  initialCenter,
  selection,
  minAreaKm2 = 0.05,
  onAutoExpand,
  analysis,
  interventions,
  layers: externalLayers,
  onLayersChange,
}: ClimateMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const [internalLayers, setInternalLayers] = useState<LayerVisibilityState>({
    showSelection: true,
    showLST: true,
    showHotspots: true,
    showNDVI: false,
    showLandCover: false,
    showInterventions: true,
  });

  const activeLayers = externalLayers || internalLayers;
  const setLayers = onLayersChange || setInternalLayers;

  const onSelectionChangeRef = useRef(onSelectionChange);
  const onModeChangeRef = useRef(onModeChange);
  const minAreaKm2Ref = useRef(minAreaKm2);
  const initialCenterRef = useRef(initialCenter);

  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
    onModeChangeRef.current = onModeChange;
    minAreaKm2Ref.current = minAreaKm2;
  }, [onSelectionChange, onModeChange, minAreaKm2]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = (import.meta.env.VITE_MAPBOX_TOKEN as string) || "";
    const cartoKey = (import.meta.env.VITE_CARTO_API_KEY as string) || "";

    const tileUrls = mapboxToken
      ? [
          `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`,
        ]
      : cartoKey
      ? [
          `https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png?api_key=${cartoKey}`,
          `https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png?api_key=${cartoKey}`,
          `https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png?api_key=${cartoKey}`,
          `https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png?api_key=${cartoKey}`,
        ]
      : [
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
        ];

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "open-basemap": {
            type: "raster",
            tiles: tileUrls,
            tileSize: 256,
            minzoom: 0,
            maxzoom: 19,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "open-basemap-layer",
            type: "raster",
            source: "open-basemap",
            minzoom: 0,
          },
        ],
      },
      center: initialCenterRef.current || [77.2167, 28.6139],
      zoom: initialCenterRef.current ? 12 : 11,
      minZoom: 2,
      maxZoom: 20,
      fadeDuration: 0,
      maxTileCacheSize: 150,
      refreshExpiredTiles: false,
      trackResize: true,
      renderWorldCopies: true,
    });

    mapInstance.on("load", () => {
      mapInstance.resize();
    });

    const resizeTimer = setTimeout(() => {
      if (map.current) {
        map.current.resize();
      }
    }, 150);

    map.current = mapInstance;

    // Navigation Controls
    mapInstance.addControl(
      new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }),
      "top-right"
    );

    const modes = MapboxDraw.modes;
    const actualDrawRectangle = (DrawRectangle as any).default || DrawRectangle;
    const actualFreehandMode = (FreehandMode as any).default || FreehandMode;

    const customModes = {
      ...modes,
      draw_rectangle: actualDrawRectangle,
      draw_freehand: actualFreehandMode,
    };

    // Ensure MapboxDraw compatibility classes are attached to MapLibre elements
    const canvas = mapInstance.getCanvas();
    if (canvas && !canvas.classList.contains("mapboxgl-canvas")) {
      canvas.classList.add("mapboxgl-canvas");
    }
    const canvasContainer = mapInstance.getCanvasContainer();
    if (canvasContainer && !canvasContainer.classList.contains("mapboxgl-canvas-container")) {
      canvasContainer.classList.add("mapboxgl-canvas-container");
    }
    const container = mapInstance.getContainer();
    if (container && !container.classList.contains("mapboxgl-map")) {
      container.classList.add("mapboxgl-map");
    }

    const drawControl = new MapboxDraw({
      displayControlsDefault: false,
      modes: customModes as any,
      controls: {
        polygon: false,
        trash: false,
        point: false,
        line_string: false,
        combine_features: false,
        uncombine_features: false,
      },
      defaultMode: "simple_select",
      styles: customDrawStyles,
    });

    mapInstance.addControl(drawControl as unknown as maplibregl.IControl, "top-left");
    drawRef.current = drawControl;

    const updateSelectedArea = () => {
      if (!drawRef.current) return;
      const data = drawRef.current.getAll();
      if (data.features.length > 0) {
        const latestFeature = data.features[data.features.length - 1] as Feature<Polygon | MultiPolygon>;

        if (data.features.length > 1) {
          const toDelete = data.features.slice(0, -1).map((f) => f.id as string);
          drawRef.current.delete(toDelete);
        }

        const { areaKm2, areaHectares, isValidArea, minAreaRequiredKm2, restrictionReason } =
          calculateAreaMetrics(latestFeature, minAreaKm2Ref.current);

        if (latestFeature.id) {
          drawRef.current.setFeatureProperty(
            latestFeature.id as string,
            "min_area_valid",
            isValidArea ? "true" : "false"
          );
        }

        if (onSelectionChangeRef.current) {
          onSelectionChangeRef.current({
            geometry: latestFeature,
            areaKm2,
            areaHectares,
            isValidArea,
            minAreaRequiredKm2,
            restrictionReason,
          });
        }
      } else {
        if (onSelectionChangeRef.current) {
          onSelectionChangeRef.current({
            geometry: null,
            areaKm2: 0,
            areaHectares: 0,
            isValidArea: false,
            minAreaRequiredKm2: minAreaKm2Ref.current,
          });
        }
      }
    };

    (mapInstance as unknown as { on: (event: string, cb: () => void) => void }).on(
      "draw.create",
      () => {
        updateSelectedArea();
        if (onModeChangeRef.current) onModeChangeRef.current("simple_select");
      }
    );
    (mapInstance as unknown as { on: (event: string, cb: () => void) => void }).on(
      "draw.update",
      updateSelectedArea
    );
    (mapInstance as unknown as { on: (event: string, cb: () => void) => void }).on(
      "draw.delete",
      updateSelectedArea
    );

    // Hover tooltip for grid cells
    mapInstance.on("mousemove", "urbancool-grid-fill", (e) => {
      if (mapInstance.isZooming() || mapInstance.isMoving()) return;
      if (!e.features || e.features.length === 0) return;
      mapInstance.getCanvas().style.cursor = "pointer";

      const prop = e.features[0].properties;
      if (!prop) return;

      const coords = e.lngLat;
      const htmlContent = `
        <div style="font-family: inherit; font-size: 12px; color: #2d241c; padding: 4px;">
          <strong style="color: #b45309; display: block; margin-bottom: 2px;">${prop.cell_id}</strong>
          <div>LST: <strong style="color: #be123c;">${prop.lst}°C</strong> (Anomaly: +${prop.anomaly}°C)</div>
          <div>NDVI: <strong>${prop.ndvi}</strong> (${prop.landCover})</div>
          <div style="margin-top: 3px; font-weight: 600; color: #5c4d3c;">${prop.hotspotTag}</div>
        </div>
      `;

      if (!popupRef.current) {
        popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
      }

      popupRef.current.setLngLat(coords).setHTML(htmlContent).addTo(mapInstance);
    });

    mapInstance.on("mouseleave", "urbancool-grid-fill", () => {
      mapInstance.getCanvas().style.cursor = "";
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    });

    return () => {
      clearTimeout(resizeTimer);
      if (popupRef.current) popupRef.current.remove();
      mapInstance.remove();
      map.current = null;
    };
  }, []);

  // Update center when initialCenter changes
  useEffect(() => {
    if (map.current && initialCenter) {
      map.current.flyTo({
        center: initialCenter,
        zoom: 12.5,
        essential: true,
      });
    }
  }, [initialCenter]);

  // Synchronize programmatic geometry changes (e.g. Auto-Expand)
  useEffect(() => {
    if (!drawRef.current) return;
    const draw = drawRef.current;
    if (!selection?.geometry) {
      if (draw.getAll().features.length > 0) {
        draw.deleteAll();
      }
      return;
    }

    const currentFeatures = draw.getAll().features;
    const currentGeom = currentFeatures[0]?.geometry;
    const newGeom = selection.geometry.geometry;

    if (
      currentFeatures.length === 0 ||
      JSON.stringify(currentGeom) !== JSON.stringify(newGeom)
    ) {
      draw.deleteAll();
      const featureToAdd = { ...selection.geometry };
      const featureIds = draw.add(featureToAdd);
      if (featureIds.length > 0) {
        draw.setFeatureProperty(
          featureIds[0],
          "min_area_valid",
          selection.isValidArea ? "true" : "false"
        );
      }
    }
  }, [selection?.geometry, selection?.isValidArea]);

  // Sync mode changes & toggle drawing cursor class on container
  useEffect(() => {
    if (!drawRef.current || !map.current) return;

    const updateMode = () => {
      try {
        mapContainer.current?.classList.remove("drawing-mode");

        if (drawMode === "polygon") {
          drawRef.current?.changeMode("draw_polygon");
          mapContainer.current?.classList.add("drawing-mode");
        } else if (drawMode === "rectangle") {
          drawRef.current?.changeMode("draw_rectangle");
          mapContainer.current?.classList.add("drawing-mode");
        } else if (drawMode === "freehand") {
          drawRef.current?.changeMode("draw_freehand");
          mapContainer.current?.classList.add("drawing-mode");
        } else if (drawMode === "delete") {
          drawRef.current?.deleteAll();
          if (onSelectionChangeRef.current) {
            onSelectionChangeRef.current({
              geometry: null,
              areaKm2: 0,
              areaHectares: 0,
              isValidArea: false,
              minAreaRequiredKm2: minAreaKm2Ref.current,
            });
          }
          if (onModeChangeRef.current) {
            onModeChangeRef.current("simple_select");
          }
        } else if (drawMode === "simple_select") {
          drawRef.current?.changeMode("simple_select");
        }
      } catch (err) {
        console.warn("MapboxDraw mode change delayed:", err);
      }
    };

    if (map.current.loaded()) {
      setTimeout(updateMode, 50);
    } else {
      map.current.once("load", () => {
        setTimeout(updateMode, 50);
      });
    }
  }, [drawMode]);

  // ── Sync Environmental Layers (LST Grid, Hotspots, NDVI, Interventions) ──
  useEffect(() => {
    if (!map.current) return;
    const m = map.current;

    const syncLayers = () => {
      // 1. Thermal LST / NDVI / Land Cover Raster Grid Source
      if (!m.getSource("urbancool-grid-source")) {
        m.addSource("urbancool-grid-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
          tolerance: 0.375,
          buffer: 64,
          maxzoom: 18,
        });

        // Fill layer
        m.addLayer({
          id: "urbancool-grid-fill",
          type: "fill",
          source: "urbancool-grid-source",
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "lst"],
              30, "#38bdf8",
              34, "#2dd4bf",
              37, "#facc15",
              40, "#fb923c",
              43, "#f43f5e",
              47, "#881337",
            ],
            "fill-opacity": 0.65,
          },
        });

        // Outline layer
        m.addLayer({
          id: "urbancool-grid-line",
          type: "line",
          source: "urbancool-grid-source",
          paint: {
            "line-color": "#ffffff",
            "line-width": 0.75,
            "line-opacity": 0.4,
          },
        });
      }

      // Update grid data & styling based on active layer
      const gridSource = m.getSource("urbancool-grid-source") as maplibregl.GeoJSONSource | undefined;
      if (gridSource) {
        if (analysis?.gridGeoJson && (activeLayers.showLST || activeLayers.showNDVI || activeLayers.showLandCover)) {
          gridSource.setData(analysis.gridGeoJson as any);

          // Dynamically change fill-color ramp based on active toggle
          if (activeLayers.showNDVI && !activeLayers.showLST) {
            m.setPaintProperty("urbancool-grid-fill", "fill-color", [
              "interpolate",
              ["linear"],
              ["get", "ndvi"],
              0.05, "#d97706",
              0.15, "#eab308",
              0.25, "#a3e635",
              0.40, "#22c55e",
              0.65, "#15803d",
            ]);
            m.setPaintProperty("urbancool-grid-fill", "fill-opacity", 0.65);
          } else if (activeLayers.showLandCover && !activeLayers.showLST && !activeLayers.showNDVI) {
            m.setPaintProperty("urbancool-grid-fill", "fill-color", [
              "match",
              ["get", "landCover"],
              "Built-up", "#64748b",
              "Vegetation", "#22c55e",
              "Water", "#0ea5e9",
              "Bare/Paved", "#f59e0b",
              "#94a3b8",
            ]);
            m.setPaintProperty("urbancool-grid-fill", "fill-opacity", 0.6);
          } else {
            // Default LST continuous thermal ramp
            m.setPaintProperty("urbancool-grid-fill", "fill-color", [
              "interpolate",
              ["linear"],
              ["get", "lst"],
              30, "#38bdf8",
              34, "#2dd4bf",
              37, "#facc15",
              40, "#fb923c",
              43, "#f43f5e",
              47, "#881337",
            ]);
            m.setPaintProperty("urbancool-grid-fill", "fill-opacity", activeLayers.showLST ? 0.65 : 0.0);
          }
        } else {
          gridSource.setData({ type: "FeatureCollection", features: [] });
        }
      }

      // 2. Spatial Hotspot Markers Source
      if (!m.getSource("urbancool-hotspots-source")) {
        m.addSource("urbancool-hotspots-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
          tolerance: 0.375,
          buffer: 64,
        });

        // Hotspot glow circle
        m.addLayer({
          id: "urbancool-hotspot-glow",
          type: "circle",
          source: "urbancool-hotspots-source",
          paint: {
            "circle-radius": 22,
            "circle-color": [
              "match",
              ["get", "category"],
              "Severe", "#f43f5e",
              "Elevated", "#fb923c",
              "#38bdf8",
            ],
            "circle-opacity": 0.25,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });

        // Hotspot inner dot
        m.addLayer({
          id: "urbancool-hotspot-dot",
          type: "circle",
          source: "urbancool-hotspots-source",
          paint: {
            "circle-radius": 8,
            "circle-color": [
              "match",
              ["get", "category"],
              "Severe", "#e11d48",
              "Elevated", "#ea580c",
              "#0284c7",
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      }

      const hotspotSource = m.getSource("urbancool-hotspots-source") as maplibregl.GeoJSONSource | undefined;
      if (hotspotSource) {
        if (analysis?.hotspots && activeLayers.showHotspots) {
          const hotspotFeatures = analysis.hotspots.map((hs) => ({
            type: "Feature",
            properties: {
              name: hs.name,
              category: hs.category,
              meanLst: hs.meanLst,
              anomaly: hs.relativeDiff,
            },
            geometry: {
              type: "Point",
              coordinates: hs.center,
            },
          }));
          hotspotSource.setData({
            type: "FeatureCollection",
            features: hotspotFeatures as any,
          });
        } else {
          hotspotSource.setData({ type: "FeatureCollection", features: [] });
        }
      }

      // 3. Intervention Zones Source
      if (!m.getSource("urbancool-interventions-source")) {
        m.addSource("urbancool-interventions-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
          tolerance: 0.375,
          buffer: 64,
        });

        m.addLayer({
          id: "urbancool-interventions-fill",
          type: "fill",
          source: "urbancool-interventions-source",
          filter: ["==", "$type", "Polygon"],
          paint: {
            "fill-color": [
              "match",
              ["get", "type"],
              "cool_roofs", "#38bdf8",
              "pocket_parks", "#4ade80",
              "#a855f7",
            ],
            "fill-opacity": 0.45,
          },
        });

        m.addLayer({
          id: "urbancool-interventions-outline",
          type: "line",
          source: "urbancool-interventions-source",
          filter: ["==", "$type", "Polygon"],
          paint: {
            "line-color": "#ffffff",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        });

        m.addLayer({
          id: "urbancool-interventions-line",
          type: "line",
          source: "urbancool-interventions-source",
          filter: ["==", "$type", "LineString"],
          paint: {
            "line-color": [
              "match",
              ["get", "type"],
              "green_corridors", "#22c55e",
              "pedestrian_shade", "#f59e0b",
              "#38bdf8",
            ],
            "line-width": 4,
            "line-dasharray": [3, 2],
          },
        });
      }

      const intSource = m.getSource("urbancool-interventions-source") as maplibregl.GeoJSONSource | undefined;
      if (intSource) {
        if (interventions?.interventionZonesGeoJson && activeLayers.showInterventions) {
          intSource.setData(interventions.interventionZonesGeoJson as any);
        } else {
          intSource.setData({ type: "FeatureCollection", features: [] });
        }
      }
    };

    if (m.loaded()) {
      syncLayers();
    } else {
      m.once("load", syncLayers);
    }
  }, [analysis, interventions, activeLayers]);

  const isTooSmall = Boolean(selection?.geometry && !selection.isValidArea && selection.areaKm2 > 0);

  return (
    <div className="climate-map-container" style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapContainer} className="climate-map" style={{ width: "100%", height: "100%" }} />

      {/* Layer Controls Overlaid on Top Right */}
      <LayerControls
        layers={activeLayers}
        onChange={setLayers}
        hasData={Boolean(analysis)}
      />

      {/* Scientific Legend Overlaid on Bottom Left */}
      <MapLegend
        showLST={activeLayers.showLST && Boolean(analysis)}
        showNDVI={activeLayers.showNDVI && Boolean(analysis)}
        showHotspots={activeLayers.showHotspots && Boolean(analysis)}
        showLandCover={activeLayers.showLandCover && Boolean(analysis)}
        showInterventions={activeLayers.showInterventions && Boolean(interventions)}
      />

      {/* Minimum Area Restriction Banner */}
      {isTooSmall && (
        <div className="map-restriction-banner">
          <div className="banner-content">
            <AlertTriangle size={16} className="banner-warning-icon" />
            <div className="banner-text-block">
              <span className="banner-title">Area Restriction: Selection Too Small</span>
              <span className="banner-desc">
                Current area is <strong>{selection?.areaKm2} km²</strong>. Minimum required is{" "}
                <strong>{minAreaKm2} km²</strong> ({(minAreaKm2 * 100).toFixed(0)} ha) for valid urban heat analysis.
              </span>
            </div>
          </div>
          {onAutoExpand && (
            <button type="button" className="banner-expand-btn" onClick={onAutoExpand}>
              <Maximize2 size={14} />
              <span>Auto-Expand</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}