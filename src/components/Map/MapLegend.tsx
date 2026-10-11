import { useState } from "react";
import { Layers, ChevronDown, ChevronUp, Info } from "lucide-react";

interface MapLegendProps {
  showLST: boolean;
  showNDVI: boolean;
  showHotspots: boolean;
  showLandCover: boolean;
  showInterventions: boolean;
}

export default function MapLegend({
  showLST,
  showNDVI,
  showHotspots,
  showLandCover,
  showInterventions,
}: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!showLST && !showNDVI && !showHotspots && !showLandCover && !showInterventions) {
    return null;
  }

  return (
    <div className="map-legend-widget">
      <div className="legend-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="legend-title">
          <Layers size={14} className="text-sky" />
          <span>Scientific Map Legend</span>
        </div>
        <button type="button" className="legend-toggle-btn" aria-label="Toggle Legend">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {isExpanded && (
        <div className="legend-content">
          {/* LST Ramp */}
          {showLST && (
            <div className="legend-section">
              <div className="section-label">
                <strong>Land Surface Temperature (LST)</strong>
                <span className="unit-badge">°C (Radiometric)</span>
              </div>
              <div className="color-ramp-bar lst-ramp" />
              <div className="ramp-ticks">
                <span>&lt; 32°C</span>
                <span>35°C</span>
                <span>38°C</span>
                <span>41°C</span>
                <span>&gt; 44°C</span>
              </div>
              <p className="legend-hint">
                <Info size={11} /> Landsat Collection 2 Level-2 Surface Temperature
              </p>
            </div>
          )}

          {/* NDVI Ramp */}
          {showNDVI && (
            <div className="legend-section">
              <div className="section-label">
                <strong>NDVI (Vegetation Index)</strong>
                <span className="unit-badge">0.0 – 1.0</span>
              </div>
              <div className="color-ramp-bar ndvi-ramp" />
              <div className="ramp-ticks">
                <span>0.08 (Bare)</span>
                <span>0.25 (Moderate)</span>
                <span>0.60+ (Dense)</span>
              </div>
              <p className="legend-hint">
                <Info size={11} /> Normalized Difference Vegetation Index ((NIR-Red)/(NIR+Red))
              </p>
            </div>
          )}

          {/* Hotspots */}
          {showHotspots && (
            <div className="legend-section">
              <div className="section-label">
                <strong>Spatial Thermal Hotspots</strong>
              </div>
              <div className="legend-items-list">
                <div className="legend-item">
                  <span className="hotspot-dot dot-severe" />
                  <span>Severe Hotspot (LST &gt; +2.0°C over mean)</span>
                </div>
                <div className="legend-item">
                  <span className="hotspot-dot dot-elevated" />
                  <span>Elevated Heat (LST &gt; +0.8°C over mean)</span>
                </div>
                <div className="legend-item">
                  <span className="hotspot-dot dot-cool" />
                  <span>Cool / Vegetated Buffer Zone</span>
                </div>
              </div>
            </div>
          )}

          {/* Land Cover */}
          {showLandCover && (
            <div className="legend-section">
              <div className="section-label">
                <strong>Land Cover Classes</strong>
              </div>
              <div className="legend-items-list">
                <div className="legend-item">
                  <span className="swatch swatch-builtup" />
                  <span>Built-up / Impervious</span>
                </div>
                <div className="legend-item">
                  <span className="swatch swatch-veg" />
                  <span>Vegetative Canopy</span>
                </div>
                <div className="legend-item">
                  <span className="swatch swatch-water" />
                  <span>Water Body</span>
                </div>
                <div className="legend-item">
                  <span className="swatch swatch-bare" />
                  <span>Bare Soil / Paved Open Space</span>
                </div>
              </div>
            </div>
          )}

          {/* Interventions */}
          {showInterventions && (
            <div className="legend-section">
              <div className="section-label">
                <strong>Candidate Intervention Zones</strong>
              </div>
              <div className="legend-items-list">
                <div className="legend-item">
                  <span className="swatch swatch-coolroof" />
                  <span>Cool Roof Assessment Clusters</span>
                </div>
                <div className="legend-item">
                  <span className="swatch-line line-greencorridor" />
                  <span>Priority Tree & Green Corridors</span>
                </div>
                <div className="legend-item">
                  <span className="swatch swatch-pocketpark" />
                  <span>Candidate Pocket Parks</span>
                </div>
                <div className="legend-item">
                  <span className="swatch-line line-shade" />
                  <span>Pedestrian Shading Corridors</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
