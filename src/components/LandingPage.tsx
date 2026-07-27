import React from 'react';
import { Cpu, ArrowRight, ShieldCheck, Mail, Database, MessageSquare, ExternalLink } from 'lucide-react';

interface LandingPageProps {
  onLaunchSandbox: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLaunchSandbox }) => {
  return (
    <div className="landing-container">
      {/* Navigation Header */}
      <nav className="landing-nav">
        <div className="logo-section">
          <Cpu className="logo-icon" style={{ color: 'var(--accent-cyan)' }} />
          <span className="logo-text">Customer Order Manager</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="https://github.com/Tejal-Bhavsar/Customer-Order-Manager" target="_blank" rel="noreferrer" className="nav-link">
            GitHub <ExternalLink size={12} />
          </a>
          <button className="btn btn-primary" onClick={onLaunchSandbox} style={{ padding: '8px 16px', fontSize: '12px' }}>
            Launch Sandbox
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-badge">
          <span className="badge badge-outline" style={{ color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan-glow)' }}>
            NEW: UI/UX Pro Max Edition
          </span>
        </div>
        <h1 className="hero-title">
          Orchestrate Customer Order Ingestion <br />
          <span className="gradient-text">With Autonomous AI Workers</span>
        </h1>
        <p className="hero-subtitle">
          Free operations teams from manual entry. Customer Order Manager ingests emails, parses attachments with OCR, translates parts/units, and writes orders to IFS Cloud ERP with Teams exception routing.
        </p>
        <div className="hero-ctas">
          <button className="btn btn-primary btn-lg" onClick={onLaunchSandbox}>
            Open Interactive Sandbox
            <ArrowRight size={16} />
          </button>
          <a
            href="https://github.com/Tejal-Bhavsar/Customer-Order-Manager"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-lg"
          >
            Explore Source Code
          </a>
        </div>
      </header>

      {/* Value Stats Grid */}
      <section className="landing-stats">
        <div className="stat-card">
          <span className="stat-num">98.6%</span>
          <span className="stat-label">Reduction in Data Entry Time</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">&lt; 15s</span>
          <span className="stat-label">Order Process Latency</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">100%</span>
          <span className="stat-label">ERP Validation Compliance</span>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="landing-features">
        <h2 className="section-title">Orchestrator Capabilities</h2>
        <p className="section-subtitle">Eight integrated micro-tools designed to automate the complete order intake lifecycle.</p>
        
        <div className="bento-grid">
          {/* Card 1 */}
          <div className="bento-card col-2">
            <div className="bento-icon-wrapper">
              <Mail className="bento-icon" />
            </div>
            <h3 className="bento-title">Email Ingestion & OCR Scanner</h3>
            <p className="bento-desc">
              Monitors Outlook or Gmail inboxes 24/7. Automatically extracts purchase order PDFs, png images, or spreadsheets and maps coordinates to read data segments with high precision.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bento-card">
            <div className="bento-icon-wrapper">
              <Database className="bento-icon" />
            </div>
            <h3 className="bento-title">ERP Verification</h3>
            <p className="bento-desc">
              Performs duplicate check on PO numbers, matches customers, and validates address registries to prevent database conflicts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bento-card">
            <div className="bento-icon-wrapper">
              <ShieldCheck className="bento-icon" />
            </div>
            <h3 className="bento-title">Part Mappings</h3>
            <p className="bento-desc">
              Cross-references customer item SKU codes to internal sales parts, automatically applying quantity scale conversions.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bento-card col-2">
            <div className="bento-icon-wrapper">
              <MessageSquare className="bento-icon" />
            </div>
            <h3 className="bento-title">Human-in-the-Loop Exceptions</h3>
            <p className="bento-desc">
              When the agent detects discontinued parts or mismatched shipping addresses, it pushes a notification card to Microsoft Teams, prompting the coordinator to select an approved override instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Architecture Flow Diagram */}
      <section className="landing-flow">
        <h2 className="section-title">Autonomous Agent Flow</h2>
        <p className="section-subtitle">How unstructured orders become verified sales orders in IFS Cloud ERP.</p>
        
        <div className="flow-timeline">
          <div className="flow-step">
            <div className="flow-step-num">01</div>
            <div>
              <h4 className="flow-step-title">Ingest & Scan</h4>
              <p className="flow-step-desc">Mail received, attachments scanned via coordinate-mapped OCR text block extractors.</p>
            </div>
          </div>
          <div className="flow-step">
            <div className="flow-step-num">02</div>
            <div>
              <h4 className="flow-step-title">ERP Check & Cross-Ref</h4>
              <p className="flow-step-desc">Customer profile resolved, duplicate PO check executed, SKU codes mapped with conversion rates.</p>
            </div>
          </div>
          <div className="flow-step">
            <div className="flow-step-num">03</div>
            <div>
              <h4 className="flow-step-title">Teams Escalation</h4>
              <p className="flow-step-desc">Discrepancies automatically route warning adaptive cards to Teams for rapid human resolution.</p>
            </div>
          </div>
          <div className="flow-step">
            <div className="flow-step-num">04</div>
            <div>
              <h4 className="flow-step-title">Fulfillment Output</h4>
              <p className="flow-step-desc">Sales orders created in IFS Cloud ERP, stock deducted, confirmation email dispatched.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Climax CTA Section */}
      <section className="landing-cta-banner">
        <h2 className="hero-title" style={{ fontSize: '32px', marginBottom: '12px' }}>
          Ready to experience the digital worker?
        </h2>
        <p className="hero-subtitle" style={{ fontSize: '15px', maxWidth: '600px', margin: '0 auto 24px auto' }}>
          Explore the sandbox demo. Run standard scenarios, test quantity UoM conversions, and play with Teams exceptions.
        </p>
        <button className="btn btn-primary btn-lg" onClick={onLaunchSandbox}>
          Start Interactive Simulation
          <ArrowRight size={16} />
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div>© {new Date().getFullYear()} Customer Order Manager. Under MIT License.</div>
        <div style={{ color: 'var(--text-muted)' }}>
          Pushed and compiled at branch: <code style={{ fontSize: '11px', background: 'rgba(255,255,255,0.02)' }}>main</code>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
