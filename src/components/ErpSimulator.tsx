import React, { useState } from 'react';
import { useSimulator } from '../context/SimulatorContext';
import { Database, FileSpreadsheet, Users, Mail } from 'lucide-react';

const ErpSimulator: React.FC = () => {
  const { erpOrders, erpParts, erpCustomers, erpCrossRefs, comms, activeOrder } = useSimulator();
  const [activeTab, setActiveTab] = useState<'orders' | 'parts' | 'customers' | 'comms'>('orders');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Combine active order currently processing with static ERP orders (if it's not saved yet)
  const allOrdersToShow = [...erpOrders];
  if (activeOrder && !allOrdersToShow.some(o => o.id === activeOrder.id)) {
    allOrdersToShow.unshift(activeOrder);
  }

  const getOrderStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'badge-active';
      case 'processing': return 'badge-active'; // glows in css
      case 'exception': return 'badge-warn';
      default: return 'badge-outline';
    }
  };

  return (
    <div className="tabs-container">
      {/* Tabs Header */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Database size={12} style={{ marginRight: '6px' }} />
          Sales Orders ({allOrdersToShow.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'parts' ? 'active' : ''}`}
          onClick={() => setActiveTab('parts')}
        >
          <FileSpreadsheet size={12} style={{ marginRight: '6px' }} />
          Inventory DB
        </button>
        <button
          className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <Users size={12} style={{ marginRight: '6px' }} />
          Customers
        </button>
        <button
          className={`tab-btn ${activeTab === 'comms' ? 'active' : ''}`}
          onClick={() => setActiveTab('comms')}
        >
          <Mail size={12} style={{ marginRight: '6px' }} />
          Comms Log ({comms.length})
        </button>
      </div>

      {/* Tabs Content */}
      <div className="tab-pane">
        
        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allOrdersToShow.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0', fontSize: '12px' }}>
                No sales orders created in ERP yet. Start a simulation run!
              </div>
            ) : (
              allOrdersToShow.map((order) => {
                const isExpanded = selectedOrderId === order.id;
                return (
                  <div
                    key={order.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast)'
                    }}
                    onClick={() => setSelectedOrderId(isExpanded ? null : order.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {order.id}
                      </span>
                      <span className={`badge ${getOrderStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <div>Customer: <strong style={{ color: '#fff' }}>{order.customerName}</strong></div>
                      <div>PO Reference: <strong style={{ color: '#fff' }}>{order.poNumber}</strong></div>
                      <div>Total Value: <strong style={{ color: 'var(--accent-cyan)' }}>${order.totalValue.toFixed(2)}</strong></div>
                      <div>Site ID: <strong style={{ color: '#fff' }}>{order.siteId || 'Awaiting...'}</strong></div>
                    </div>

                    {isExpanded && (
                      <div
                        style={{
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '1px dashed var(--border-color)',
                          fontSize: '11px'
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent toggling parent click
                      >
                        <div style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>
                          <strong>Shipping To:</strong> {order.deliveryAddress}
                        </div>
                        <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                          Resolved Line Items:
                        </strong>
                        {order.lines.length === 0 ? (
                          <div style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No lines resolved yet.</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {order.lines.map((line, idx) => (
                              <div key={idx} className="erp-order-line-item">
                                <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                                  {line.salesPartNo} — {line.description}
                                </div>
                                <div className="erp-line-grid">
                                  <div>Cust Part: {line.customerPartNo}</div>
                                  <div>Original: {line.customerQty} {line.customerUom}</div>
                                  <div>Resolved: {line.quantity} {line.salesUom}</div>
                                  <div style={{ textAlign: 'right', fontWeight: 600 }}>${line.totalPrice.toFixed(2)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* PARTS TAB */}
        {activeTab === 'parts' && (
          <div className="erp-table-wrapper">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Sales Part</th>
                  <th>Stock</th>
                  <th>Unit Price</th>
                  <th>Customer Cross-Ref Aliases</th>
                </tr>
              </thead>
              <tbody>
                {erpParts.map((part) => {
                  const aliases = erpCrossRefs.filter((xr) => xr.salesPartNo === part.salesPartNo);
                  return (
                    <tr key={part.salesPartNo}>
                      <td>
                        <strong style={{ color: '#fff' }}>{part.salesPartNo}</strong>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{part.description}</div>
                      </td>
                      <td style={{ color: part.stock < 300 ? 'var(--state-warning)' : 'var(--text-primary)' }}>
                        {part.stock} PCS
                      </td>
                      <td>${part.unitPrice.toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {aliases.map((xr) => (
                            <span key={xr.customerPartNo} style={{ fontSize: '9px', background: 'rgba(255,255,255,0.03)', padding: '2px 4px', borderRadius: '3px', border: '1px solid var(--border-color)' }}>
                              {xr.customerPartNo} ({xr.customerUom} → {xr.conversionFactor > 1 ? `x${xr.conversionFactor} ` : ''}{xr.salesUom})
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {erpCustomers.map((cust) => (
              <div
                key={cust.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', color: '#fff' }}>{cust.name}</strong>
                  <span className="badge badge-outline" style={{ fontSize: '10px' }}>{cust.id}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '8px' }}>
                  <div>Default Site: <strong style={{ color: '#fff' }}>{cust.siteId}</strong></div>
                  <div>Coordinator: <strong style={{ color: '#fff' }}>{cust.coordinator}</strong></div>
                </div>
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Registered Addresses on File:
                  </span>
                  <ul style={{ paddingLeft: '14px', margin: 0, fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {cust.addresses.map((addr, idx) => (
                      <li key={idx}>{addr}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COMMS LOG TAB */}
        {activeTab === 'comms' && (
          <div className="comms-list">
            {comms.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0', fontSize: '12px' }}>
                No notifications dispatched. Create a successful sales order to trigger alerts.
              </div>
            ) : (
              comms.map((comm) => (
                <div key={comm.id} className="comms-card">
                  <div className="comms-card-header">
                    <div>
                      <strong>To:</strong> <span className="comms-card-to">{comm.to}</span>
                    </div>
                    <span>{comm.timestamp}</span>
                  </div>
                  <div className="comms-card-subject">{comm.subject}</div>
                  <pre className="comms-card-body">{comm.body}</pre>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ErpSimulator;
