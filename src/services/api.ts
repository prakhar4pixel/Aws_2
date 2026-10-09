import type { Feature, Polygon, MultiPolygon } from "geojson";
import type { RiskCalculateResponse } from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export async function calculateClimateRisk(geometry: Feature<Polygon | MultiPolygon>): Promise<RiskCalculateResponse> {
    const response = await fetch(`${API_BASE_URL}/risk/calculate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ geometry: geometry.geometry }),
    });

    if (!response.ok) {
        throw new Error(`Failed to calculate climate risk: ${response.statusText}`);
    }

    return response.json();
}
