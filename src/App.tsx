import React from 'react';
import { SimulatorProvider, useSimulator } from './context/SimulatorContext';
import { Cpu, RotateCcw } from 'lucide-react';
import AgentConfigPanel from './components/AgentConfigPanel';
import InboxViewer from './components/InboxViewer';
import ExecutionFlow from './components/ExecutionFlow';
import ErpSimulator from './components/ErpSimulator';
import './App.css';

const DashboardContent: React.FC = () => {
  const { activeScenario, activeOrder, resetSimulation } = useSimulator();

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <Cpu className="logo-icon" />
          <span className="logo-text">Customer Order Manager</span>
          <span className="logo-badge">AGENT SYSTEM</span>
        </div>
        <div className="header-actions">
          {activeScenario && (
            <div className="status-indicator">
              <span className={`status-dot ${activeOrder?.status || 'draft'}`}></span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                Status: <strong style={{ color: '#fff' }}>{activeOrder?.status || 'IDLE'}</strong>
              </span>
            </div>
          )}
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
