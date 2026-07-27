import React, { useState } from 'react';
import { SimulatorProvider, useSimulator } from './context/SimulatorContext';
import { Cpu, RotateCcw } from 'lucide-react';
import AgentConfigPanel from './components/AgentConfigPanel';
import InboxViewer from './components/InboxViewer';
import ExecutionFlow from './components/ExecutionFlow';
import ErpSimulator from './components/ErpSimulator';
import LandingPage from './components/LandingPage';
import './App.css';

const DashboardContent: React.FC = () => {
  const { activeScenario, activeOrder, resetSimulation } = useSimulator();
  const [view, setView] = useState<'landing' | 'sandbox'>('landing');

  if (view === 'landing') {
    return <LandingPage onLaunchSandbox={() => setView('sandbox')} />;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-section" onClick={() => setView('landing')} style={{ cursor: 'pointer' }} title="Back to Landing Page">
          <Cpu className="logo-icon" />
          <span className="logo-text">Customer Order Manager</span>
          <span className="logo-badge">AGENT SYSTEM</span>
        </div>

        {/* System Operations Metrics */}
        {activeScenario && (
          <div className="system-metrics">
            <div className="metric-item">
              <span className="metric-label">Latency</span>
              <span className="metric-value">942ms</span>
            </div>
            <div className="metric-item" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
              <span className="metric-label">Token Cost</span>
              <span className="metric-value">$0.042</span>
            </div>
            <div className="metric-item" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
              <span className="metric-label">Status</span>
              <span className="metric-value" style={{ 
                color: activeOrder?.status === 'completed' ? 'var(--state-success)' : activeOrder?.status === 'exception' ? 'var(--state-warning)' : 'var(--accent-cyan)'
              }}>
                {activeOrder?.status.toUpperCase() || 'IDLE'}
              </span>
            </div>
          </div>
        )}

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={resetSimulation}>
            <RotateCcw size={14} />
            Reset Sandbox
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="dashboard-grid">
        
        {/* Left Column: Config and Ingestion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}>
          <AgentConfigPanel />
          <InboxViewer />
        </div>

        {/* Middle Column: Visual Workflow Node Graph & Logs */}
        <div className="center-layout">
          <ExecutionFlow />
        </div>

        {/* Right Column: ERP Sandbox Database and Comms */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <ErpSimulator />
        </div>

      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SimulatorProvider>
      <DashboardContent />
    </SimulatorProvider>
  );
};

export default App;
