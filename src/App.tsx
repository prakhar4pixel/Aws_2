import { useState, useCallback } from "react";
import ClimateMap from "./components/Map/ClimateMap";
import AreaInfoBadge from "./components/Controls/AreaInfoBadge";
import DrawToolbar from "./components/Controls/DrawToolbar";
import Navbar from "./components/Navigation/Navbar";
import HeatAnalysisDashboard from "./components/Dashboard/HeatAnalysisDashboard";
import MethodologyModal from "./components/Methodology/MethodologyModal";
import type { SelectionInfo } from "./types/gis";
import type {
  HeatAnalysisResponse,
  InterventionResponse,
  ScenarioAdjustments,
  ScenarioResponse,
} from "./types/api";
import {
  fetchHeatAnalysis,
  fetchInterventions,
  simulateScenario,
} from "./services/api";
import {
  calculateAreaMetrics,
  expandPolygonToMinArea,
  DEFAULT_MIN_AREA_KM2,
} from "./utils/geo";
import type { LayerVisibilityState } from "./components/Map/LayerControls";

function App() {
  const [initialCenter, setInitialCenter] = useState<[number, number] | null>(null);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [drawMode, setDrawMode] = useState<
    "polygon" | "rectangle" | "freehand" | "delete" | "simple_select"
  >("simple_select");

  const [analysis, setAnalysis] = useState<HeatAnalysisResponse | null>(null);
  const [interventions, setInterventions] = useState<InterventionResponse | null>(null);
  const [scenarioAdjustments, setScenarioAdjustments] = useState<ScenarioAdjustments>({
    vegetationIncrease: 0,
    coolRoofAdoption: 0,
    pedestrianShadeIncrease: 0,
    permeableSurfacesIncrease: 0,
  });
  const [scenarioResult, setScenarioResult] = useState<ScenarioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [minAreaKm2, setMinAreaKm2] = useState<number>(DEFAULT_MIN_AREA_KM2);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  const [layers, setLayers] = useState<LayerVisibilityState>({
    showSelection: true,
    showLST: true,
    showHotspots: true,
    showNDVI: false,
    showLandCover: false,
    showInterventions: true,
  });

  const runAnalysis = useCallback(
    async (
      geometry: NonNullable<SelectionInfo["geometry"]>,
      adjustments: ScenarioAdjustments = scenarioAdjustments
    ) => {
      setLoading(true);
      try {
        const [heatRes, intRes, scenRes] = await Promise.all([
          fetchHeatAnalysis(geometry),
          fetchInterventions(geometry),
          simulateScenario(geometry, adjustments),
        ]);

        setAnalysis(heatRes);
        setInterventions(intRes);
        setScenarioResult(scenRes);
      } catch (err) {
        console.error("UrbanCool analysis error:", err);
      } finally {
        setLoading(false);
      }
    },
    [scenarioAdjustments]
  );

  const handleSelectionChange = useCallback(
    (newSelection: SelectionInfo | null) => {
      setSelection(newSelection);

      if (!newSelection?.geometry || !newSelection.isValidArea) {
        setAnalysis(null);
        setInterventions(null);
        setScenarioResult(null);
        return;
      }

      runAnalysis(newSelection.geometry);
    },
    [runAnalysis]
  );

  const handleScenarioChange = useCallback(
    async (newAdjustments: ScenarioAdjustments) => {
      setScenarioAdjustments(newAdjustments);
      if (selection?.geometry && selection.isValidArea) {
        try {
          const res = await simulateScenario(selection.geometry, newAdjustments);
          setScenarioResult(res);
        } catch (err) {
          console.error("Scenario simulation error:", err);
        }
      }
    },
    [selection]
  );

  const handleAutoExpand = useCallback(() => {
    if (!selection?.geometry) return;

    const expandedFeature = expandPolygonToMinArea(selection.geometry, minAreaKm2);
    const metrics = calculateAreaMetrics(expandedFeature, minAreaKm2);

    const updatedSelection: SelectionInfo = {
      geometry: expandedFeature,
      areaKm2: metrics.areaKm2,
      areaHectares: metrics.areaHectares,
      isValidArea: metrics.isValidArea,
      minAreaRequiredKm2: minAreaKm2,
    };

    setSelection(updatedSelection);
    if (updatedSelection.isValidArea && updatedSelection.geometry) {
      runAnalysis(updatedSelection.geometry);
    }
  }, [selection, minAreaKm2, runAnalysis]);

  const handleMinAreaChange = useCallback(
    (newMinArea: number) => {
      setMinAreaKm2(newMinArea);
      if (selection?.geometry) {
        const metrics = calculateAreaMetrics(selection.geometry, newMinArea);
        const updatedSelection: SelectionInfo = {
          ...selection,
          isValidArea: metrics.isValidArea,
          minAreaRequiredKm2: newMinArea,
          restrictionReason: metrics.restrictionReason,
        };
        setSelection(updatedSelection);

        if (metrics.isValidArea) {
          runAnalysis(selection.geometry);
        } else {
          setAnalysis(null);
          setInterventions(null);
          setScenarioResult(null);
        }
      }
    },
    [selection, runAnalysis]
  );

  const handleClear = () => {
    setDrawMode("delete");
    setAnalysis(null);
    setInterventions(null);
    setScenarioResult(null);
    setSelection(null);
  };

  const handleLocationSelect = (lng: number, lat: number) => {
    setInitialCenter([lng, lat]);
  };

  const isSelectionTooSmall = Boolean(
    selection?.geometry && !selection.isValidArea && selection.areaKm2 > 0
  );

  return (
    <main className="app urbancool-app">
      {/* Top Navigation */}
      <Navbar
        onLocationSelect={handleLocationSelect}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onClearSelection={handleClear}
        hasSelection={Boolean(selection && selection.areaKm2 > 0)}
      />

      {/* Main Map & Workspace */}
      <div className="urbancool-workspace">
        <ClimateMap
          drawMode={drawMode}
          onSelectionChange={handleSelectionChange}
          onModeChange={setDrawMode}
          initialCenter={initialCenter}
          selection={selection}
          minAreaKm2={minAreaKm2}
          onAutoExpand={handleAutoExpand}
          analysis={analysis}
          interventions={interventions}
          layers={layers}
          onLayersChange={setLayers}
        />

        {/* Drawing Toolbar on Left */}
        <DrawToolbar
          activeMode={drawMode}
          onStartDraw={(mode) => setDrawMode(mode)}
          onClear={handleClear}
          hasSelection={Boolean(selection && selection.areaKm2 > 0)}
          minAreaKm2={minAreaKm2}
          onMinAreaChange={handleMinAreaChange}
          isSelectionTooSmall={isSelectionTooSmall}
          onAutoExpand={handleAutoExpand}
        />

        {/* Selected Area Floating Badge */}
        <AreaInfoBadge
          selection={selection}
          minAreaKm2={minAreaKm2}
          onAutoExpand={handleAutoExpand}
        />

        {/* Right Analysis & Decision Support Sidebar */}
        <HeatAnalysisDashboard
          analysis={analysis}
          interventions={interventions}
          scenarioResult={scenarioResult}
          scenarioAdjustments={scenarioAdjustments}
          onScenarioChange={handleScenarioChange}
          loading={loading}
          selection={selection}
          onAutoExpand={handleAutoExpand}
          onOpenMethodology={() => setIsMethodologyOpen(true)}
        />
      </div>

      {/* Scientific Transparency & Limitations Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </main>
  );
}

export default App;