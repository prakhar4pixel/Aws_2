import { useState } from "react";
import {
  X,
  Cloud,
  ShieldCheck,
  Send,
  Radio,
  FileCode,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
} from "lucide-react";

interface AwsArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSampleArea?: () => void;
}

export default function AwsArchitectureModal({
  isOpen,
  onClose,
  onLoadSampleArea,
}: AwsArchitectureModalProps) {
  const [activeTab, setActiveTab] = useState<"architecture" | "cloudformation" | "security">("architecture");

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card aws-architecture-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="aws-icon-wrapper">
              <Cloud size={24} className="text-amber" />
            </div>
            <div>
              <h2>AWS Cloud Architecture &amp; Integration</h2>
              <p className="modal-subtitle">
                Amazon Simple Notification Service (Amazon SNS) Extreme Heat Dispatcher
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="aws-modal-tabs">
          <button
            type="button"
            className={`aws-tab-btn ${activeTab === "architecture" ? "active" : ""}`}
            onClick={() => setActiveTab("architecture")}
          >
            <Layers size={14} />
            <span>Architecture Overview</span>
          </button>
          <button
            type="button"
            className={`aws-tab-btn ${activeTab === "cloudformation" ? "active" : ""}`}
            onClick={() => setActiveTab("cloudformation")}
          >
            <FileCode size={14} />
            <span>CloudFormation IaC</span>
          </button>
          <button
            type="button"
            className={`aws-tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <ShieldCheck size={14} />
            <span>Security &amp; Encryption</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body aws-modal-body">
          {/* TAB 1: ARCHITECTURE OVERVIEW */}
          {activeTab === "architecture" && (
            <div className="aws-tab-content">
              <div className="aws-hero-banner">
                <div className="hero-badge">
                  <Radio size={13} className="text-amber" />
                  <span>Production-Grade Pub/Sub</span>
                </div>
                <h3>Automated Emergency Heat-Health Warnings</h3>
                <p>
                  UrbanCool integrates directly with <strong>Amazon Simple Notification Service (Amazon SNS)</strong> to bridge geospatial satellite intelligence with real-world municipal disaster response. When extreme surface temperatures or critical heat exposure thresholds are detected, structured warnings are broadcast across multiple channels.
                </p>
              </div>

              {/* End-to-End Pipeline Steps */}
              <div className="aws-pipeline-grid">
                <div className="pipeline-card">
                  <div className="pipeline-step-num">1</div>
                  <h4>GIS Analysis Engine</h4>
                  <p>Calculates radiometric LST, thermal anomaly (+ΔT), and canopy deficiency from drawn geometry.</p>
                  <span className="pipeline-tech">Landsat Level-2 &amp; Turf.js</span>
                </div>

                <div className="pipeline-arrow">
                  <ArrowRight size={18} />
                </div>

                <div className="pipeline-card">
                  <div className="pipeline-step-num">2</div>
                  <h4>Severity Triage</h4>
                  <p>Classifies alert level into <strong>ADVISORY</strong>, <strong>HIGH</strong>, or <strong>CRITICAL</strong> based on heat index.</p>
                  <span className="pipeline-tech">Python Backend / REST</span>
                </div>

                <div className="pipeline-arrow">
                  <ArrowRight size={18} />
                </div>

                <div className="pipeline-card highlight">
                  <div className="pipeline-step-num">3</div>
                  <h4>Amazon SNS Topic</h4>
                  <p>Publishes encrypted alert payload to <code>urbancool-heat-alerts-topic</code> with custom message attributes.</p>
                  <span className="pipeline-tech">AWS SDK (boto3)</span>
                </div>

                <div className="pipeline-arrow">
                  <ArrowRight size={18} />
                </div>

                <div className="pipeline-card">
                  <div className="pipeline-step-num">4</div>
                  <h4>Multi-Channel Broadcast</h4>
                  <p>Dispatches simultaneously to SMS, municipal email lists, healthcare HTTP webhooks, and disaster units.</p>
                  <span className="pipeline-tech">Pub/Sub Subscriptions</span>
                </div>
              </div>

              {/* Quick Action to try it */}
              <div className="aws-callout-card">
                <div>
                  <h4>Ready to test the Amazon SNS Dispatcher?</h4>
                  <p>Load the Central Delhi urban core sample or draw any polygon on the map, then open the <strong>AWS Alerts</strong> tab in the sidebar.</p>
                </div>
                {onLoadSampleArea && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      onClose();
                      onLoadSampleArea();
                    }}
                  >
                    <Send size={14} />
                    <span>Load Sample &amp; Open AWS Alerts</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CLOUDFORMATION IAC */}
          {activeTab === "cloudformation" && (
            <div className="aws-tab-content">
              <p className="tab-lead-text">
                All AWS resources are provisioned through version-controlled Infrastructure-as-Code (IaC) adhering to the AWS Well-Architected Framework:
              </p>

              <div className="code-viewer-card">
                <div className="code-viewer-header">
                  <span className="code-file-name">infrastructure/sns-heat-alerts.yaml</span>
                  <span className="code-lang-tag">YAML</span>
                </div>
                <pre className="code-block">
{`AWSTemplateFormatVersion: "2010-09-09"
Description: >
  AWS CloudFormation Template for UrbanCool - Amazon SNS Extreme Heat Warning Notification Service.

Resources:
  # ── Amazon SNS Topic for Extreme Heat Warnings ──────────────────
  UrbanCoolHeatAlertsTopic:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: !Sub "urbancool-heat-alerts-topic-\${Environment}"
      DisplayName: "UrbanCool Heat Warnings"
      KmsMasterKeyId: "alias/aws/sns"
      Tags:
        - Key: "Project"
          Value: "UrbanCool"
        - Key: "ManagedBy"
          Value: "CloudFormation"
        - Key: "Purpose"
          Value: "Municipal Heat-Health Warning Dispatch"

  # ── Topic Policy Enforcing SSL In-Transit ───────────────────────
  UrbanCoolHeatAlertsTopicPolicy:
    Type: AWS::SNS::TopicPolicy
    Properties:
      Topics:
        - !Ref UrbanCoolHeatAlertsTopic
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Sid: "EnforceSSLOnly"
            Effect: "Deny"
            Principal: "*"
            Action: "SNS:*"
            Resource: !Ref UrbanCoolHeatAlertsTopic
            Condition:
              Bool:
                "aws:SecureTransport": "false"`}
                </pre>
              </div>

              <div className="iac-features-list">
                <div className="iac-feature">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span><strong>Zero Click Drift:</strong> Repeatable deployment via CloudFormation stack lifecycle.</span>
                </div>
                <div className="iac-feature">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span><strong>Configurable Environment:</strong> Parameterized for <code>production</code>, <code>staging</code>, and <code>development</code>.</span>
                </div>
                <div className="iac-feature">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span><strong>Least Privilege IAM:</strong> Publisher actions restricted to authenticated root/service principals.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & ENCRYPTION */}
          {activeTab === "security" && (
            <div className="aws-tab-content">
              <div className="security-cards-grid">
                <div className="security-card">
                  <div className="sec-icon-row">
                    <Lock size={20} className="text-rose" />
                    <h4>AWS KMS Encryption at Rest</h4>
                  </div>
                  <p>
                    All messages published to the SNS topic are encrypted at rest using the AWS Key Management Service (AWS KMS) default customer managed alias (<code>alias/aws/sns</code>).
                  </p>
                </div>

                <div className="security-card">
                  <div className="sec-icon-row">
                    <ShieldCheck size={20} className="text-emerald" />
                    <h4>Enforce SSL In-Transit (aws:SecureTransport)</h4>
                  </div>
                  <p>
                    The CloudFormation Topic Policy includes an explicit Deny rule for any unencrypted HTTP requests, ensuring 100% TLS/SSL encrypted in-transit communication.
                  </p>
                </div>

                <div className="security-card">
                  <div className="sec-icon-row">
                    <Radio size={20} className="text-sky" />
                    <h4>Simulated Fallback for Local Dev</h4>
                  </div>
                  <p>
                    The Python <code>boto3</code> backend automatically falls back to an offline simulated dispatcher if AWS credentials are not set, ensuring full local testing capabilities without breaking.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {onLoadSampleArea && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onClose();
                onLoadSampleArea();
              }}
            >
              <Send size={14} />
              <span>Load Sample Area &amp; Try Alert Dispatcher</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
