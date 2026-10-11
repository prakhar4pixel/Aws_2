import area from "@turf/area";
import type { Feature, Polygon, MultiPolygon } from "geojson";

export const DEFAULT_MIN_AREA_KM2 = 0.05; // 5 hectares (50,000 m²)

export interface AreaRestrictionPreset {
  id: string;
  label: string;
  minKm2: number;
  hectares: number;
  description: string;
}

export const AREA_RESTRICTION_PRESETS: AreaRestrictionPreset[] = [
  {
    id: "micro",
    label: "Micro-block (0.02 km²)",
    minKm2: 0.02,
    hectares: 2,
    description: "Small street cluster or local block (2 ha)",
  },
  {
    id: "neighborhood",
    label: "Neighborhood (0.05 km²)",
    minKm2: 0.05,
    hectares: 5,
    description: "Standard urban neighborhood zone (5 ha) — Recommended",
  },
  {
    id: "district",
    label: "District Sector (0.10 km²)",
    minKm2: 0.10,
    hectares: 10,
    description: "Macro district or administrative sub-ward (10 ha)",
  },
];

export function calculateAreaMetrics(
  feature: Feature<Polygon | MultiPolygon> | null,
  minAreaKm2: number = DEFAULT_MIN_AREA_KM2
) {
  if (!feature) {
    return {
      areaKm2: 0,
      areaHectares: 0,
      isValidArea: false,
      minAreaRequiredKm2: minAreaKm2,
      restrictionReason: "No area selected",
    };
  }

  const squareMeters = area(feature);
  const areaKm2 = Number((squareMeters / 1_000_000).toFixed(2));
  const areaHectares = Number((squareMeters / 10_000).toFixed(2));
  const isValidArea = areaKm2 >= minAreaKm2;

  const restrictionReason = !isValidArea
    ? `Selected area (${areaKm2} km²) is smaller than the required minimum threshold of ${minAreaKm2} km² (${(minAreaKm2 * 100).toFixed(0)} ha) for urban climate modeling.`
    : undefined;

  return {
    areaKm2,
    areaHectares,
    isValidArea,
    minAreaRequiredKm2: minAreaKm2,
    restrictionReason,
  };
}

/**
 * Expands a polygon geometry around its centroid to satisfy the minimum area constraint.
 */
export function expandPolygonToMinArea(
  feature: Feature<Polygon | MultiPolygon>,
  targetMinKm2: number = DEFAULT_MIN_AREA_KM2
): Feature<Polygon | MultiPolygon> {
  const currentMetrics = calculateAreaMetrics(feature, targetMinKm2);
  const currentArea = currentMetrics.areaKm2;

  // Extract outer ring coords
  let coords: [number, number][] = [];
  if (feature.geometry.type === "Polygon") {
    coords = (feature.geometry.coordinates[0] as [number, number][]) || [];
  } else if (feature.geometry.type === "MultiPolygon") {
    coords = (feature.geometry.coordinates[0]?.[0] as [number, number][]) || [];
  }

  if (coords.length === 0) return feature;

  // Compute centroid
  let sumLng = 0;
  let sumLat = 0;
  coords.forEach(([lng, lat]) => {
    sumLng += lng;
    sumLat += lat;
  });
  const cLng = sumLng / coords.length;
  const cLat = sumLat / coords.length;

  let scaleFactor = 1;
  if (currentArea <= 0.001) {
    // If tiny dot or zero, create square with side = sqrt(targetMinKm2) km
    const sideKm = Math.sqrt(targetMinKm2);
    const dLat = (sideKm / 111.32) / 2;
    const dLng = (sideKm / (111.32 * Math.cos((cLat * Math.PI) / 180))) / 2;
    const newCoords: [number, number][] = [
      [cLng - dLng, cLat - dLat],
      [cLng + dLng, cLat - dLat],
      [cLng + dLng, cLat + dLat],
      [cLng - dLng, cLat + dLat],
      [cLng - dLng, cLat - dLat],
    ];

    return {
      ...feature,
      geometry: {
        type: "Polygon",
        coordinates: [newCoords],
      },
    };
  } else {
    // Scale current shape outward: add 8% safety margin so rounded area exceeds min threshold
    scaleFactor = Math.sqrt(targetMinKm2 / currentArea) * 1.08;
    const newCoords = coords.map(([lng, lat]) => {
      const scaledLng = cLng + (lng - cLng) * scaleFactor;
      const scaledLat = cLat + (lat - cLat) * scaleFactor;
      return [scaledLng, scaledLat] as [number, number];
    });

    return {
      ...feature,
      geometry: {
        type: "Polygon",
        coordinates: [newCoords],
      },
    };
  }
}
