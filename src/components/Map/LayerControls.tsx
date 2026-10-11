import { useState } from "react";
import { Layers, Thermometer, Leaf, Flame, Building2, Trees } from "lucide-react";

export interface LayerVisibilityState {
  showSelection: boolean;
  showLST: boolean;
  showHotspots: boolean;
  showNDVI: boolean;
  showLandCover: boolean;
  showInterventions: boolean;
}

interface LayerControlsProps {
  layers: LayerVisibilityState;
  onChange: (layers: LayerVisibilityState) => void;
  hasData: boolean;
}

export default function LayerControls({ layers, onChange, hasData }: LayerControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleLayer = (key: keyof LayerVisibilityState) => {
    onChange({
      ...layers,
      [key]: !layers[key],
    });
  };

  const activeCount = Object.values(layers).filter(Boolean).length;

  return (
    <div className="layer-controls-widget">
      <button
        type="button"
        className={`layer-controls-toggle-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Map Data Layers"
      >
        <Layers size={18} />
        <span>Map Layers</span>
        <span className="layer-count-badge">{activeCount}</span>
      </button>

      {isOpen && (
        <div className="layer-controls-dropdown">
          <div className="layer-dropdown-header">
            <span>Environmental Layers</span>
          </div>

          <div className="layer-options-list">
            {/* Selected Area */}
            <label className="layer-option-item">
              <input
                type="checkbox"
                checked={layers.showSelection}
                onChange={() => toggleLayer("showSelection")}
              />
              <span className="layer-checkbox-custom" />
              <div className="layer-meta">
                <span className="layer-name">Selected Area Boundary</span>
                <span className="layer-desc">User-defined polygon boundary</span>
              </div>
            </label>

            {/* Land Surface Temperature */}
            <label className={`layer-option-item ${!hasData ? "disabled" : ""}`}>
              <input
                type="checkbox"
                checked={layers.showLST}
                disabled={!hasData}
                onChange={() => toggleLayer("showLST")}
              />
              <span className="layer-checkbox-custom" />
              <div className="layer-meta">
                <span className="layer-name">
                  <Thermometer size={14} className="inline-icon text-rose" /> Land Surface Temperature (LST)
                </span>
                <span className="layer-desc">Landsat-9 30m thermal surface heat</span>
              </div>
            </label>

            {/* Heat Hotspots */}
            <label className={`layer-option-item ${!hasData ? "disabled" : ""}`}>
              <input
                type="checkbox"
                checked={layers.showHotspots}
                disabled={!hasData}
                onChange={() => toggleLayer("showHotspots")}
              />
              <span className="layer-checkbox-custom" />
              <div className="layer-meta">
                <span className="layer-name">
                  <Flame size={14} className="inline-icon text-amber" /> Heat Hotspots
                </span>
                <span className="layer-desc">Spatial thermal anomaly clusters</span>
              </div>
            </label>

            {/* NDVI */}
            <label className={`layer-option-item ${!hasData ? "disabled" : ""}`}>
              <input
                type="checkbox"
                checked={layers.showNDVI}
                disabled={!hasData}
                onChange={() => toggleLayer("showNDVI")}
              />
              <span className="layer-checkbox-custom" />
              <div className="layer-meta">
                <span className="layer-name">
                  <Leaf size={14} className="inline-icon text-emerald" /> NDVI / Vegetation
                </span>
                <span className="layer-desc">Normalized Difference Vegetation Index</span>
              </div>
            </label>

            {/* Land Cover */}
            <label className={`layer-option-item ${!hasData ? "disabled" : ""}`}>
              <input
                type="checkbox"
                checked={layers.showLandCover}
                disabled={!hasData}
                onChange={() => toggleLayer("showLandCover")}
              />
              <span className="layer-checkbox-custom" />
              <div className="layer-meta">
                <span className="layer-name">
                  <Building2 size={14} className="inline-icon text-sky" /> Land Cover / Built-up
                </span>
                <span className="layer-desc">Impervious surface classification</span>
              </div>
            </label>

            {/* Intervention Zones */}
            <label className={`layer-option-item ${!hasData ? "disabled" : ""}`}>
              <input
                type="checkbox"
                checked={layers.showInterventions}
                disabled={!hasData}
                onChange={() => toggleLayer("showInterventions")}
              />
              <span className="layer-checkbox-custom" />
              <div className="layer-meta">
                <span className="layer-name">
                  <Trees size={14} className="inline-icon text-teal" /> Intervention Zones
                </span>
                <span className="layer-desc">Candidate cool roofs &amp; green corridors</span>
              </div>
            </label>
          </div>

          <div className="layer-hint-msg">
            {!hasData
              ? "Draw an area on the map to activate satellite environmental layers."
              : "Satellite Heat & Environmental Layers Active"}
          </div>
        </div>
      )}
    </div>
  );
}
