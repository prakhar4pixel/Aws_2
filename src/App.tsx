import { useState } from "react";
import ClimateMap from "./components/Map/ClimateMap";
import AreaInfoBadge from "./components/Controls/AreaInfoBadge";
import DrawToolbar from "./components/Controls/DrawToolbar";
import RiskPanel from "./components/Controls/RiskPanel";
import LandingPage from "./components/LandingPage";
import type { SelectionInfo } from "./types/gis";
import type { RiskCalculateResponse } from "./types/api";
import { calculateClimateRisk } from "./services/api";

function App() {
  const [currentView, setCurrentView] = useState<"landing" | "map">("landing");
  const [initialCenter, setInitialCenter] = useState<[number, number] | null>(null);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [drawMode, setDrawMode] = useState<"polygon" | "delete" | "simple_select">("polygon");
  const [riskData, setRiskData] = useState<RiskCalculateResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectionChange = async (newSelection: SelectionInfo | null) => {
    setSelection(newSelection);
    if (!newSelection?.geometry) {
      setRiskData(null);
      return;
    }
    
    setLoading(true);
    try {
      const data = await calculateClimateRisk(newSelection.geometry);
      setRiskData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDrawMode("delete");
    setRiskData(null);
  };

  if (currentView === "landing") {
    return (
      <LandingPage 
        onChooseMap={() => {
          setInitialCenter(null);
          setCurrentView("map");
        }}
        onSearchCity={(lat, lon) => {
          setInitialCenter([lon, lat]); // MapLibre takes [lng, lat]
          setCurrentView("map");
        }}
      />
    );
  }

  return (
    <main className="app">
      <ClimateMap 
        drawMode={drawMode}
        onSelectionChange={handleSelectionChange} 
        onModeChange={setDrawMode}
        initialCenter={initialCenter}
      />
      <DrawToolbar 
        activeMode={drawMode}
        onStartDraw={() => setDrawMode("polygon")}
        onClear={handleClear}
        hasSelection={Boolean(selection && selection.areaKm2 > 0)}
      />
      <AreaInfoBadge selection={selection} />
      <RiskPanel riskData={riskData} loading={loading} />
    </main>
  );
}

export default App;