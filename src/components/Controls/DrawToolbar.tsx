import { useState } from "react";
import { MousePointer2, Hexagon, Square, Lasso, Trash2, ShieldAlert, Maximize2, ChevronDown } from "lucide-react";
import { AREA_RESTRICTION_PRESETS } from "../../utils/geo";

interface DrawToolbarProps {
  activeMode: "polygon" | "rectangle" | "freehand" | "delete" | "simple_select";
  onStartDraw: (mode: "polygon" | "rectangle" | "freehand" | "simple_select") => void;
  onClear: () => void;
  hasSelection: boolean;
  minAreaKm2: number;
  onMinAreaChange: (minArea: number) => void;
  isSelectionTooSmall?: boolean;
  onAutoExpand?: () => void;
}

export default function DrawToolbar({
  activeMode,
  onStartDraw,
  onClear,
  hasSelection,
  minAreaKm2,
  onMinAreaChange,
  isSelectionTooSmall = false,
  onAutoExpand,
}: DrawToolbarProps) {
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  const currentPreset = AREA_RESTRICTION_PRESETS.find(p => p.minKm2 === minAreaKm2) || {
    id: "custom",
    label: `${minAreaKm2} km²`,
    minKm2: minAreaKm2,
    hectares: minAreaKm2 * 100,
    description: `Minimum ${minAreaKm2} km²`,
  };

  return (
    <div className="gis-draw-toolbar-wrapper">
      <div className="gis-draw-toolbar">
        <button
          type="button"
          className={`toolbar-btn ${activeMode === "simple_select" ? "active" : ""}`}
          onClick={() => onStartDraw("simple_select")}
          title="Select and interact with drawn areas"
        >
          <MousePointer2 size={17} />
          <span>Select</span>
        </button>

        <button
          type="button"
          className={`toolbar-btn ${activeMode === "polygon" ? "active" : ""}`}
          onClick={() => onStartDraw("polygon")}
          title="Draw custom polygon"
        >
          <Hexagon size={17} />
          <span>Polygon</span>
        </button>

        <button
          type="button"
          className={`toolbar-btn ${activeMode === "rectangle" ? "active" : ""}`}
          onClick={() => onStartDraw("rectangle")}
          title="Draw rectangular zone"
        >
          <Square size={17} />
          <span>Rectangle</span>
        </button>

        <button
          type="button"
          className={`toolbar-btn ${activeMode === "freehand" ? "active" : ""}`}
          onClick={() => onStartDraw("freehand")}
          title="Lasso / Freehand shape"
        >
          <Lasso size={17} />
          <span>Lasso</span>
        </button>

        <div className="toolbar-divider" />

        {/* Minimum Area Restriction Selector */}
        <div className="min-area-selector-container">
          <button
            type="button"
            className={`min-area-pill ${isSelectionTooSmall ? "pill-warning" : ""}`}
            onClick={() => setShowPresetDropdown(!showPresetDropdown)}
            title={`Configure minimum required area for analysis. Current: ${currentPreset.label} (${currentPreset.description})`}
          >
            <ShieldAlert size={14} className={isSelectionTooSmall ? "text-warning" : "text-sky"} />
            <div className="pill-text">
              <span className="pill-label">Min Area:</span>
              <span className="pill-val">{minAreaKm2} km²</span>
            </div>
            <ChevronDown size={13} className={`chevron ${showPresetDropdown ? "rotate" : ""}`} />
          </button>

          {showPresetDropdown && (
            <div className="preset-dropdown-menu">
              <div className="dropdown-header">Minimum Area Threshold</div>
              {AREA_RESTRICTION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`preset-option ${preset.minKm2 === minAreaKm2 ? "selected" : ""}`}
                  onClick={() => {
                    onMinAreaChange(preset.minKm2);
                    setShowPresetDropdown(false);
                  }}
                >
                  <div className="preset-row">
                    <span className="preset-name">{preset.label}</span>
                    <span className="preset-ha">{preset.hectares} ha</span>
                  </div>
                  <span className="preset-desc">{preset.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {isSelectionTooSmall && onAutoExpand && (
          <button
            type="button"
            className="toolbar-btn expand-btn"
            onClick={onAutoExpand}
            title={`Expand current selection to satisfy minimum ${minAreaKm2} km² constraint`}
          >
            <Maximize2 size={16} />
            <span>Expand to Min</span>
          </button>
        )}

        {hasSelection && (
          <button
            type="button"
            className="toolbar-btn danger"
            onClick={onClear}
            title="Clear Selection"
          >
            <Trash2 size={17} />
            <span>Clear</span>
          </button>
        )}
      </div>
    </div>
  );
}
