import type { EnvironmentalMetrics } from "../types/api";
import type { InterventionOption, Priority } from "../types/intervention";

function getPriority(score: number): Priority {
    if (score >= 80) return "Critical";
    if (score >= 60) return "High";
    if (score >= 40) return "Medium";
    return "Low";
}

export function recommendInterventions(metrics: EnvironmentalMetrics): InterventionOption[] {
    const options: InterventionOption[] = [];

    // Cool roofs
    let coolRoofSuitability = 0;
    if (metrics.builtup_percentage > 50) {
        coolRoofSuitability = 50 + (metrics.builtup_percentage - 50) * 1.5;
    }
    if (metrics.temperature > 35) coolRoofSuitability += 10;
    coolRoofSuitability = Math.min(100, Math.round(coolRoofSuitability));

    options.push({
        id: "cool_roofs",
        name: "Cool Roofs",
        priority: getPriority(coolRoofSuitability),
        suitabilityScore: coolRoofSuitability,
        whyRecommended: `Extensive built-up surface (${metrics.builtup_percentage.toFixed(0)}%) makes cool roofs highly effective for reducing indoor and urban temperatures.`,
        requiredConditions: "Available flat or low-slope roof surfaces without extensive shading.",
        limitations: "Effectiveness depends on building height and roof-to-volume ratio.",
        costCategory: "Medium",
        expectedImpactDirection: "High reduction in building cooling load.",
        feasibilityConstraints: "Requires building owner consent and structurally sound roofs."
    });

    // Tree and green corridors
    let greenCorridorSuitability = 100 - metrics.green_coverage;
    if (metrics.builtup_percentage > 85) {
        greenCorridorSuitability -= 30; // Very high built up makes it hard
    } else if (metrics.builtup_percentage < 60) {
        greenCorridorSuitability += 20; // Plenty of space
    }
    greenCorridorSuitability = Math.max(0, Math.min(100, Math.round(greenCorridorSuitability)));

    options.push({
        id: "green_corridors",
        name: "Tree and Green Corridors",
        priority: getPriority(greenCorridorSuitability),
        suitabilityScore: greenCorridorSuitability,
        whyRecommended: `Low vegetation coverage (${metrics.green_coverage.toFixed(0)}%) indicates a strong need for canopy cover to reduce surface temperatures.`,
        requiredConditions: "Continuous available space alongside roads or pathways. Adequate soil volume and water access.",
        limitations: "Takes years to mature. Maintenance and water required.",
        costCategory: "Medium",
        expectedImpactDirection: "Significant reduction in local ambient temperature and improved shading.",
        feasibilityConstraints: "Space limitations and underground utilities."
    });

    // Pocket parks
    let pocketParkSuitability = 0;
    const openSpaceEstimate = 100 - metrics.builtup_percentage - metrics.green_coverage - metrics.water_body_fraction;
    if (openSpaceEstimate > 10) {
        pocketParkSuitability = 60 + openSpaceEstimate * 2;
    } else {
        pocketParkSuitability = openSpaceEstimate * 3;
    }
    pocketParkSuitability = Math.max(0, Math.min(100, Math.round(pocketParkSuitability)));

    options.push({
        id: "pocket_parks",
        name: "Pocket Parks",
        priority: getPriority(pocketParkSuitability),
        suitabilityScore: pocketParkSuitability,
        whyRecommended: `Estimated available open space (${openSpaceEstimate.toFixed(0)}%) can be converted into localized cooling oases.`,
        requiredConditions: "Vacant lots or underutilized paved areas.",
        limitations: "Requires community engagement and ongoing maintenance.",
        costCategory: "High",
        expectedImpactDirection: "Creates localized cool spots and improves well-being.",
        feasibilityConstraints: "Land acquisition costs and ownership issues."
    });

    // Shaded pedestrian corridors
    let shadedCorridorsSuitability = metrics.temperature > 30 && metrics.builtup_percentage > 40 ? 80 : 40;
    if (metrics.green_coverage < 20) shadedCorridorsSuitability += 15;
    shadedCorridorsSuitability = Math.max(0, Math.min(100, Math.round(shadedCorridorsSuitability)));

    options.push({
        id: "shaded_corridors",
        name: "Shaded Pedestrian Corridors",
        priority: getPriority(shadedCorridorsSuitability),
        suitabilityScore: shadedCorridorsSuitability,
        whyRecommended: `High temperatures and low vegetation expose pedestrians to severe heat stress.`,
        requiredConditions: "High pedestrian foot traffic and sufficient sidewalk width.",
        limitations: "Structural shading can be expensive and visually intrusive if not designed well.",
        costCategory: "High",
        expectedImpactDirection: "Immediate improvement in thermal comfort for pedestrians.",
        feasibilityConstraints: "Street width, existing infrastructure, and permits."
    });

    // Reflective or permeable surfaces
    let reflectiveSurfacesSuitability = metrics.builtup_percentage > 60 ? 75 : 30;
    reflectiveSurfacesSuitability = Math.max(0, Math.min(100, Math.round(reflectiveSurfacesSuitability)));

    options.push({
        id: "reflective_surfaces",
        name: "Reflective/Permeable Surfaces",
        priority: getPriority(reflectiveSurfacesSuitability),
        suitabilityScore: reflectiveSurfacesSuitability,
        whyRecommended: `High built-up area (${metrics.builtup_percentage.toFixed(0)}%) contributes heavily to urban heat island effect via heat absorption.`,
        requiredConditions: "Large paved areas, parking lots, or wide streets.",
        limitations: "Can cause glare. Permeable surfaces may clog without maintenance.",
        costCategory: "Low",
        expectedImpactDirection: "Reduces surface temperature and stormwater runoff.",
        feasibilityConstraints: "Durability under heavy traffic loads."
    });

    // Sort by suitability score descending
    options.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    return options;
}
