import type { RiskCalculateResponse } from "../../types/api";
import type { SelectionInfo } from "../../types/gis";
import { AlertTriangle, Thermometer, Wind, Leaf, Building2, ShieldAlert, Maximize2 } from "lucide-react";

interface RiskPanelProps {
    riskData: RiskCalculateResponse | null;
    loading: boolean;
    selection?: SelectionInfo | null;
    onAutoExpand?: () => void;
}

export default function RiskPanel({ riskData, loading, selection, onAutoExpand }: RiskPanelProps) {
    if (loading) {
        return (
            <div className="risk-panel loading">
                <div className="spinner"></div>
                <span>Analyzing urban microclimate data...</span>
            </div>
        );
    }

    // When an area is drawn but violates minimum area restriction
    if (selection && selection.geometry && !selection.isValidArea && selection.areaKm2 > 0) {
        return (
            <div className="risk-panel restriction-state">
                <div className="restriction-panel-header">
                    <ShieldAlert size={20} className="text-warning" />
                    <h3>Minimum Area Restriction</h3>
                </div>

                <div className="restriction-badge-card">
                    <div className="restriction-score-label">Current Selection</div>
                    <div className="restriction-score-val">{selection.areaKm2} km²</div>
                    <div className="restriction-target-pill">
                        Required: ≥ {selection.minAreaRequiredKm2} km² ({(selection.minAreaRequiredKm2 * 100).toFixed(0)} ha)
                    </div>
                </div>

                <div className="restriction-explanation">
                    <div className="explanation-title">Why is there a minimum area?</div>
                    <p>
                        Urban Heat Island (UHI) analysis and canopy deficiency modeling require a contiguous neighborhood block size (≥ {selection.minAreaRequiredKm2} km²) to generate statistically sound thermal, vegetation, and built-up metrics.
                    </p>
                </div>

                {onAutoExpand && (
                    <button
                        type="button"
                        className="restriction-action-btn"
                        onClick={onAutoExpand}
                    >
                        <Maximize2 size={16} />
                        <span>Auto-Expand to {selection.minAreaRequiredKm2} km²</span>
                    </button>
                )}
            </div>
        );
    }

    if (!riskData) return null;

    return (
        <div className="risk-panel active">
            <h3><AlertTriangle size={18} /> Climate Risk Assessment</h3>
            
            <div className={`risk-score-card risk-${riskData.risk_category.toLowerCase()}`}>
                <div className="score-value">{riskData.climate_risk}</div>
                <div className="score-label">{riskData.risk_category} Risk</div>
            </div>

            <div className="metrics-grid">
                <div className="metric-item">
                    <span className="metric-label"><Thermometer size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> Temperature</span>
                    <span className="metric-value">{riskData.metrics.temperature}°C</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label"><Wind size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> PM2.5</span>
                    <span className="metric-value">{riskData.metrics.pm25} µg/m³</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label"><Leaf size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> Vegetation (NDVI)</span>
                    <span className="metric-value">{riskData.metrics.ndvi}</span>
                </div>
                <div className="metric-item">
                    <span className="metric-label"><Building2 size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }}/> Built-up</span>
                    <span className="metric-value">{riskData.metrics.builtup_percentage}%</span>
                </div>
            </div>

            <div className="tree-analysis">
                <h4><Leaf size={14} /> Canopy Standards (30% Rule)</h4>
                <div className="tree-analysis-content">
                    <div className="tree-stats">
                        <span className="stat-label">Current:</span>
                        <span className={`stat-value ${riskData.metrics.green_coverage < 30 ? 'text-red' : 'text-green'}`}>
                            {riskData.metrics.green_coverage}%
                        </span>
                    </div>
                    {riskData.metrics.green_coverage < 30 ? (
                        <div className="tree-action">
                            <span className="action-text">Deficit detected. To meet the 30% WHO urban standard in this {riskData.area_hectares} ha area, you need to plant approximately:</span>
                            <span className="action-number">
                                {Math.ceil((riskData.area_hectares * ((30 - riskData.metrics.green_coverage) / 100)) * 333).toLocaleString()} trees
                            </span>
                        </div>
                    ) : (
                        <div className="tree-action success">
                            <span className="action-text">Excellent! This area meets the 30% urban green canopy standard.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
