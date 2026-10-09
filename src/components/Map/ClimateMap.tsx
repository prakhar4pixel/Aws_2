import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import type { Feature, Polygon, MultiPolygon } from "geojson";
import { calculateAreaMetrics } from "../../utils/geo";
import type { SelectionInfo } from "../../types/gis";

interface ClimateMapProps {
    drawMode?: "polygon" | "delete" | "simple_select";
    onSelectionChange?: (selection: SelectionInfo) => void;
    onModeChange?: (mode: "polygon" | "delete" | "simple_select") => void;
    initialCenter?: [number, number] | null;
}

// MapboxDraw styles using MapLibre GL JS expressions (['get', 'active'])
const customDrawStyles = [
    // 1. Polygon Fill — active drawing fill & completed fill
    {
        id: "gl-draw-polygon-fill",
        type: "fill",
        filter: ["all", ["==", "$type", "Polygon"]],
        paint: {
            "fill-color": [
                "case",
                ["==", ["get", "active"], "true"], "#10b981",
                "#059669"
            ],
            "fill-outline-color": [
                "case",
                ["==", ["get", "active"], "true"], "#10b981",
                "#059669"
            ],
            "fill-opacity": [
                "case",
                ["==", ["get", "active"], "true"], 0.35,
                0.25
            ]
        }
    },
    // 2. Lines — Polygon outline stroke & LineString while placing points
    {
        id: "gl-draw-lines",
        type: "line",
        filter: ["any", ["==", "$type", "LineString"], ["==", "$type", "Polygon"]],
        layout: {
            "line-cap": "round",
            "line-join": "round"
        },
        paint: {
            "line-color": [
                "case",
                ["==", ["get", "active"], "true"], "#10b981",
                "#059669"
            ],
            "line-width": 3,
            "line-dasharray": [
                "case",
                ["==", ["get", "active"], "true"], ["literal", [0.2, 2]],
                ["literal", [1, 0]]
            ]
        }
    },
    // 3. Vertex Points — Outer white glow
    {
        id: "gl-draw-vertex-outer",
        type: "circle",
        filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"], ["!=", "mode", "static"]],
        paint: {
            "circle-radius": 7,
            "circle-color": "#ffffff"
        }
    },
    // 4. Vertex Points — Inner active/inactive color
    {
        id: "gl-draw-vertex-inner",
        type: "circle",
        filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"], ["!=", "mode", "static"]],
        paint: {
            "circle-radius": 5,
            "circle-color": [
                "case",
                ["==", ["get", "active"], "true"], "#ef4444",
                "#10b981"
            ]
        }
    },
    // 5. Midpoint handles
    {
        id: "gl-draw-midpoint",
        type: "circle",
        filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
        paint: {
            "circle-radius": 4,
            "circle-color": "#f59e0b",
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#ffffff"
        }
    }
];

export default function ClimateMap({ drawMode = "polygon", onSelectionChange, onModeChange, initialCenter }: ClimateMapProps) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const drawRef = useRef<MapboxDraw | null>(null);

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        const mapInstance = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    "osm-tiles": {
                        type: "raster",
                        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                        tileSize: 256,
                        attribution:
                            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
                    },
                },
                layers: [
                    {
                        id: "osm-tiles-layer",
                        type: "raster",
                        source: "osm-tiles",
                        minzoom: 0,
                        maxzoom: 19,
                    },
                ],
            },
            center: initialCenter || [77.2167, 28.6139],
            zoom: initialCenter ? 12 : 10,
        });

        map.current = mapInstance;

        // Standard navigation controls
        mapInstance.addControl(
            new maplibregl.NavigationControl({ showCompass: true }),
            "top-right"
        );

        // Polygon drawing control — hide default UI since we have custom DrawToolbar
        const drawControl = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                polygon: false,
                trash: false,
                point: false,
                line_string: false,
                combine_features: false,
                uncombine_features: false,
            },
            defaultMode: "draw_polygon",
            styles: customDrawStyles,
        });

        mapInstance.addControl(drawControl as unknown as maplibregl.IControl, "top-left");
        drawRef.current = drawControl;

        const updateSelectedArea = () => {
            if (!drawRef.current) return;
            const data = drawRef.current.getAll();
            if (data.features.length > 0) {
                const latestFeature = data.features[data.features.length - 1] as Feature<Polygon | MultiPolygon>;
                const { areaKm2, areaHectares } = calculateAreaMetrics(latestFeature);

                if (onSelectionChange) {
                    onSelectionChange({
                        geometry: latestFeature,
                        areaKm2,
                        areaHectares,
                    });
                }
            } else {
                if (onSelectionChange) {
                    onSelectionChange({
                        geometry: null,
                        areaKm2: 0,
                        areaHectares: 0,
                    });
                }
            }
        };

        (mapInstance as unknown as { on: (event: string, cb: () => void) => void }).on("draw.create", () => {
            updateSelectedArea();
            if (onModeChange) onModeChange("simple_select");
        });
        (mapInstance as unknown as { on: (event: string, cb: () => void) => void }).on("draw.update", updateSelectedArea);
        (mapInstance as unknown as { on: (event: string, cb: () => void) => void }).on("draw.delete", updateSelectedArea);

        return () => {
            mapInstance.remove();
            map.current = null;
        };
    }, [onSelectionChange, onModeChange]);

    // Sync mode changes & toggle drawing cursor class on container
    useEffect(() => {
        if (!drawRef.current || !map.current) return;

        const updateMode = () => {
            try {
                if (drawMode === "polygon") {
                    drawRef.current?.changeMode("draw_polygon");
                    mapContainer.current?.classList.add("drawing-mode");
                } else {
                    mapContainer.current?.classList.remove("drawing-mode");
                    if (drawMode === "delete") {
                        drawRef.current?.deleteAll();
                        if (onSelectionChange) {
                            onSelectionChange({ geometry: null, areaKm2: 0, areaHectares: 0 });
                        }
                        if (onModeChange) {
                            onModeChange("polygon");
                        }
                    }
                }
            } catch (err) {
                console.warn("MapboxDraw mode change delayed:", err);
            }
        };

        // If map is already loaded, update immediately. Otherwise wait for load event.
        if (map.current.loaded()) {
            updateMode();
        } else {
            map.current.once("load", updateMode);
        }
    }, [drawMode, onSelectionChange, onModeChange]);

    return <div ref={mapContainer} className="climate-map" />;
}