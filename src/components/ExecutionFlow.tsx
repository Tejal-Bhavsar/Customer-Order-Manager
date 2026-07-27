import React, { useState, useEffect, useRef } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import {
  Terminal, Cpu, ShieldAlert, MessageSquare,
  Mail, FileText, Sliders, UserCheck, CheckSquare,
  RefreshCw, MapPin, Database, Send
} from 'lucide-react';

const STEPS_META = [
  { id: 'INGEST', name: 'Ingest Mail' },
  { id: 'OCR_PARSE', name: 'OCR Parse' },
  { id: 'GET_DEFAULTS', name: 'Get Defaults' },
  { id: 'GET_CUSTOMER', name: 'Match Customer' },
  { id: 'CHECK_PO', name: 'Check PO' },
  { id: 'RESOLVE_PART', name: 'Resolve Part' },
  { id: 'MATCH_ADDRESS', name: 'Match Address' },
  { id: 'CREATE_ORDER', name: 'Create ERP' },
  { id: 'NOTIFY', name: 'Notify Client' }
];

const getStepIcon = (stepId: string) => {
  switch (stepId) {
    case 'INGEST': return <Mail size={15} />;
    case 'OCR_PARSE': return <FileText size={15} />;
    case 'GET_DEFAULTS': return <Sliders size={15} />;
    case 'GET_CUSTOMER': return <UserCheck size={15} />;
    case 'CHECK_PO': return <CheckSquare size={15} />;
    case 'RESOLVE_PART': return <RefreshCw size={15} />;
    case 'MATCH_ADDRESS': return <MapPin size={15} />;
    case 'CREATE_ORDER': return <Database size={15} />;
    case 'NOTIFY': return <Send size={15} />;
    default: return null;
  }
};

const getLogBadge = (type: string) => {
  switch (type) {
    case 'reasoning': return <span className="console-badge reasoning">THINKING</span>;
    case 'tool_call': return <span className="console-badge call">CALL</span>;
    case 'tool_response': return <span className="console-badge return">RETURN</span>;
    case 'error': return <span className="console-badge fail">FAIL</span>;
    case 'warn': return <span className="console-badge warning">WARN</span>;
    default: return <span className="console-badge system">SYSTEM</span>;
  }
};

const ExecutionFlow: React.FC = () => {
  const {
    logs,
    exceptions,
    resolveException,
    currentStep,
    stepIndex
  } = useSimulator();

  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<string>('all');
  const consoleBodyRef = useRef<HTMLDivElement>(null);

  // Auto-scroll console logs
  useEffect(() => {
    if (consoleBodyRef.current) {
      consoleBodyRef.current.scrollTop = consoleBodyRef.current.scrollHeight;
    }
  }, [logs]);

  const toggleExpandLog = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getFilteredLogs = () => {
    if (logFilter === 'all') return logs;
    if (logFilter === 'reasoning') return logs.filter((l) => l.type === 'reasoning');
    if (logFilter === 'tools') return logs.filter((l) => l.type === 'tool_call' || l.type === 'tool_response');
    if (logFilter === 'errors') return logs.filter((l) => l.type === 'error' || l.type === 'warn');
    return logs;
  };

  const getStepStatus = (stepId: string, idx: number) => {
    // If order has an exception and it is the current step
    const hasActiveEx = exceptions.some(ex => !ex.resolved);
    
    if (hasActiveEx && currentStep === stepId) {
      return 'exception';
    }
    
    if (stepIndex > idx || currentStep === 'COMPLETED') {
      return 'completed';
    }
    if (currentStep === stepId) {
      return 'active';
    }
    return 'pending';
  };

  const activeException = exceptions.find((ex) => !ex.resolved);

  return (
    <>
      {/* SVG Node Connections and Step Graph */}
      <div className="node-graph-container">
        <h4 style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={14} color="var(--accent-cyan)" />
          Digital Worker Orchestrator Core Path
        </h4>
        
        <div style={{ position: 'relative', height: '120px' }}>
          {/* SVG Connection Lines */}
          <svg className="graph-svg-connections" viewBox="0 0 1000 100" preserveAspectRatio="none">
            {STEPS_META.slice(0, -1).map((step, idx) => {
              const startX = 60 + idx * 110;
              const endX = startX + 110;
              
              const statusStart = getStepStatus(step.id, idx);
              const statusEnd = getStepStatus(STEPS_META[idx + 1].id, idx + 1);
              
              let lineClass = 'connection-line';
              if (statusStart === 'completed' && (statusEnd === 'completed' || statusEnd === 'active' || statusEnd === 'exception')) {
                lineClass += ' completed';
              } else if (statusStart === 'completed' && statusEnd === 'pending') {
                lineClass += ' active';
              }
              
              return (
                <line
                  key={idx}
                  x1={startX}
                  y1={45}
                  x2={endX}
                  y2={45}
                  className={lineClass}
                />
              );
            })}
          </svg>

          {/* Render Graph Nodes */}
          <div className="nodes-wrapper">
            {STEPS_META.map((step, idx) => {
              const status = getStepStatus(step.id, idx);
              return (
                <div key={step.id} className="graph-node">
                  <div className={`node-circle ${status}`} title={step.name}>
                    {getStepIcon(step.id)}
                  </div>
                  <span className={`node-label ${status === 'active' || status === 'exception' ? 'active' : status === 'completed' ? 'completed' : ''}`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Human-in-the-loop MS Teams Modal Card */}
      {activeException && (
        <div className="teams-widget">
          <div className="teams-header">
            <MessageSquare className="teams-logo" />
            <span>Microsoft Teams — Exception Notification Channel</span>
            <span className="badge badge-warn" style={{ marginLeft: 'auto', fontSize: '9px', background: '#fff', color: 'var(--state-warning)' }}>
              Awaiting Approval
            </span>
          </div>
          <div className="teams-content">
            <div className="teams-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldAlert size={18} color="var(--state-warning)" />
                <div className="teams-card-title">
                  {activeException.type === 'part_resolution' ? 'Obsolete Part Number Detected' : 'Unregistered Shipping Address Mismatch'}
                </div>
              </div>
              <p className="teams-card-desc">{activeException.message}</p>
              
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '10px' }}>
                <strong>Order Context:</strong> {activeException.customerName} | PO Ref: {activeException.poNumber} | ERP ID: {activeException.orderId}
              </div>

              <div className="teams-actions">
                {activeException.options.map((opt, i) => (
                  <button
                    key={i}
                    className="teams-btn"
                    onClick={() => resolveException(activeException.id, opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Developer Log Console Panel */}
      <div className="console-panel" style={{ flex: 1, minHeight: 0 }}>
        <div className="console-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={14} color="var(--accent-cyan)" />
            <span>AGENT VERBOSE EXECUTION TRACE LOGS</span>
          </div>
          
          {/* Console filters */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'reasoning', 'tools', 'errors'].map((f) => (
              <button
                key={f}
                onClick={() => setLogFilter(f)}
                style={{
                  background: logFilter === f ? 'var(--accent-blue)' : 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  color: logFilter === f ? '#fff' : 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  fontSize: '9px',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <div className="console-body" ref={consoleBodyRef}>
          {getFilteredLogs().length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', marginTop: '40px' }}>
              No traces. Select a customer scenario to trigger the digital worker.
            </div>
          ) : (
            getFilteredLogs().map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div key={log.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    className={`log-row ${log.type}`}
                    onClick={() => log.details && toggleExpandLog(log.id)}
                    style={{ cursor: log.details ? 'pointer' : 'default' }}
                  >
                    <span className="log-time">[{log.timestamp}]</span>
                    <span className="log-step">&lt;{log.step}&gt;</span>
                    <span className="log-message">
                      {getLogBadge(log.type)}
                      <span style={{ marginLeft: '4px' }}>{log.message}</span>
                      {log.details && (
                        <span style={{ marginLeft: '6px', color: 'var(--accent-cyan)', fontSize: '9px' }}>
                          {isExpanded ? '(collapse)' : '(expand detail)'}
                        </span>
                      )}
                    </span>
                  </div>
                  {isExpanded && log.details && (
                    <pre className="log-details">{log.details}</pre>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default ExecutionFlow;
