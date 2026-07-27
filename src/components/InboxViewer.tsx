import React, { useState, useEffect } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { Mail, FileText, Download } from 'lucide-react';
import type { SimulationScenario } from '../types';

const InboxViewer: React.FC = () => {
  const { scenarios, activeScenario, currentStep } = useSimulator();
  const [selectedMail, setSelectedMail] = useState<SimulationScenario | null>(null);

  // Set the selected email to active scenario when one starts running
  useEffect(() => {
    if (activeScenario) {
      setSelectedMail(activeScenario);
    }
  }, [activeScenario]);

  // Default select first mail if none selected
  useEffect(() => {
    if (!selectedMail && scenarios.length > 0) {
      setSelectedMail(scenarios[0]);
    }
  }, [scenarios, selectedMail]);

  const getStatusBadge = (scenarioId: string) => {
    if (activeScenario?.id === scenarioId) {
      if (currentStep === 'COMPLETED') {
        return <span className="badge badge-active" style={{ fontSize: '9px', padding: '2px 6px' }}>Processed</span>;
      }
      return <span className="badge badge-warn" style={{ fontSize: '9px', padding: '2px 6px', animation: 'status-pulse 1s infinite' }}>Reading</span>;
    }
    return <span className="badge badge-outline" style={{ fontSize: '9px', padding: '2px 6px' }}>Unread</span>;
  };

  return (
    <div className="glass-panel" style={{ flex: 1, minHeight: 0 }}>
      <div className="panel-header">
        <div className="panel-title-wrapper">
          <Mail className="panel-icon" />
          <span className="panel-title">Ingestion Inbox & OCR Viewer</span>
        </div>
      </div>
      <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
        
        {/* Inbox Mail list */}
        <div className="inbox-list">
          {scenarios.map((sc) => {
            const isCurrent = selectedMail?.id === sc.id;
            return (
              <div
                key={sc.id}
                className={`inbox-item ${isCurrent ? 'selected' : ''}`}
                onClick={() => setSelectedMail(sc)}
              >
                <div className="inbox-item-left">
                  <span className="inbox-item-sender">{sc.emailSender}</span>
                  <span className="inbox-item-subject">{sc.emailSubject}</span>
                </div>
                {getStatusBadge(sc.id)}
              </div>
            );
          })}
        </div>

        {/* Selected Email Panel */}
        {selectedMail && (
          <div className="document-sandbox" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto' }}>
            <div className="document-header">
              <div>
                <strong>From:</strong> {selectedMail.emailSender}<br />
                <strong>Subject:</strong> {selectedMail.emailSubject}
              </div>
              <Mail size={16} color="var(--text-secondary)" />
            </div>
            
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap' }}>
              {selectedMail.emailBody}
            </p>

            {/* Attachment Badge */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--accent-cyan)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{selectedMail.attachmentName}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {selectedMail.attachmentType.toUpperCase()} Doc • Bounding Boxes Mapped
                  </span>
                </div>
              </div>
              <Download size={14} color="var(--text-secondary)" style={{ marginLeft: 'auto', cursor: 'pointer' }} />
            </div>

            {/* OCR Digital Canvas View */}
            <div style={{ marginTop: '10px' }}>
              <h5 style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Live OCR Scanned Document Layout
              </h5>
              
              <div className="document-canvas-wrapper">
                {currentStep === 'OCR_PARSE' && activeScenario?.id === selectedMail.id && (
                  <div className="laser-scanner-line"></div>
                )}
                {/* Header elements inside the document */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #334155', paddingBottom: '10px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>PURCHASE ORDER</h3>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>CONFIRMATION COPY</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>{selectedMail.attachmentContent.poNumber}</span><br />
                    <span style={{ fontSize: '9px', color: '#64748b' }}>Date: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Info rows */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', fontSize: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#475569', textTransform: 'uppercase', fontSize: '8px' }}>Customer</strong>
                    <div style={{ fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>{selectedMail.attachmentContent.customerName}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#475569', textTransform: 'uppercase', fontSize: '8px' }}>Deliver To</strong>
                    <div style={{ color: '#334155', marginTop: '2px', lineHeight: 1.3 }}>{selectedMail.attachmentContent.deliveryAddress}</div>
                  </div>
                </div>

                {/* Items Table */}
                <div style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '6px 10px', fontWeight: 600, color: '#475569' }}>Part Code</th>
                        <th style={{ padding: '6px 10px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '6px 10px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>UoM</th>
                        <th style={{ padding: '6px 10px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Unit Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMail.attachmentContent.lines.map((line, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: '#0f172a' }}>{line.partNo}</td>
                          <td style={{ padding: '8px 10px', color: '#334155', textAlign: 'center' }}>{line.qty}</td>
                          <td style={{ padding: '8px 10px', color: '#334155', textAlign: 'center' }}>{line.uom}</td>
                          <td style={{ padding: '8px 10px', color: '#334155', textAlign: 'right', fontWeight: 500 }}>${line.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* OCR overlay boxes */}
                {selectedMail.boundingBoxes && activeScenario?.id === selectedMail.id && currentStep !== 'IDLE' && (
                  selectedMail.boundingBoxes.map((box) => {
                    const isScanning = currentStep === 'OCR_PARSE';
                    return (
                      <div
                        key={box.id}
                        className={`ocr-overlay-box ${isScanning ? 'scanning' : ''}`}
                        style={{
                          left: `${box.x}%`,
                          top: `${box.y}%`,
                          width: `${box.w}%`,
                          height: `${box.h}%`
                        }}
                      >
                        <span className="ocr-label-tooltip">
                          {box.label}: <strong>{box.value}</strong>
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default InboxViewer;
