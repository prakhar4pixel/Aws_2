import { useState } from "react";
import {
  Send,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Server,
  Cloud,
  Layers,
} from "lucide-react";
import type { HeatAnalysisResponse, HeatAlertPublishResponse } from "../../types/api";
import { publishHeatAlert } from "../../services/api";

interface AwsSnsAlertPanelProps {
  analysis: HeatAnalysisResponse;
}

export default function AwsSnsAlertPanel({ analysis }: AwsSnsAlertPanelProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [city, setCity] = useState("Delhi NCR");
  const [sending, setSending] = useState(false);
  const [alertResponse, setAlertResponse] = useState<HeatAlertPublishResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { lst, relativeDifference, exposureIndex, hotspots, areaKm2 } = analysis;

  // Determine severity based on scientific parameters
  const isCritical = lst.mean >= 42 || exposureIndex.category === "Critical";
  const isHigh = !isCritical && (lst.mean >= 38 || exposureIndex.category === "High");
  const severityTag = isCritical ? "CRITICAL" : isHigh ? "HIGH" : "ADVISORY";

  const handleDispatchAlert = async () => {
    setSending(true);
    setErrorMsg(null);
    try {
      const res = await publishHeatAlert({
        zoneName: "Drawn Urban Sector",
        areaKm2: areaKm2,
        meanLst: lst.mean,
        maxLst: lst.max,
        relativeDiff: relativeDifference,
        exposureCategory: exposureIndex.category,
        hotspotCount: hotspots.length,
        city: city,
        recipientEmail: recipientEmail.trim() || undefined,
        immediateActions: [
          "Activate neighborhood shaded cooling shelters and misting nodes.",
          "Dispatch municipal heat-stress warning for outdoor workforce.",
          "Mobilize water-sprinkling tankers across high-albedo corridors.",
          "Alert primary healthcare centers for heat exhaustion cases."
        ]
      });

      setAlertResponse(res);
    } catch (err: any) {
      console.error("Failed to publish SNS heat alert:", err);
      setErrorMsg("Failed to dispatch alert. Please check connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="aws-sns-alert-panel">
      {/* AWS Service Brand Header */}
      <div className="sns-header-card">
        <div className="sns-service-badge">
          <Cloud size={14} className="text-amber" />
          <span>Amazon Simple Notification Service (Amazon SNS)</span>
        </div>
        <h3 className="sns-title">Municipal Heat-Health Alert Dispatcher</h3>
        <p className="sns-desc">
          Publish automated, multi-channel emergency heat warnings to municipal response teams, healthcare taskforces, and district administration.
        </p>
      </div>

      {/* Alert Severity Banner */}
      <div className={`sns-severity-banner banner-${severityTag.toLowerCase()}`}>
        <div className="severity-banner-left">
          <ShieldAlert size={20} />
          <div>
            <div className="severity-label">{severityTag} HEAT WARNING LEVEL</div>
            <div className="severity-sub">
              Mean Surface Temperature: <strong>{lst.mean}°C</strong> (Anomaly: +{relativeDifference}°C)
            </div>
          </div>
        </div>
        <div className="severity-pill">{exposureIndex.category} Exposure</div>
      </div>

      {/* Real-time Telemetry Grid */}
      <div className="sns-telemetry-grid">
        <div className="telemetry-card">
          <span className="telemetry-label">Analysis Zone Area</span>
          <span className="telemetry-value">{areaKm2} km²</span>
          <span className="telemetry-sub">{(areaKm2 * 100).toFixed(0)} hectares</span>
        </div>
        <div className="telemetry-card">
          <span className="telemetry-label">Peak Hotspot LST</span>
          <span className="telemetry-value text-rose">{lst.max}°C</span>
          <span className="telemetry-sub">{hotspots.length} localized hotspots</span>
        </div>
        <div className="telemetry-card">
          <span className="telemetry-label">Thermal Baseline Anomaly</span>
          <span className="telemetry-value text-amber">+{relativeDifference}°C</span>
          <span className="telemetry-sub">vs reference buffer</span>
        </div>
        <div className="telemetry-card">
          <span className="telemetry-label">Exposure Score</span>
          <span className="telemetry-value">{exposureIndex.score}/100</span>
          <span className="telemetry-sub">{exposureIndex.category}</span>
        </div>
      </div>

      {/* Dispatch Action Card */}
      <div className="sns-dispatch-card">
        <div className="dispatch-header">
          <Radio size={16} className="text-amber" />
          <h4>AWS Pub/Sub Alert Parameters</h4>
        </div>

        <div className="dispatch-form">
          <div className="form-group">
            <label htmlFor="city-input">Municipal District / City</label>
            <input
              id="city-input"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Delhi NCR, Phoenix, Madrid..."
              className="sns-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email-input">Direct Alert Recipient Email (Optional)</label>
            <input
              id="email-input"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g. municipal-disaster-response@city.gov"
              className="sns-input"
            />
          </div>

          <div className="form-group">
            <span className="form-label-static">Target AWS SNS Topic ARN</span>
            <div className="topic-arn-display">
              <code>arn:aws:sns:us-east-1:123456789012:urbancool-heat-alerts-topic</code>
            </div>
          </div>

          <button
            type="button"
            className="sns-dispatch-btn"
            onClick={handleDispatchAlert}
            disabled={sending}
          >
            {sending ? (
              <>
                <div className="sns-btn-spinner" />
                <span>Publishing to Amazon SNS...</span>
              </>
            ) : (
              <>
                <Send size={15} />
                <span>Dispatch Amazon SNS Heat Warning</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="sns-error-banner">
              <AlertTriangle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dispatch Confirmation Card */}
      {alertResponse && (
        <div className="sns-confirmation-card">
          <div className="confirmation-header">
            <CheckCircle2 size={18} className="text-emerald" />
            <h4>Amazon SNS Alert Dispatched Successfully</h4>
          </div>

          <div className="confirmation-details">
            <div className="detail-row">
              <span className="detail-key">Message ID:</span>
              <code className="detail-val">{alertResponse.messageId}</code>
            </div>
            <div className="detail-row">
              <span className="detail-key">Severity Tag:</span>
              <span className={`severity-tag tag-${alertResponse.alertSeverity.toLowerCase()}`}>
                {alertResponse.alertSeverity}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-key">Timestamp:</span>
              <span className="detail-val">{new Date(alertResponse.timestamp).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-key">Subject:</span>
              <span className="detail-val detail-subject">{alertResponse.subject}</span>
            </div>
            <div className="detail-row">
              <span className="detail-key">Status:</span>
              <span className="detail-val text-emerald">{alertResponse.statusMessage}</span>
            </div>
          </div>

          <div className="confirmation-footer">
            <Server size={13} />
            <span>Delivered across configured SNS subscribers (Email notifications, SMS alerts, and AWS Lambda triggers).</span>
          </div>
        </div>
      )}

      {/* CloudFormation & Infrastructure Reference */}
      <div className="sns-iac-note">
        <Layers size={14} className="text-sky" />
        <div className="iac-text">
          <strong>AWS Infrastructure as Code (CloudFormation):</strong> Topic defined in{" "}
          <code>infrastructure/sns-heat-alerts.yaml</code> using AWS Well-Architected Framework principles.
        </div>
      </div>
    </div>
  );
}
