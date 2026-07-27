import React from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { Settings, CheckCircle } from 'lucide-react';
import type { ReasoningEffort } from '../types';

const AgentConfigPanel: React.FC = () => {
  const { agentConfig, setAgentConfig, scenarios, activeScenario, runScenario, isProcessing } = useSimulator();

  const handleModeChange = (mode: 'basic' | 'reasoning') => {
    setAgentConfig({ ...agentConfig, mode });
  };

  const handleEffortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAgentConfig({ ...agentConfig, reasoningEffort: e.target.value as ReasoningEffort });
  };

  const handleVerbosityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAgentConfig({ ...agentConfig, verbosity: e.target.value as 'standard' | 'verbose' });
  };

  const handleConcurrentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgentConfig({ ...agentConfig, concurrent: e.target.checked });
  };

  return (
    <div className="glass-panel" style={{ flexShrink: 0 }}>
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <Settings className="panel-icon" />
          <span className="panel-title">Agent Settings & Run Presets</span>
        </div>
      </div>
      <div className="panel-content" style={{ padding: '16px' }}>
        
        {/* Mode Switches */}
        <div className="config-card">
          <div className="config-row">
            <span className="config-label">Agent Mode</span>
            <div className="mode-switch-group">
              <button
                className={`mode-switch-btn ${agentConfig.mode === 'basic' ? 'active' : ''}`}
                onClick={() => handleModeChange('basic')}
                disabled={isProcessing}
              >
                Basic LLM
              </button>
              <button
                className={`mode-switch-btn ${agentConfig.mode === 'reasoning' ? 'active' : ''}`}
                onClick={() => handleModeChange('reasoning')}
                disabled={isProcessing}
              >
                Reasoning
              </button>
            </div>
          </div>

          {agentConfig.mode === 'reasoning' && (
            <div className="config-row">
              <span className="config-label">Reasoning Effort</span>
              <select
                className="select-input"
                value={agentConfig.reasoningEffort}
                onChange={handleEffortChange}
                disabled={isProcessing}
              >
                <option value="low">Low Effort</option>
                <option value="medium">Medium Effort</option>
                <option value="high">High Effort</option>
              </select>
            </div>
          )}

          <div className="config-row">
            <span className="config-label">Log Detail Level</span>
            <select
              className="select-input"
              value={agentConfig.verbosity}
              onChange={handleVerbosityChange}
              disabled={isProcessing}
            >
              <option value="standard">Standard Logs</option>
              <option value="verbose">Verbose Console</option>
            </select>
          </div>

          <div className="config-row">
            <span className="config-label">Concurrent Tools</span>
            <label className="checkbox-slider">
              <input
                type="checkbox"
                checked={agentConfig.concurrent}
                onChange={handleConcurrentChange}
                disabled={isProcessing}
              />
              <span className="slider-round"></span>
            </label>
          </div>
        </div>

        {/* Preset Scenarios */}
        <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>
          Simulated Customer Scenarios
        </h4>
        <div className="scenarios-list">
          {scenarios.map((sc) => {
            const isActive = activeScenario?.id === sc.id;
            return (
              <button
                key={sc.id}
                className={`scenario-card ${isActive ? 'active' : ''}`}
                onClick={() => !isProcessing && runScenario(sc.id)}
                disabled={isProcessing}
                style={{ width: '100%' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="scenario-title">{sc.title}</span>
                  {isActive && <CheckCircle size={14} color="var(--accent-cyan)" />}
                </div>
                <p className="scenario-desc">{sc.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AgentConfigPanel;
