export type Priority = "Critical" | "High" | "Medium" | "Low";

export interface InterventionOption {
    id: string;
    name: string;
    priority: Priority;
    suitabilityScore: number;
    whyRecommended: string;
    requiredConditions: string;
    limitations: string;
    costCategory: "Low" | "Medium" | "High";
    expectedImpactDirection: string;
    feasibilityConstraints: string;
}

export interface ScenarioResult {
    currentScore: number;
    estimatedScore: number;
    scoreChange: number;
    assumptions: string[];
    contributingInterventions: string[];
}
