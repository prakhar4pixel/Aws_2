import type { FeatureCollection } from "geojson";

// ── Scientific Satellite LST & NDVI Models ───────────────────────

export interface LSTStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  unit: string;
  dataSource: string;
  observationDate: string;
  meaning: string;
}

export interface NDVIStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  dataSource: string;
  observationDate: string;
  meaning: string;
}

export interface LandCoverProportions {
  builtup: number;
  vegetation: number;
  water: number;
  bareLand: number;
}

export interface HotspotZone {
  id: string;
  name: string;
  category: "Severe" | "Elevated" | "Moderate" | "Cool/Vegetated" | string;
  meanLst: number;
  maxLst: number;
  relativeDiff: number;
  areaKm2: number;
  primaryFactor: string;
  center: [number, number];
  geometry?: any;
}

export interface HeatExposureIndex {
  score: number;
  label: string;
  category: "Low" | "Moderate" | "High" | "Critical";
  components: {
    relativeLstAnomaly: number;
    vegetationDeficiency: number;
    builtupDensity: number;
    [key: string]: number;
  };
  description: string;
}

export interface DataConfidenceInfo {
  level: "HIGH" | "MODERATE" | "LOW";
  score: number;
  satelliteProduct: string;
  spatialResolution: string;
  cloudCoverPercent: number;
  dataAgeDays: number;
  reasons: string[];
  lstObservationDate: string;
  ndviObservationDate: string;
}

export interface HeatAnalysisResponse {
  areaKm2: number;
  areaHectares: number;
  lst: LSTStats;
  ndvi: NDVIStats;
  landCover: LandCoverProportions;
  referenceTemperature: number;
  relativeDifference: number;
  exposureIndex: HeatExposureIndex;
  hotspots: HotspotZone[];
  dataConfidence: DataConfidenceInfo;
  explanations: string[];
  temperatureDistribution: Record<string, number>;
  gridGeoJson: FeatureCollection;
}

// ── Interventions ───────────────────────────────────────────────

export interface InterventionSuitability {
  id: string;
  name: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  suitabilityScore: number;
  suitabilityLevel: "HIGH" | "MODERATE" | "LOW";
  reasons: string[];
  constraints: string[];
  expectedImpactDirection: string;
  costCategory: string;
}

export interface InterventionResponse {
  recommendations: InterventionSuitability[];
  interventionZonesGeoJson: FeatureCollection;
  disclaimer: string;
}

// ── Scenario Simulator ──────────────────────────────────────────

export interface ScenarioAdjustments {
  vegetationIncrease: number;
  coolRoofAdoption: number;
  pedestrianShadeIncrease: number;
  permeableSurfacesIncrease: number;
}

export interface ScenarioResponse {
  currentExposureIndex: number;
  estimatedExposureIndex: number;
  difference: number;
  currentCategory: string;
  estimatedCategory: string;
  label: string;
  assumptions: string[];
  limitations: string[];
}

// ── Legacy Compatibility ────────────────────────────────────────

export interface EnvironmentalMetrics {
  temperature: number;
  pm25: number;
  ndvi: number;
  builtup_percentage: number;
  green_coverage: number;
  water_body_fraction: number;
}

export interface RiskBreakdown {
  heat: number;
  air_pollution: number;
  vegetation_deficiency: number;
  builtup_density: number;
}

export type RiskCategory = "Low" | "Moderate" | "High" | "Critical";

export interface AreaAnalyzeResponse {
  area_km2: number;
  area_hectares: number;
  metrics: EnvironmentalMetrics;
  data_source: string;
}

export interface RiskCalculateResponse {
  area_km2: number;
  area_hectares: number;
  metrics: EnvironmentalMetrics;
  risk_breakdown: RiskBreakdown;
  climate_risk: number;
  risk_category: RiskCategory;
  weights: Record<string, number>;
}

// ── Amazon SNS Heat Alert Models ─────────────────────────────────

export interface HeatAlertPublishRequest {
  zoneName: string;
  areaKm2: number;
  meanLst: number;
  maxLst: number;
  relativeDiff: number;
  exposureCategory: "Low" | "Moderate" | "High" | "Critical" | string;
  hotspotCount: number;
  city?: string;
  recipientEmail?: string;
  immediateActions?: string[];
}

export interface HeatAlertPublishResponse {
  success: boolean;
  messageId: string;
  topicArn: string;
  subject: string;
  alertSeverity: "CRITICAL" | "HIGH" | "ADVISORY" | string;
  timestamp: string;
  simulated: boolean;
  statusMessage: string;
  details: {
    messageId?: string;
    region?: string;
    topic?: string;
    recipients?: string;
    deliveryProtocol?: string;
    messageBodyPreview?: string;
    [key: string]: any;
  };
}
