import type { EnvironmentalMetrics } from "../types/api";
import type { ScenarioResult } from "../types/intervention";

export interface ScenarioAdjustments {
    greenCoverageIncrease: number; // 0 to 100 percentage points
    roofReflectivityIncrease: number; // 0 to 100 percentage points
    pedestrianShadeIncrease: number; // 0 to 100 percentage points
    openSpaceIncrease: number; // 0 to 100 percentage points
}

export function simulateScenario(
    _currentMetrics: EnvironmentalMetrics,
    currentRiskScore: number,
    adjustments: ScenarioAdjustments
): ScenarioResult {
    // This is a provisional scenario model explicitly for the What-If Simulator
    // We do not have scientifically validated cooling effects yet.
    
    let estimatedScore = currentRiskScore;
    const assumptions: string[] = [];
    const contributingInterventions: string[] = [];

    // Green Coverage
    if (adjustments.greenCoverageIncrease > 0) {
        // Provisional model: Every 10% increase in green coverage reduces risk by ~3 points
        const reduction = (adjustments.greenCoverageIncrease / 10) * 3;
        estimatedScore -= reduction;
        assumptions.push(`Provisional assumption: 10% increase in green coverage reduces heat risk score by 3 points.`);
        contributingInterventions.push("Tree and Green Corridors / Pocket Parks");
    }

    // Roof Reflectivity (Cool Roofs)
    if (adjustments.roofReflectivityIncrease > 0) {
        // Provisional model: Assuming a dense area, every 10% increase in roof reflectivity reduces risk by ~2 points
        const reduction = (adjustments.roofReflectivityIncrease / 10) * 2;
        estimatedScore -= reduction;
        assumptions.push(`Provisional assumption: 10% increase in roof reflectivity reduces heat risk score by 2 points (dependent on built-up area).`);
        if (!contributingInterventions.includes("Cool Roofs")) {
            contributingInterventions.push("Cool Roofs");
        }
    }

    // Pedestrian Shade
    if (adjustments.pedestrianShadeIncrease > 0) {
        const reduction = (adjustments.pedestrianShadeIncrease / 10) * 1.5;
        estimatedScore -= reduction;
        assumptions.push(`Provisional assumption: 10% increase in pedestrian shading reduces localized heat exposure risk by 1.5 points.`);
        contributingInterventions.push("Shaded Pedestrian Corridors");
    }

    // Open Space (Permeable / unbuilt)
    if (adjustments.openSpaceIncrease > 0) {
        const reduction = (adjustments.openSpaceIncrease / 10) * 2.5;
        estimatedScore -= reduction;
        assumptions.push(`Provisional assumption: Converting 10% of built-up area to open/permeable space reduces risk by 2.5 points.`);
        contributingInterventions.push("Reflective/Permeable Surfaces");
    }

    estimatedScore = Math.max(0, Math.min(100, Math.round(estimatedScore)));
    
    if (contributingInterventions.length === 0) {
        assumptions.push("No interventions applied.");
    }

    return {
        currentScore: Math.round(currentRiskScore),
        estimatedScore,
        scoreChange: Math.round(currentRiskScore) - estimatedScore,
        assumptions,
        contributingInterventions
    };
}
