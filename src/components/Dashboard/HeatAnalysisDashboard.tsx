import { useState } from "react";
import {
  Thermometer,
  Leaf,
  Building2,
  Flame,
  AlertTriangle,
  Lightbulb,
  Activity,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  FileText,
  Sliders,
  CheckCircle2,
  Crosshair,
  TrendingDown,
  Info,
} from "lucide-react";
import type { HeatAnalysisResponse, InterventionResponse, ScenarioAdjustments, ScenarioResponse } from "../../types/api";
import type { SelectionInfo } from "../../types/gis";

interface HeatAnalysisDashboardProps {
  analysis: HeatAnalysisResponse | null;
  interventions: InterventionResponse | null;
  scenarioResult: ScenarioResponse | null;
  scenarioAdjustments: ScenarioAdjustments;
  onScenarioChange: (adjustments: ScenarioAdjustments) => void;
  loading: boolean;
  selection: SelectionInfo | null;
  onAutoExpand?: () => void;
  onOpenMethodology: () => void;
}

export default function HeatAnalysisDashboard({
  analysis,
  interventions,
  scenarioResult,
  scenarioAdjustments,
  onScenarioChange,
  loading,
  selection,
  onAutoExpand,
  onOpenMethodology,
}: HeatAnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "explanation" | "exposure" | "hotspots" | "interventions" | "simulator"
  >("overview");
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false);

  if (loading) {
    return (
      <aside className="urbancool-sidebar loading-state">
        <div className="sidebar-loading-spinner" />
        <div className="sidebar-loading-text">
          <h3>Retrieving Satellite Environmental Data</h3>
          <p>Processing Landsat Collection 2 LST &amp; Sentinel-2 NDVI...</p>
        </div>
      </aside>
    );
  }

  // When area is drawn but violates minimum area threshold
  if (selection?.geometry && !selection.isValidArea && selection.areaKm2 > 0) {
    return (
      <aside className="urbancool-sidebar restriction-state">
        <div className="restriction-header">
          <AlertTriangle size={24} className="text-warning" />
          <h3>Area Restriction: Selection Too Small</h3>
        </div>
        <div className="restriction-body">
          <p>
            The selected area is <strong>{selection.areaKm2} km²</strong> ({selection.areaHectares} ha).
          </p>
          <p className="restriction-reason">
            Urban heat island and satellite thermal modeling requires a minimum contiguous neighborhood block of{" "}
            <strong>{selection.minAreaRequiredKm2} km²</strong> ({(selection.minAreaRequiredKm2 * 100).toFixed(0)} ha) for defensible statistical accuracy.
          </p>
          {onAutoExpand && (
            <button type="button" className="auto-expand-btn" onClick={onAutoExpand}>
              <Maximize2 size={16} />
              <span>Auto-Expand to {selection.minAreaRequiredKm2} km²</span>
            </button>
          )}
        </div>
      </aside>
    );
  }

  if (!analysis) {
    return (
      <aside className="urbancool-sidebar empty-state">
        <div className="empty-content">
          <div className="empty-icon-ring">
            <Crosshair size={32} className="text-sky" />
          </div>
          <h3>Select an Urban Area</h3>
          <p>
            Use the draw tools on the left toolbar to outline an urban neighborhood, district, or corridor for GIS heat analysis.
          </p>
          <div className="empty-steps">
            <div className="step-item">
              <span className="step-num">1</span>
              <span>Draw Polygon or Rectangle</span>
            </div>
            <div className="step-item">
              <span className="step-num">2</span>
              <span>Retrieve Landsat LST &amp; NDVI Data</span>
            </div>
            <div className="step-item">
              <span className="step-num">3</span>
              <span>Detect Hotspots &amp; Plan Interventions</span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const { lst, ndvi, landCover, referenceTemperature, relativeDifference, exposureIndex, hotspots, dataConfidence, explanations } = analysis;

  return (
    <aside className="urbancool-sidebar">
      {/* Dashboard Top Header */}
      <div className="dashboard-header">
        <div className="header-meta-row">
          <span className="dashboard-label">Urban Heat Analysis</span>
          <div className="confidence-badge-wrapper">
            <button
              type="button"
              className={`confidence-pill confidence-${dataConfidence.level.toLowerCase()}`}
              onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}
              title="Click to view scientific data confidence audit"
            >
              <ShieldCheck size={13} />
              <span>Confidence: {dataConfidence.level}</span>
            </button>
          </div>
        </div>

        <div className="header-stat-row">
          <div className="primary-stat-col">
            <span className="stat-sub">Analysis Area</span>
            <span className="stat-headline">{analysis.areaKm2} <span className="stat-unit">km²</span></span>
            <span className="stat-detail">({analysis.areaHectares} hectares)</span>
          </div>
          <div className="primary-stat-col text-right">
            <span className="stat-sub">Relative Thermal Anomaly</span>
            <span className={`stat-headline ${relativeDifference >= 0 ? "text-rose" : "text-sky"}`}>
              {relativeDifference >= 0 ? `+${relativeDifference}` : relativeDifference}°C
            </span>
            <span className="stat-detail">vs Reference Buffer ({referenceTemperature}°C)</span>
          </div>
        </div>

        {/* Expandable Confidence Audit Card */}
        {showConfidenceDetails && (
          <div className="confidence-audit-card">
            <div className="audit-header">
              <span className="audit-title">Data Confidence Assessment</span>
              <button type="button" className="audit-close" onClick={() => setShowConfidenceDetails(false)}>×</button>
            </div>
            <div className="audit-items">
              {dataConfidence.reasons.map((r, i) => (
                <div key={i} className="audit-item">
                  <CheckCircle2 size={13} className="text-emerald" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
            <div className="audit-meta">
              <span>LST: {dataConfidence.lstObservationDate}</span>
              <span>NDVI: {dataConfidence.ndviObservationDate}</span>
              <span>Cloud: {dataConfidence.cloudCoverPercent}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <nav className="dashboard-tabs-nav" aria-label="Analysis Tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <Thermometer size={14} />
          <span>Heat &amp; LST</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "explanation" ? "active" : ""}`}
          onClick={() => setActiveTab("explanation")}
        >
          <AlertTriangle size={14} />
          <span>Why Hot?</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "exposure" ? "active" : ""}`}
          onClick={() => setActiveTab("exposure")}
        >
          <Activity size={14} />
          <span>Exposure Index</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "hotspots" ? "active" : ""}`}
          onClick={() => setActiveTab("hotspots")}
        >
          <Flame size={14} />
          <span>Hotspots ({hotspots.length})</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "interventions" ? "active" : ""}`}
          onClick={() => setActiveTab("interventions")}
        >
          <Lightbulb size={14} />
          <span>Interventions</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "simulator" ? "active" : ""}`}
          onClick={() => setActiveTab("simulator")}
        >
          <Sliders size={14} />
          <span>Simulator</span>
        </button>
      </nav>

      {/* Tab Panels */}
      <div className="dashboard-content-scroll">
        {/* TAB 1: OVERVIEW & HEAT */}
        {activeTab === "overview" && (
          <div className="tab-pane active">
            {/* LST Metrics Card */}
            <div className="dashboard-card">
              <div className="card-title-row">
                <div className="card-title-left">
                  <Thermometer size={16} className="text-rose" />
                  <h4>Land Surface Temperature (LST)</h4>
                </div>
                <span className="card-badge-pill">Landsat Level-2</span>
              </div>
              <p className="card-scientific-note">
                Radiometric surface skin temperature (roofs, roads, ground), not 2m air temperature.
              </p>

              <div className="metrics-triad">
                <div className="triad-item">
                  <span className="triad-label">Mean LST</span>
                  <span className="triad-val text-rose">{lst.mean}°C</span>
                </div>
                <div className="triad-item">
                  <span className="triad-label">Max LST</span>
                  <span className="triad-val text-red">{lst.max}°C</span>
                </div>
                <div className="triad-item">
                  <span className="triad-label">Min LST</span>
                  <span className="triad-val text-sky">{lst.min}°C</span>
                </div>
                <div className="triad-item">
                  <span className="triad-label">Median LST</span>
                  <span className="triad-val">{lst.median}°C</span>
                </div>
              </div>

              {/* Reference Baseline Box */}
              <div className="reference-comparison-box">
                <div className="comp-row">
                  <span>Selected Area Mean LST:</span>
                  <strong>{lst.mean}°C</strong>
                </div>
                <div className="comp-row">
                  <span>Surrounding Reference LST:</span>
                  <strong>{referenceTemperature}°C</strong>
                </div>
                <div className="comp-row comp-delta">
                  <span>Thermal Difference:</span>
                  <strong className={relativeDifference >= 0 ? "text-rose" : "text-sky"}>
                    {relativeDifference >= 0 ? `+${relativeDifference}` : relativeDifference}°C
                  </strong>
                </div>
              </div>
            </div>

            {/* NDVI Vegetation Card */}
            <div className="dashboard-card">
              <div className="card-title-row">
                <div className="card-title-left">
                  <Leaf size={16} className="text-emerald" />
                  <h4>Vegetation Analysis (NDVI)</h4>
                </div>
                <span className="card-badge-pill">Sentinel-2 MSI</span>
              </div>
              <p className="card-scientific-note">
                Normalized Difference Vegetation Index indicating relative green photosynthetic biomass.
              </p>

              <div className="metrics-triad">
                <div className="triad-item">
                  <span className="triad-label">Mean NDVI</span>
                  <span className={`triad-val ${ndvi.mean < 0.20 ? "text-amber" : "text-emerald"}`}>
                    {ndvi.mean}
                  </span>
                </div>
                <div className="triad-item">
                  <span className="triad-label">NDVI Range</span>
                  <span className="triad-val">{ndvi.min} – {ndvi.max}</span>
                </div>
                <div className="triad-item">
                  <span className="triad-label">Canopy Coverage</span>
                  <span className="triad-val">{landCover.vegetation}%</span>
                </div>
                <div className="triad-item">
                  <span className="triad-label">Canopy Status</span>
                  <span className="triad-val">{ndvi.mean < 0.20 ? "Deficient" : "Moderate"}</span>
                </div>
              </div>
            </div>

            {/* Land Cover Breakdown */}
            <div className="dashboard-card">
              <div className="card-title-row">
                <div className="card-title-left">
                  <Building2 size={16} className="text-sky" />
                  <h4>Land Cover Proportions</h4>
                </div>
              </div>
              <div className="stacked-bar">
                <div className="bar-segment seg-built" style={{ width: `${landCover.builtup}%` }} title={`Built-up: ${landCover.builtup}%`} />
                <div className="bar-segment seg-veg" style={{ width: `${landCover.vegetation}%` }} title={`Vegetation: ${landCover.vegetation}%`} />
                <div className="bar-segment seg-water" style={{ width: `${landCover.water}%` }} title={`Water: ${landCover.water}%`} />
                <div className="bar-segment seg-bare" style={{ width: `${landCover.bareLand}%` }} title={`Bare / Paved: ${landCover.bareLand}%`} />
              </div>
              <div className="legend-pills-row">
                <span className="pill-dot dot-built">Built-up: {landCover.builtup}%</span>
                <span className="pill-dot dot-veg">Vegetation: {landCover.vegetation}%</span>
                <span className="pill-dot dot-water">Water: {landCover.water}%</span>
                <span className="pill-dot dot-bare">Bare/Paved: {landCover.bareLand}%</span>
              </div>
            </div>

            {/* Temperature Distribution Histogram */}
            {analysis.temperatureDistribution && (
              <div className="dashboard-card">
                <h4>Spatial Temperature Distribution</h4>
                <div className="histogram-bars">
                  {Object.entries(analysis.temperatureDistribution).map(([bin, count]) => (
                    <div key={bin} className="histogram-col">
                      <div className="bar-fill" style={{ height: `${Math.min(100, count * 12 + 8)}px` }}>
                        <span className="col-val">{count}</span>
                      </div>
                      <span className="col-label">{bin}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WHY THIS AREA IS HOT */}
        {activeTab === "explanation" && (
          <div className="tab-pane active">
            <div className="dashboard-card">
              <div className="card-title-row">
                <div className="card-title-left">
                  <AlertTriangle size={18} className="text-amber" />
                  <h4>Why This Area Shows Higher Heat Exposure</h4>
                </div>
              </div>
              <p className="card-scientific-note">
                Dynamically synthesized from observed satellite Land Surface Temperature, NDVI biomass, and impervious land cover fractions.
              </p>

              <div className="explanations-list">
                {explanations.map((exp, idx) => (
                  <div key={idx} className="explanation-bullet-item">
                    <span className="bullet-num">{idx + 1}</span>
                    <p>{exp}</p>
                  </div>
                ))}
              </div>

              <div className="synthesis-box">
                <strong>Scientific Analytical Summary:</strong>
                <p>
                  The thermal anomaly of +{relativeDifference}°C over regional reference surroundings is driven by high impervious roof and pavement coverage ({landCover.builtup}%) combined with vegetative canopy deficiency (NDVI {ndvi.mean}).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROTOTYPE URBAN HEAT EXPOSURE INDEX */}
        {activeTab === "exposure" && (
          <div className="tab-pane active">
            <div className="dashboard-card">
              <div className="card-title-row">
                <div className="card-title-left">
                  <Activity size={18} className="text-sky" />
                  <h4>{exposureIndex.label}</h4>
                </div>
                <span className={`category-tag tag-${exposureIndex.category.toLowerCase()}`}>
                  {exposureIndex.category}
                </span>
              </div>

              <div className="exposure-gauge-card">
                <div className="gauge-score-display">
                  <span className="gauge-score-num">{exposureIndex.score}</span>
                  <span className="gauge-score-max">/ 100</span>
                </div>
                <span className="gauge-category-label">{exposureIndex.category} Exposure Level</span>
              </div>

              <div className="index-components-card">
                <h5>Transparent Indicator Breakdown:</h5>
                <div className="component-row">
                  <div className="comp-info">
                    <span className="comp-name">Relative LST Thermal Anomaly</span>
                    <span className="comp-weight">(40% Weight)</span>
                  </div>
                  <span className="comp-val">{exposureIndex.components.relativeLstAnomaly ?? 65} / 100</span>
                </div>
                <div className="component-row">
                  <div className="comp-info">
                    <span className="comp-name">Vegetation Deficiency Index</span>
                    <span className="comp-weight">(35% Weight)</span>
                  </div>
                  <span className="comp-val">{exposureIndex.components.vegetationDeficiency ?? 70} / 100</span>
                </div>
                <div className="component-row">
                  <div className="comp-info">
                    <span className="comp-name">Built-up Impervious Density</span>
                    <span className="comp-weight">(25% Weight)</span>
                  </div>
                  <span className="comp-val">{exposureIndex.components.builtupDensity ?? 65} / 100</span>
                </div>
              </div>

              <div className="index-disclaimer-box">
                <Info size={14} className="text-sky inline-icon" />
                <span>
                  <strong>Scientific Notice:</strong> This index is a relative analytical indicator of thermal and environmental exposure. It is NOT a medically validated clinical health-risk score.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SPATIAL HOTSPOT ZONES */}
        {activeTab === "hotspots" && (
          <div className="tab-pane active">
            <div className="dashboard-card">
              <div className="card-title-row">
                <div className="card-title-left">
                  <Flame size={18} className="text-rose" />
                  <h4>Detected Spatial Hotspots ({hotspots.length})</h4>
                </div>
              </div>
              <p className="card-scientific-note">
                Localized raster clusters where Land Surface Temperature exceeds surrounding thresholds. Displayed directly on MapLibre.
              </p>

              <div className="hotspots-list">
                {hotspots.map((hs) => (
                  <div key={hs.id} className={`hotspot-card-item hs-type-${hs.category.toLowerCase()}`}>
                    <div className="hs-header">
                      <div className="hs-title-group">
                        <span className={`hs-dot dot-${hs.category.toLowerCase()}`} />
                        <span className="hs-name">{hs.name}</span>
                      </div>
                      <span className="hs-cat-badge">{hs.category}</span>
                    </div>

                    <div className="hs-stats-grid">
                      <div className="hs-stat">
                        <span className="stat-label">Mean LST</span>
                        <span className="stat-val">{hs.meanLst}°C</span>
                      </div>
                      <div className="hs-stat">
                        <span className="stat-label">Max LST</span>
                        <span className="stat-val text-red">{hs.maxLst}°C</span>
                      </div>
                      <div className="hs-stat">
                        <span className="stat-label">Anomaly</span>
                        <span className="stat-val text-rose">+{hs.relativeDiff}°C</span>
                      </div>
                      <div className="hs-stat">
                        <span className="stat-label">Area</span>
                        <span className="stat-val">{hs.areaKm2} km²</span>
                      </div>
                    </div>

                    <div className="hs-driver">
                      <strong>Contributing Factor:</strong> {hs.primaryFactor}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: INTERVENTION PLANNER */}
        {activeTab === "interventions" && (
          <div className="tab-pane active">
            <div className="dashboard-card">
              <div className="card-title-row">
                <div className="card-title-left">
                  <Lightbulb size={18} className="text-amber" />
                  <h4>Intervention Suitability &amp; Priority</h4>
                </div>
              </div>
              <p className="card-scientific-note">
                Evidence-based spatial cooling recommendations. No guaranteed cooling numbers are claimed without detailed site engineering.
              </p>

              <div className="recommendations-container">
                {interventions?.recommendations.map((rec, index) => (
                  <div key={rec.id} className="rec-card">
                    <div className="rec-card-header">
                      <div className="rec-title-wrap">
                        <span className="rec-rank-num">#{index + 1}</span>
                        <div>
                          <h5 className="rec-title">{rec.name}</h5>
                          <span className="rec-cost-pill">Cost: {rec.costCategory}</span>
                        </div>
                      </div>
                      <div className="rec-badges">
                        <span className={`priority-pill p-${rec.priority.toLowerCase()}`}>
                          {rec.priority} Priority
                        </span>
                        <span className="suitability-pill">
                          Suitability: {rec.suitabilityLevel} ({rec.suitabilityScore}/100)
                        </span>
                      </div>
                    </div>

                    <div className="rec-card-body">
                      <div className="rec-detail-block">
                        <strong className="block-label text-emerald">Evidence-based Reasons:</strong>
                        <ul className="rec-reasons-list">
                          {rec.reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rec-detail-block">
                        <strong className="block-label text-amber">Constraints &amp; Feasibility:</strong>
                        <ul className="rec-constraints-list">
                          {rec.constraints.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="rec-impact-note">
                        <strong>Expected Impact:</strong> {rec.expectedImpactDirection}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: WHAT-IF SCENARIO SIMULATOR */}
        {activeTab === "simulator" && (
          <div className="tab-pane active">
            <div className="dashboard-card">
              <div className="card-title-row">
                <div className="card-title-left">
                  <Sliders size={18} className="text-sky" />
                  <h4>What-If Scenario Simulator</h4>
                </div>
                <span className="card-badge-pill">Scenario estimate</span>
              </div>
              <p className="card-scientific-note">
                Test hypothetical urban adaptations and evaluate potential reductions in the Prototype Urban Heat Exposure Index.
              </p>

              <div className="simulator-controls-group">
                {/* 1. Vegetation */}
                <div className="sim-control-item">
                  <div className="control-label-row">
                    <span>Increase Vegetative Canopy</span>
                    <strong className="control-val text-emerald">+{scenarioAdjustments.vegetationIncrease}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={scenarioAdjustments.vegetationIncrease}
                    onChange={(e) =>
                      onScenarioChange({
                        ...scenarioAdjustments,
                        vegetationIncrease: Number(e.target.value),
                      })
                    }
                  />
                </div>

                {/* 2. Cool Roofs */}
                <div className="sim-control-item">
                  <div className="control-label-row">
                    <span>Cool Roof Retrofit Adoption</span>
                    <strong className="control-val text-sky">+{scenarioAdjustments.coolRoofAdoption}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={scenarioAdjustments.coolRoofAdoption}
                    onChange={(e) =>
                      onScenarioChange({
                        ...scenarioAdjustments,
                        coolRoofAdoption: Number(e.target.value),
                      })
                    }
                  />
                </div>

                {/* 3. Pedestrian Shade */}
                <div className="sim-control-item">
                  <div className="control-label-row">
                    <span>Add Shaded Pedestrian Canopies</span>
                    <strong className="control-val text-amber">+{scenarioAdjustments.pedestrianShadeIncrease}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={scenarioAdjustments.pedestrianShadeIncrease}
                    onChange={(e) =>
                      onScenarioChange({
                        ...scenarioAdjustments,
                        pedestrianShadeIncrease: Number(e.target.value),
                      })
                    }
                  />
                </div>

                {/* 4. Permeable Ground */}
                <div className="sim-control-item">
                  <div className="control-label-row">
                    <span>Permeable / Reflective Pavements</span>
                    <strong className="control-val text-violet">+{scenarioAdjustments.permeableSurfacesIncrease}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={scenarioAdjustments.permeableSurfacesIncrease}
                    onChange={(e) =>
                      onScenarioChange({
                        ...scenarioAdjustments,
                        permeableSurfacesIncrease: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Scenario Results Comparison Box */}
              {scenarioResult && (
                <div className="scenario-comparison-card">
                  <div className="sim-comparison-grid">
                    <div className="sim-metric-box">
                      <span className="box-label">Current Index</span>
                      <span className="box-val">{scenarioResult.currentExposureIndex}</span>
                      <span className="box-cat">{scenarioResult.currentCategory}</span>
                    </div>

                    <div className="sim-metric-arrow">
                      <TrendingDown size={20} className="text-emerald" />
                    </div>

                    <div className="sim-metric-box result-box">
                      <span className="box-label">Estimated Index</span>
                      <span className="box-val text-emerald">{scenarioResult.estimatedExposureIndex}</span>
                      <span className="box-cat">{scenarioResult.estimatedCategory}</span>
                    </div>

                    <div className="sim-diff-box">
                      <span className="box-label">Difference</span>
                      <span className="diff-number">-{scenarioResult.difference} pts</span>
                    </div>
                  </div>

                  {/* Assumptions */}
                  <div className="sim-assumptions-block">
                    <h6>Modeled Assumptions:</h6>
                    <ul>
                      {scenarioResult.assumptions.map((ass, i) => (
                        <li key={i}>{ass}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  <div className="sim-limitations-block">
                    <h6>Scientific Limitations:</h6>
                    <ul>
                      {scenarioResult.limitations.map((lim, i) => (
                        <li key={i}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Methodology Trigger */}
      <div className="dashboard-footer">
        <button type="button" className="footer-methodology-btn" onClick={onOpenMethodology}>
          <FileText size={14} />
          <span>Scientific Methodology &amp; Limitations</span>
          <ChevronRight size={14} className="ml-auto" />
        </button>
      </div>
    </aside>
  );
}
