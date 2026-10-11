import type { SelectionInfo } from "../../types/gis";
import { MapPin, BoxSelect, AlertTriangle, CheckCircle, Maximize2 } from "lucide-react";

interface AreaInfoBadgeProps {
  selection: SelectionInfo | null;
  minAreaKm2?: number;
  onAutoExpand?: () => void;
}

export default function AreaInfoBadge({
  selection,
  minAreaKm2 = 0.05,
  onAutoExpand,
}: AreaInfoBadgeProps) {
  if (!selection || !selection.geometry || selection.areaKm2 === 0) {
    return (
      <div className="area-info-badge hint">
        <MapPin size={18} className="badge-icon" />
        <div className="hint-content">
          <span>Draw an area on the map to select an urban zone</span>
          <span className="hint-sub">Minimum area requirement: {minAreaKm2} km² ({(minAreaKm2 * 100).toFixed(0)} ha)</span>
        </div>
      </div>
    );
  }

  const isInvalid = !selection.isValidArea;

  if (isInvalid) {
    return (
      <div className="area-info-badge restriction-warning">
        <div className="badge-header warning">
          <AlertTriangle size={15} className="badge-icon-warning" />
          <span className="badge-title">Area Restriction Not Met</span>
          <span className="restriction-chip">Too Small</span>
        </div>

        <div className="badge-values">
          <span className="primary-val text-warning">{selection.areaKm2} km²</span>
          <span className="secondary-val">({selection.areaHectares} ha)</span>
        </div>

        <div className="restriction-details">
          <span>
            Minimum required: <strong>{selection.minAreaRequiredKm2} km²</strong> ({(selection.minAreaRequiredKm2 * 100).toFixed(0)} ha).
            Urban microclimate modeling requires a larger contiguous block.
          </span>
        </div>

        {onAutoExpand && (
          <button
            type="button"
            className="auto-expand-btn"
            onClick={onAutoExpand}
            title="Automatically expand this selection to satisfy the minimum area constraint"
          >
            <Maximize2 size={14} />
            <span>Auto-expand to {selection.minAreaRequiredKm2} km²</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="area-info-badge active">
      <div className="badge-header">
        <BoxSelect size={14} className="badge-icon" />
        <span className="badge-title">Selected Urban Zone</span>
        <span className="status-pill valid">
          <CheckCircle size={12} />
          <span>Valid Area (≥ {selection.minAreaRequiredKm2} km²)</span>
        </span>
      </div>
      <div className="badge-values">
        <span className="primary-val">{selection.areaKm2} km²</span>
        <span className="secondary-val">({selection.areaHectares} ha)</span>
      </div>
    </div>
  );
}
