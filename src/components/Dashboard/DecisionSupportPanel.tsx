import { useState } from 'react';
import type { RiskCalculateResponse } from '../../types/api';
import { simulateScenario } from '../../services/scenarioSimulationService';
import type { ScenarioAdjustments } from '../../services/scenarioSimulationService';
import type { InterventionOption, ScenarioResult } from '../../types/intervention';
import { AlertTriangle, Lightbulb, Activity, Layers, ActivitySquare, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import './DecisionSupport.css';

interface Props {
  riskData: RiskCalculateResponse | null;
  recommendations: InterventionOption[];
  showInterventions: boolean;
  onToggleInterventions: () => void;
}

export default function DecisionSupportPanel({ riskData, recommendations, showInterventions, onToggleInterventions }: Props) {
  const [adjustments, setAdjustments] = useState<ScenarioAdjustments>({
    greenCoverageIncrease: 0,
    roofReflectivityIncrease: 0,
    pedestrianShadeIncrease: 0,
    openSpaceIncrease: 0
  });

  const scenarioResult = riskData
    ? simulateScenario(riskData.metrics, riskData.climate_risk, adjustments)
    : null;

  if (!riskData) return null;

  return (
    <div className="decision-support-panel">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2><Lightbulb size={20} /> Solution & Intervention Planner</h2>
        <button 
          onClick={onToggleInterventions}
          style={{ 
            background: 'none', border: 'none', color: showInterventions ? '#38bdf8' : '#94a3b8', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' 
          }}
          title="Toggle Map Interventions Layer"
        >
          {showInterventions ? <Eye size={16} /> : <EyeOff size={16} />}
          {showInterventions ? "Hide Map Layers" : "Show Map Layers"}
        </button>
      </div>

      <div className="panel-section">
        <h3 className="section-title"><AlertTriangle size={16} /> 1. Why is this area at high risk?</h3>
        <HeatRiskExplanation metrics={riskData.metrics} />
      </div>

      <div className="panel-section">
        <h3 className="section-title"><CheckCircle2 size={16} /> 2. Intervention Recommendations</h3>
        <InterventionRecommendation recommendations={recommendations} />
      </div>

      <div className="panel-section">
        <h3 className="section-title"><Layers size={16} /> 3. Recommended Action Plan</h3>
        <ActionPlan recommendations={recommendations} />
      </div>

      <div className="panel-section">
        <h3 className="section-title"><Activity size={16} /> 4. What-If Simulator</h3>
        <WhatIfSimulator adjustments={adjustments} setAdjustments={setAdjustments} result={scenarioResult} />
      </div>

      <div className="panel-section">
        <h3 className="section-title"><ActivitySquare size={16} /> 5. Intervention Comparison</h3>
        <InterventionComparison recommendations={recommendations} />
      </div>
    </div>
  );
}

function HeatRiskExplanation({ metrics }: { metrics: RiskCalculateResponse["metrics"] }) {
  const factors = [];
  if (metrics.green_coverage < 20) {
    factors.push(`Low vegetation coverage: only ${metrics.green_coverage.toFixed(0)}%.`);
  }
  if (metrics.builtup_percentage > 60) {
    factors.push(`High built-up density: ${metrics.builtup_percentage.toFixed(0)}%.`);
  }
  if (metrics.temperature > 35) {
    factors.push(`High surface temperature: ${metrics.temperature.toFixed(1)}°C.`);
  }
  const openSpace = 100 - metrics.builtup_percentage - metrics.green_coverage - metrics.water_body_fraction;
  if (openSpace < 10) {
    factors.push(`Limited open space for cooling interventions: ~${openSpace.toFixed(0)}% available.`);
  }

  if (factors.length === 0) {
    factors.push("This area does not show extreme environmental risk factors based on the current data.");
  }

  return (
    <div className="factor-list">
      {factors.map((f, i) => (
        <div key={i} className="factor-item">
          <AlertTriangle size={16} className="icon" />
          <p>{f}</p>
        </div>
      ))}
    </div>
  );
}

function InterventionRecommendation({ recommendations }: { recommendations: InterventionOption[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {recommendations.map(rec => (
        <div key={rec.id} className="recommendation-card">
          <div className="rec-header">
            <h4>{rec.name}</h4>
            <span className={`rec-priority ${rec.priority.toLowerCase()}`}>{rec.priority} Priority</span>
          </div>
          <div className="rec-body">
            <p><strong>Suitability:</strong> {rec.suitabilityScore}/100</p>
            <p><strong>Why:</strong> {rec.whyRecommended}</p>
            <p><strong>Requirements:</strong> {rec.requiredConditions}</p>
            <p><strong>Limitations:</strong> {rec.limitations}</p>
            <p><strong>Cost:</strong> {rec.costCategory}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionPlan({ recommendations }: { recommendations: InterventionOption[] }) {
  const immediate: string[] = [];
  const short: string[] = [];
  const long: string[] = [];

  recommendations.forEach(rec => {
    if (rec.id === 'shaded_corridors') {
      immediate.push("Identify exposed pedestrian areas for temporary shading.");
      short.push("Install shade structures in high-traffic pedestrian zones.");
    }
    if (rec.id === 'cool_roofs') {
      immediate.push("Assess existing roofs for cool-roof suitability.");
      short.push("Prioritize suitable roofs for reflective coatings.");
    }
    if (rec.id === 'pocket_parks') {
      short.push("Map potential pocket green spaces.");
      long.push("Acquire and develop localized pocket parks.");
    }
    if (rec.id === 'green_corridors') {
      short.push("Identify feasible locations for street trees.");
      long.push("Plan connected green corridors and improve urban vegetation coverage.");
    }
    if (rec.id === 'reflective_surfaces') {
      short.push("Identify large paved areas suitable for reflective or permeable surfaces.");
      long.push("Integrate permeable surfaces in future road resurfacing projects.");
    }
  });

  return (
    <div>
      <div className="action-stage">
        <h5>Immediate</h5>
        <ul>
          {immediate.length > 0 ? immediate.map((a, i) => <li key={i}>{a}</li>) : <li>No immediate actions identified.</li>}
        </ul>
      </div>
      <div className="action-stage">
        <h5>Short-term</h5>
        <ul>
          {short.length > 0 ? short.map((a, i) => <li key={i}>{a}</li>) : <li>No short-term actions identified.</li>}
        </ul>
      </div>
      <div className="action-stage">
        <h5>Long-term</h5>
        <ul>
          {long.length > 0 ? long.map((a, i) => <li key={i}>{a}</li>) : <li>Integrate heat mitigation into future development planning.</li>}
        </ul>
      </div>
      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '12px' }}>
        * These are planning suggestions. Site surveys, budget, and local feasibility must be considered.
      </p>
    </div>
  );
}

function WhatIfSimulator({ 
  adjustments, 
  setAdjustments, 
  result 
}: { 
  adjustments: ScenarioAdjustments;
  setAdjustments: (adj: ScenarioAdjustments) => void;
  result: ScenarioResult | null;
}) {
  return (
    <div>
      <div className="simulator-control">
        <label>
          Increase Vegetation Coverage
          <span>+{adjustments.greenCoverageIncrease}%</span>
        </label>
        <input 
          type="range" min="0" max="50" step="5" 
          value={adjustments.greenCoverageIncrease}
          onChange={(e) => setAdjustments({...adjustments, greenCoverageIncrease: Number(e.target.value)})}
        />
      </div>
      <div className="simulator-control">
        <label>
          Improve Roof Reflectivity
          <span>+{adjustments.roofReflectivityIncrease}%</span>
        </label>
        <input 
          type="range" min="0" max="50" step="5" 
          value={adjustments.roofReflectivityIncrease}
          onChange={(e) => setAdjustments({...adjustments, roofReflectivityIncrease: Number(e.target.value)})}
        />
      </div>
      <div className="simulator-control">
        <label>
          Add Pedestrian Shade
          <span>+{adjustments.pedestrianShadeIncrease}%</span>
        </label>
        <input 
          type="range" min="0" max="50" step="5" 
          value={adjustments.pedestrianShadeIncrease}
          onChange={(e) => setAdjustments({...adjustments, pedestrianShadeIncrease: Number(e.target.value)})}
        />
      </div>

      {result && (
        <div className="simulator-results">
          <div className="sim-score">
            <span>Current Risk:</span>
            <strong>{result.currentScore}/100</strong>
          </div>
          <div className="sim-score">
            <span>Scenario Estimate:</span>
            <strong>{result.estimatedScore}/100</strong>
          </div>
          <div className="sim-score">
            <span>Estimated Change:</span>
            <strong className="change">-{result.scoreChange} pts</strong>
          </div>
          <div style={{ marginTop: '12px' }}>
            {result.assumptions.map((ass: string, i: number) => (
              <p key={i} className="sim-assumptions">• {ass}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InterventionComparison({ recommendations }: { recommendations: InterventionOption[] }) {
  if (recommendations.length === 0) return null;
  const topOption = recommendations[0];

  return (
    <div>
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Intervention</th>
            <th>Suitability</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {recommendations.slice(0, 3).map(rec => (
            <tr key={rec.id}>
              <td>{rec.name}</td>
              <td>{rec.suitabilityScore}</td>
              <td>{rec.costCategory || "Data unavailable"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '12px', fontSize: '13px', color: '#e2e8f0', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
        <strong>Recommendation:</strong> {topOption.name} should be investigated first due to its {topOption.priority.toLowerCase()} priority and high suitability for this specific area's conditions.
      </div>
    </div>
  );
}
