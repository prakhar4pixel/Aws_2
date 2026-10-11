import { X, ShieldAlert, Satellite, Thermometer, AlertCircle, FileText, CheckCircle2 } from "lucide-react";

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MethodologyModal({ isOpen, onClose }: MethodologyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card methodology-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <FileText size={22} className="text-sky" />
            <div>
              <h2>Scientific Methodology &amp; Analytical Limitations</h2>
              <p className="modal-subtitle">UrbanCool Decision-Support System Guidelines</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Key Principle Alert */}
          <div className="methodology-alert">
            <ShieldAlert size={20} className="alert-icon" />
            <div>
              <strong>Decision-Support Notice:</strong> UrbanCool provides macro-scale environmental screening based on satellite observations. It does not replace on-site microclimate modeling or structural engineering feasibility surveys.
            </div>
          </div>

          <div className="methodology-sections-grid">
            {/* 1. LST vs Air Temperature */}
            <div className="methodology-card">
              <div className="card-header">
                <Thermometer size={18} className="text-rose" />
                <h3>1. Land Surface Temperature (LST) ≠ Air Temperature</h3>
              </div>
              <p>
                Satellite sensors measure <strong>radiometric skin surface temperature</strong> (LST) emitted by roofs, pavements, and soils. LST is significantly more extreme than 2-meter ambient air temperature, which is moderated by atmospheric turbulence and wind mixing.
              </p>
              <div className="card-badge">Data Source: Landsat Collection 2 Level-2 (TIRS-2)</div>
            </div>

            {/* 2. Exposure Index vs Health Risk */}
            <div className="methodology-card">
              <div className="card-header">
                <AlertCircle size={18} className="text-amber" />
                <h3>2. Urban Heat Exposure Index ≠ Clinical Health Risk</h3>
              </div>
              <p>
                The <strong>Prototype Urban Heat Exposure Index</strong> evaluates relative environmental exposure (thermal anomaly, canopy deficit, impervious fraction). It does <em>not</em> measure medical morbidity or heat-stroke risk, which require individual vulnerability and socioeconomic exposure data.
              </p>
              <div className="card-badge">Relative Analytical Indicator (0–100)</div>
            </div>

            {/* 3. Temporal Snapshot Limitations */}
            <div className="methodology-card">
              <div className="card-header">
                <Satellite size={18} className="text-cyan" />
                <h3>3. Single Satellite Observation Snapshot</h3>
              </div>
              <p>
                Landsat operates on a sun-synchronous orbit with an equatorial crossing time around 10:00–10:30 AM local solar time. A single satellite observation represents a snapshot in time, not permanent microclimatic conditions throughout diurnal and nocturnal cycles.
              </p>
              <div className="card-badge">Scene Date: May 2026 Clear-Sky Overpass</div>
            </div>

            {/* 4. Spatial Resolution */}
            <div className="methodology-card">
              <div className="card-header">
                <CheckCircle2 size={18} className="text-emerald" />
                <h3>4. Spatial Resolution &amp; Mixed Pixels</h3>
              </div>
              <p>
                Landsat thermal infrared data has a native resolution of 100 meters, resampled to 30 meters by USGS. Individual pixels therefore represent an integrated composite of mixed surfaces (e.g. partial roof, asphalt roadway, and street trees).
              </p>
              <div className="card-badge">Spatial Resolution: 30 m Gridded</div>
            </div>

            {/* 5. Intervention Suitability Disclaimer */}
            <div className="methodology-card">
              <div className="card-header">
                <AlertCircle size={18} className="text-violet" />
                <h3>5. No Guaranteed Temperature Reduction Figures</h3>
              </div>
              <p>
                UrbanCool reports <strong>Intervention Suitability</strong> rather than claiming fixed temperature reductions (e.g., no claim that "cool roofs will reduce temperature by 5°C"). Actual microclimatic cooling depends on 3D canyon morphology, building height, and installation quality.
              </p>
              <div className="card-badge">Evidence-Based Screening</div>
            </div>

            {/* 6. What-If Scenario Assumptions */}
            <div className="methodology-card">
              <div className="card-header">
                <FileText size={18} className="text-blue" />
                <h3>6. What-If Scenario Estimator Rules</h3>
              </div>
              <p>
                Scenario simulations demonstrate hypothetical sensitivity in the exposure index under specific planning interventions. All results are explicitly labeled <strong>Scenario estimate</strong> with transparent assumptions.
              </p>
              <div className="card-badge">Transparent Indicator Weighting</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Acknowledge &amp; Continue Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
