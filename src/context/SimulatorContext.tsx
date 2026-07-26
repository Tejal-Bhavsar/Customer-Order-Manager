import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import {
  AgentConfig,
  SalesOrder,
  SalesOrderLine,
  Customer,
  PartInfo,
  PartCrossReference,
  LogEntry,
  TeamsException,
  CustomerComm,
  SimulationScenario,
  OrderStatus,
  BoundingBox
} from '../types';

interface SimulatorContextType {
  agentConfig: AgentConfig;
  setAgentConfig: (config: AgentConfig) => void;
  scenarios: SimulationScenario[];
  activeScenario: SimulationScenario | null;
  activeOrder: SalesOrder | null;
  logs: LogEntry[];
  exceptions: TeamsException[];
  comms: CustomerComm[];
  erpOrders: SalesOrder[];
  erpCustomers: Customer[];
  erpParts: PartInfo[];
  erpCrossRefs: PartCrossReference[];
  isProcessing: boolean;
  currentStep: string;
  stepIndex: number;
  runScenario: (scenarioId: string) => void;
  resolveException: (exceptionId: string, choice: string) => void;
  resetSimulation: () => void;
}

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

// Define Mock Data
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-1001',
    name: 'Acme Industrial Corp',
    siteId: 'SITE-US-01',
    coordinator: 'Alice Johnson',
    addresses: [
      '100 Enterprise Way, Detroit, MI 48201',
      '200 Supply Chain Rd, Laredo, TX 78045'
    ]
  },
  {
    id: 'CUST-1002',
    name: 'Global Logistics Dynamics',
    siteId: 'SITE-EU-02',
    coordinator: 'Bob Miller',
    addresses: [
      '42 Logistics Blvd, Munich, DE 80331',
      'Aviation House, Terminal 4, London, UK'
    ]
  },
  {
    id: 'CUST-1003',
    name: 'Apex Tech Industries',
    siteId: 'SITE-APAC-03',
    coordinator: 'Chloe Zhang',
    addresses: [
      'Building B, High Tech Park, Shenzhen, CN'
    ]
  },
  {
    id: 'CUST-1004',
    name: 'Vanguard Systems LLC',
    siteId: 'SITE-US-01',
    coordinator: 'Alice Johnson',
    addresses: [
      '500 Innovation Ave, Boston, MA 02110'
    ]
  }
];

const MOCK_PARTS: PartInfo[] = [
  { salesPartNo: 'S-PART-101', description: 'Heavy Duty Steel Bracket', unitPrice: 45.00, stock: 1450 },
  { salesPartNo: 'S-PART-102', description: 'Precision Core Ball Bearing', unitPrice: 12.50, stock: 8300 },
  { salesPartNo: 'S-PART-103', description: 'Industrial Copper Heat Sink', unitPrice: 89.90, stock: 240 },
  { salesPartNo: 'S-PART-104', description: 'Flexible Neoprene Tube (1m)', unitPrice: 8.00, stock: 5900 }
];

const MOCK_CROSS_REFS: PartCrossReference[] = [
  {
    customerPartNo: 'ACME-BRKT-99',
    salesPartNo: 'S-PART-101',
    salesDescription: 'Heavy Duty Steel Bracket',
    conversionFactor: 1,
    customerUom: 'PCS',
    salesUom: 'PCS',
    unitPrice: 45.00
  },
  {
    customerPartNo: 'GLD-BRG-SET12',
    salesPartNo: 'S-PART-102',
    salesDescription: 'Precision Core Ball Bearing',
    conversionFactor: 12,
    customerUom: 'SET',
    salesUom: 'PCS',
    unitPrice: 135.00 // Set of 12 is 135.00 (which makes it $11.25 per unit bulk discount)
  },
  {
    customerPartNo: 'APEX-CO-HS',
    salesPartNo: 'S-PART-103',
    salesDescription: 'Industrial Copper Heat Sink',
    conversionFactor: 1,
    customerUom: 'PCS',
    salesUom: 'PCS',
    unitPrice: 89.90
  },
  {
    customerPartNo: 'APEX-CO-HS-OLD',
    salesPartNo: 'S-PART-103',
    salesDescription: 'Industrial Copper Heat Sink [DISCONTINUED]',
    conversionFactor: 1,
    customerUom: 'PCS',
    salesUom: 'PCS',
    unitPrice: 89.90
  }
];

const MOCK_SCENARIOS: SimulationScenario[] = [
  {
    id: 'perfect',
    title: 'A. Perfect Pipeline (Standard Order)',
    description: 'Processing a standard order with valid parts, matching delivery address, and clear unit counts. Agent proceeds without manual intervention.',
    emailSender: 'purchasing@acmeind.com',
    emailSubject: 'NEW PURCHASE ORDER - ACME CORP - PO-2026-881',
    emailBody: `Hello Support Team,

Please find attached our purchase order PO-2026-881. We need these shipped to our Detroit facility as soon as possible.
Please acknowledge receipt of the order.

Best regards,
Mark Thompson
Acme Industrial Corp`,
    attachmentName: 'PO-2026-881.pdf',
    attachmentType: 'pdf',
    attachmentContent: {
      customerName: 'Acme Industrial Corp',
      poNumber: 'PO-2026-881',
      deliveryAddress: '100 Enterprise Way, Detroit, MI 48201',
      lines: [
        { partNo: 'ACME-BRKT-99', qty: 50, uom: 'PCS', price: 45.00 }
      ]
    },
    boundingBoxes: [
      { id: '1', x: 10, y: 5, w: 30, h: 6, label: 'Document Title', value: 'PURCHASE ORDER' },
      { id: '2', x: 10, y: 15, w: 40, h: 10, label: 'Customer Name', value: 'Acme Industrial Corp' },
      { id: '3', x: 60, y: 15, w: 30, h: 5, label: 'PO Number', value: 'PO-2026-881' },
      { id: '4', x: 10, y: 28, w: 45, h: 12, label: 'Delivery Address', value: '100 Enterprise Way, Detroit, MI 48201' },
      { id: '5', x: 10, y: 48, w: 80, h: 8, label: 'Part Line 1', value: 'ACME-BRKT-99 | 50 PCS | $45.00' }
    ]
  },
  {
    id: 'bulk',
    title: 'B. Bulk-Pack Puzzle (Quantity Conversion)',
    description: 'Customer orders parts in sets of 12, while the system tracks individual units. Agent automatically applies the 1:12 conversion factor.',
    emailSender: 'logistics@globaldynamics.com',
    emailSubject: 'Order Request: GLD-BRG-SET12 - PO-2026-904',
    emailBody: `Hi team,

We want to submit order PO-2026-904 for 20 sets of bearings. Ship them to our Munich warehouse. 
Please note that these are sets of 12.

Regards,
Helena Vance
Global Logistics Dynamics`,
    attachmentName: 'order_dynamics_904.png',
    attachmentType: 'image',
    attachmentContent: {
      customerName: 'Global Logistics Dynamics',
      poNumber: 'PO-2026-904',
      deliveryAddress: '42 Logistics Blvd, Munich, DE 80331',
      lines: [
        { partNo: 'GLD-BRG-SET12', qty: 20, uom: 'SET', price: 135.00 }
      ]
    },
    boundingBoxes: [
      { id: '1', x: 15, y: 8, w: 20, h: 5, label: 'PO Number', value: 'PO-2026-904' },
      { id: '2', x: 15, y: 16, w: 45, h: 6, label: 'Company', value: 'Global Logistics Dynamics' },
      { id: '3', x: 15, y: 25, w: 50, h: 10, label: 'Ship To', value: '42 Logistics Blvd, Munich, DE 80331' },
      { id: '4', x: 15, y: 42, w: 70, h: 6, label: 'Item 1', value: 'GLD-BRG-SET12 | 20 SETs | $135.00/SET' }
    ]
  },
  {
    id: 'discontinued',
    title: 'C. Discontinued Part (Teams Escalation)',
    description: 'An order contains a discontinued part code. Agent detects the issue, triggers a Microsoft Teams exception card, and resumes once resolved.',
    emailSender: 'procurement@apextech.com',
    emailSubject: 'APEX Purchase Order: HS-OLD - PO-2026-775',
    emailBody: `Dear Sales,

Attached is PO-2026-775 from Apex Tech. We are ordering 10 of the copper heat sinks we used in the previous prototypes.
Delivery to our Shenzhen R&D building.

Thanks,
David Lin
Apex Tech Industries`,
    attachmentName: 'APEX_PO_775.xlsx',
    attachmentType: 'excel',
    attachmentContent: {
      customerName: 'Apex Tech Industries',
      poNumber: 'PO-2026-775',
      deliveryAddress: 'Building B, High Tech Park, Shenzhen, CN',
      lines: [
        { partNo: 'APEX-CO-HS-OLD', qty: 10, uom: 'PCS', price: 89.90 }
      ]
    }
  },
  {
    id: 'address',
    title: 'D. Address Clash (Conflict Resolution)',
    description: 'Customer specifies a new delivery address not on file. Agent holds the order, prompts coordinator in Teams to select alternative or register new address.',
    emailSender: 'operations@vanguardsys.com',
    emailSubject: 'Vanguard Systems Order - PO-2026-302',
    emailBody: `Hello,

Here is our purchase order PO-2026-302 for 100 steel brackets. 
NOTE: We need these delivered to our new engineering office at 123 Random Lane, Seattle, WA 98101, NOT our usual Boston address.

Thanks,
Sarah Connor
Vanguard Systems LLC`,
    attachmentName: 'Vanguard_PO_302.pdf',
    attachmentType: 'pdf',
    attachmentContent: {
      customerName: 'Vanguard Systems LLC',
      poNumber: 'PO-2026-302',
      deliveryAddress: '123 Random Lane, Seattle, WA 98101',
      lines: [
        { partNo: 'ACME-BRKT-99', qty: 100, uom: 'PCS', price: 45.00 }
      ]
    },
    boundingBoxes: [
      { id: '1', x: 8, y: 6, w: 25, h: 5, label: 'Document Title', value: 'PURCHASE ORDER' },
      { id: '2', x: 8, y: 14, w: 35, h: 5, label: 'Client', value: 'Vanguard Systems LLC' },
      { id: '3', x: 55, y: 14, w: 35, h: 5, label: 'PO Ref', value: 'PO-2026-302' },
      { id: '4', x: 8, y: 22, w: 50, h: 10, label: 'Custom Address', value: '123 Random Lane, Seattle, WA 98101' },
      { id: '5', x: 8, y: 40, w: 75, h: 6, label: 'Item line', value: 'ACME-BRKT-99 | 100 PCS | $45.00' }
    ]
  }
];

const STEPS = [
  'INGEST',
  'OCR_PARSE',
  'GET_DEFAULTS',
  'GET_CUSTOMER',
  'CHECK_PO',
  'RESOLVE_PART',
  'MATCH_ADDRESS',
  'CREATE_ORDER',
  'NOTIFY'
];

export const SimulatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    mode: 'reasoning',
    reasoningEffort: 'medium',
    verbosity: 'verbose',
    concurrent: false
  });

  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null);
  const [activeOrder, setActiveOrder] = useState<SalesOrder | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [exceptions, setExceptions] = useState<TeamsException[]>([]);
  const [comms, setComms] = useState<CustomerComm[]>([]);
  const [erpOrders, setErpOrders] = useState<SalesOrder[]>([]);
  const [erpCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [erpParts, setErpParts] = useState<PartInfo[]>(MOCK_PARTS);
  const [erpCrossRefs] = useState<PartCrossReference[]>(MOCK_CROSS_REFS);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('IDLE');
  const [stepIndex, setStepIndex] = useState<number>(-1);

  const timerRef = useRef<number | null>(null);
  const stepIndexRef = useRef<number>(-1);
  const orderRef = useRef<SalesOrder | null>(null);

  const addLog = (type: LogType, step: string, message: string, details?: any) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      step,
      message,
      details: details ? JSON.stringify(details, null, 2) : undefined
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const getDelay = () => {
    let delay = 1800; // Standard speed
    if (agentConfig.mode === 'reasoning') {
      if (agentConfig.reasoningEffort === 'low') delay = 1400;
      if (agentConfig.reasoningEffort === 'medium') delay = 2200;
      if (agentConfig.reasoningEffort === 'high') delay = 3500;
    } else {
      delay = 1000; // Basic mode is faster, less thinking
    }
    return delay;
  };

  const runScenario = (scenarioId: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const scenario = MOCK_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    // Reset current run state
    setActiveScenario(scenario);
    setIsProcessing(true);
    setLogs([]);
    setExceptions([]);
    setStepIndex(0);
    stepIndexRef.current = 0;
    setCurrentStep('INGEST');

    // Create base draft sales order
    const draftOrder: SalesOrder = {
      id: `SO-${Math.floor(100000 + Math.random() * 900000)}`,
      poNumber: scenario.attachmentContent.poNumber,
      customerId: '',
      customerName: scenario.attachmentContent.customerName,
      siteId: '',
      coordinator: '',
      status: 'draft',
      lines: [],
      totalValue: 0,
      deliveryAddress: scenario.attachmentContent.deliveryAddress,
      dateCreated: new Date().toLocaleDateString()
    };
    setActiveOrder(draftOrder);
    orderRef.current = draftOrder;

    addLog('info', 'INGEST', `Starting ingestion for scenario: ${scenario.title}`);
    addLog('tool_call', 'INGEST', 'Monitoring inbox 24/7. Scanning email.', {
      sender: scenario.emailSender,
      subject: scenario.emailSubject,
      attachment: scenario.attachmentName
    });

    // Start execution loop
    scheduleNextStep();
  };

  const scheduleNextStep = () => {
    const delay = getDelay();
    timerRef.current = window.setTimeout(() => {
      executeStep();
    }, delay);
  };

  const executeStep = () => {
    const currentIdx = stepIndexRef.current;
    if (currentIdx < 0 || currentIdx >= STEPS.length) {
      setIsProcessing(false);
      setCurrentStep('COMPLETED');
      return;
    }

    const stepName = STEPS[currentIdx];
    setCurrentStep(stepName);

    if (agentConfig.mode === 'reasoning') {
      addLog('reasoning', stepName, `[Reasoning Mode: ${agentConfig.reasoningEffort}] Analyzing structure and validating rules for ${stepName}...`);
    }

    let nextStepIndex = currentIdx + 1;
    let shouldPause = false;

    switch (stepName) {
      case 'INGEST':
        addLog('tool_response', 'INGEST', `Email ingested successfully. Found attachment: ${activeScenario?.attachmentName}`);
        break;

      case 'OCR_PARSE':
        addLog('tool_call', 'OCR_PARSE', 'Executing Image-to-Text OCR Parsing.', {
          file: activeScenario?.attachmentName,
          type: activeScenario?.attachmentType
        });
        addLog('tool_response', 'OCR_PARSE', 'OCR Complete. Extracted parameters:', activeScenario?.attachmentContent);
        break;

      case 'GET_DEFAULTS':
        addLog('tool_call', 'GET_DEFAULTS', 'Retrieving Coordinator & Site Defaults for site assignment.');
        // We set defaults based on matching customer if found later, but let's grab system defaults first
        addLog('tool_response', 'GET_DEFAULTS', 'System Defaults Retrieved:', {
          defaultSite: 'SITE-US-01',
          coordinator: 'Alice Johnson'
        });
        break;

      case 'GET_CUSTOMER':
        addLog('tool_call', 'GET_CUSTOMER', 'Searching Customer database with name:', {
          query: activeScenario?.attachmentContent.customerName
        });
        const matchedCust = erpCustomers.find(
          (c) => c.name.toLowerCase() === activeScenario?.attachmentContent.customerName.toLowerCase()
        );

        if (matchedCust) {
          if (orderRef.current) {
            orderRef.current = {
              ...orderRef.current,
              customerId: matchedCust.id,
              siteId: matchedCust.siteId,
              coordinator: matchedCust.coordinator
            };
            setActiveOrder(orderRef.current);
          }
          addLog('tool_response', 'GET_CUSTOMER', `Customer matched successfully: ${matchedCust.name} (${matchedCust.id})`, matchedCust);
        } else {
          addLog('error', 'GET_CUSTOMER', 'CRITICAL: Customer Name could not be resolved against DB.');
        }
        break;

      case 'CHECK_PO':
        addLog('tool_call', 'CHECK_PO', `Checking if PO number ${activeScenario?.attachmentContent.poNumber} already exists in ERP to prevent duplication.`);
        // Check if there is an existing order with this PO
        const isDuplicate = erpOrders.some(
          (o) => o.poNumber === activeScenario?.attachmentContent.poNumber && o.customerId === orderRef.current?.customerId
        );
        if (isDuplicate) {
          addLog('error', 'CHECK_PO', `DUPLICATE DETECTED: PO Number ${activeScenario?.attachmentContent.poNumber} has been used previously.`);
          setIsProcessing(false);
          if (orderRef.current) {
            orderRef.current = { ...orderRef.current, status: 'exception' };
            setActiveOrder(orderRef.current);
          }
          return; // Stop simulation
        } else {
          addLog('tool_response', 'CHECK_PO', 'Uniqueness verified. PO has not been used before.');
        }
        break;

      case 'RESOLVE_PART':
        addLog('tool_call', 'RESOLVE_PART', 'Cross-referencing part numbers and verifying quantities.', activeScenario?.attachmentContent.lines);
        
        const solvedLines: SalesOrderLine[] = [];
        let partError = false;

        activeScenario?.attachmentContent.lines.forEach((line) => {
          const crossRef = erpCrossRefs.find((xr) => xr.customerPartNo === line.partNo);
          
          if (!crossRef) {
            partError = true;
            addLog('warn', 'RESOLVE_PART', `PART NOT FOUND: Customer Part Number "${line.partNo}" is not registered.`);
          } else if (line.partNo === 'APEX-CO-HS-OLD') {
            // Discontinued part triggers exception
            partError = true;
            addLog('warn', 'RESOLVE_PART', `DISCONTINUED PART DETECTED: "${line.partNo}" is marked as legacy.`);
            
            // Generate Teams exception
            const exceptionId = `EX-${Math.floor(1000 + Math.random() * 9000)}`;
            const newEx: TeamsException = {
              id: exceptionId,
              orderId: orderRef.current?.id || '',
              poNumber: orderRef.current?.poNumber || '',
              customerName: orderRef.current?.customerName || '',
              type: 'part_resolution',
              message: `Apex Tech ordered discontinued part code APEX-CO-HS-OLD. Recommended replacement: S-PART-103 (Industrial Copper Heat Sink).`,
              options: [
                'Replace with active S-PART-103 ($89.90)',
                'Hold order and contact buyer for clarification',
                'Cancel order line item and proceed'
              ],
              resolved: false,
              timestamp: new Date().toLocaleTimeString()
            };
            setExceptions((prev) => [...prev, newEx]);
            shouldPause = true;
            addLog('info', 'RESOLVE_PART', `Awaiting coordinator resolution via Microsoft Teams exception channel (ID: ${exceptionId}).`);
          } else {
            // Found and active
            const finalQty = line.qty * crossRef.conversionFactor;
            const lineTotal = finalQty * crossRef.unitPrice;
            
            solvedLines.push({
              customerPartNo: line.partNo,
              salesPartNo: crossRef.salesPartNo,
              description: crossRef.salesDescription,
              quantity: finalQty,
              customerQty: line.qty,
              customerUom: crossRef.customerUom,
              salesUom: crossRef.salesUom,
              unitPrice: crossRef.unitPrice,
              totalPrice: lineTotal
            });

            if (crossRef.conversionFactor !== 1) {
              addLog('info', 'RESOLVE_PART', `Applied quantity conversion for "${line.partNo}": converted ${line.qty} ${crossRef.customerUom} to ${finalQty} ${crossRef.salesUom} (Factor: 1:${crossRef.conversionFactor}).`);
            }
          }
        });

        if (partError) {
          if (orderRef.current) {
            orderRef.current = {
              ...orderRef.current,
              status: 'exception'
            };
            setActiveOrder(orderRef.current);
          }
          if (shouldPause) {
            setIsProcessing(false);
            return; // Wait for Teams button click
          } else {
            setIsProcessing(false);
            return; // Unresolved error
          }
        } else {
          const totalVal = solvedLines.reduce((acc, curr) => acc + curr.totalPrice, 0);
          if (orderRef.current) {
            orderRef.current = {
              ...orderRef.current,
              lines: solvedLines,
              totalValue: totalVal
            };
            setActiveOrder(orderRef.current);
          }
          addLog('tool_response', 'RESOLVE_PART', 'Product & Quantities validated. All lines resolved successfully.', solvedLines);
        }
        break;

      case 'MATCH_ADDRESS':
        addLog('tool_call', 'MATCH_ADDRESS', 'Retrieving registered addresses and matching delivery request.');
        const customerProfile = erpCustomers.find((c) => c.id === orderRef.current?.customerId);
        const reqAddr = activeScenario?.attachmentContent.deliveryAddress || '';
        
        if (customerProfile) {
          const exactMatch = customerProfile.addresses.some(
            (addr) => addr.toLowerCase().replace(/\s/g, '') === reqAddr.toLowerCase().replace(/\s/g, '')
          );

          if (exactMatch) {
            addLog('tool_response', 'MATCH_ADDRESS', `Address matched perfectly with profile registry: "${reqAddr}"`);
          } else {
            // New Address Clash
            addLog('warn', 'MATCH_ADDRESS', `ADDRESS CLASH: Requested delivery address "${reqAddr}" does not match registered addresses.`);
            
            const exceptionId = `EX-${Math.floor(1000 + Math.random() * 9000)}`;
            const newEx: TeamsException = {
              id: exceptionId,
              orderId: orderRef.current?.id || '',
              poNumber: orderRef.current?.poNumber || '',
              customerName: orderRef.current?.customerName || '',
              type: 'address_resolution',
              message: `Vanguard Systems ordered shipping to 123 Random Lane, Seattle, WA but only has Boston on file.`,
              options: [
                'Approve custom shipping address and update customer file',
                'Ship to standard billing address (500 Innovation Ave, Boston)',
                'Hold order for customer call'
              ],
              resolved: false,
              timestamp: new Date().toLocaleTimeString()
            };
            setExceptions((prev) => [...prev, newEx]);
            shouldPause = true;
            addLog('info', 'MATCH_ADDRESS', `Awaiting address authorization in Microsoft Teams (ID: ${exceptionId}).`);
          }
        } else {
          addLog('error', 'MATCH_ADDRESS', 'Could not read customer addresses.');
        }

        if (shouldPause) {
          if (orderRef.current) {
            orderRef.current = { ...orderRef.current, status: 'exception' };
            setActiveOrder(orderRef.current);
          }
          setIsProcessing(false);
          return;
        }
        break;

      case 'CREATE_ORDER':
        addLog('tool_call', 'CREATE_ORDER', 'Submitting order packet payload to IFS Cloud ERP REST API.');
        
        if (orderRef.current) {
          orderRef.current = {
            ...orderRef.current,
            status: 'processing'
          };
          setActiveOrder(orderRef.current);
        }

        // Add to permanent ERP orders list
        setErpOrders((prev) => {
          // Check if it already exists, replace it, otherwise append
          const exists = prev.some((o) => o.id === orderRef.current?.id);
          if (exists) {
            return prev.map((o) => (o.id === orderRef.current?.id ? orderRef.current! : o));
          }
          return [...prev, orderRef.current!];
        });

        // Deduct inventory parts stock
        if (orderRef.current) {
          setErpParts((prevParts) =>
            prevParts.map((part) => {
              const orderedLine = orderRef.current?.lines.find((l) => l.salesPartNo === part.salesPartNo);
              if (orderedLine) {
                return {
                  ...part,
                  stock: Math.max(0, part.stock - orderedLine.quantity)
                };
              }
              return part;
            })
          );
        }

        addLog('tool_response', 'CREATE_ORDER', `IFS Cloud response: Sales Order "${orderRef.current?.id}" created successfully in status "UNRELEASED".`);
        break;

      case 'NOTIFY':
        addLog('info', 'NOTIFY', 'Drafting outbound communications and updating channels.');
        
        const customerEmail = activeScenario?.emailSender || 'customer@client.com';
        const mailBody = `Dear Customer,

We are pleased to confirm that your Purchase Order ${orderRef.current?.poNumber} has been received and processed successfully.
Your internal Sales Order Number is ${orderRef.current?.id}.

Total Lines: ${orderRef.current?.lines.length}
Total Value: $${orderRef.current?.totalValue.toFixed(2)}
Delivery Address: ${orderRef.current?.deliveryAddress}

Thank you for your business.

Sincerely,
Customer Coordinator
IFS Order Processing Engine`;

        const newComm: CustomerComm = {
          id: `CM-${Math.floor(10000 + Math.random() * 90000)}`,
          timestamp: new Date().toLocaleTimeString(),
          orderId: orderRef.current?.id || '',
          to: customerEmail,
          subject: `Order Confirmation - Sales Order ${orderRef.current?.id} [PO: ${orderRef.current?.poNumber}]`,
          body: mailBody,
          type: 'confirmation'
        };

        setComms((prev) => [newComm, ...prev]);
        addLog('info', 'NOTIFY', `Email alert dispatched to customer coordinator: "${newComm.subject}"`);

        if (orderRef.current) {
          orderRef.current = {
            ...orderRef.current,
            status: 'completed'
          };
          setActiveOrder(orderRef.current);
          
          // Update order status in ERP records list
          setErpOrders((prev) =>
            prev.map((o) => (o.id === orderRef.current?.id ? orderRef.current! : o))
          );
        }
        
        setIsProcessing(false);
        addLog('info', 'NOTIFY', `Customer Order Manager successfully processed PO ${orderRef.current?.poNumber}. Execution closed.`);
        break;
    }

    if (!shouldPause) {
      setStepIndex(nextStepIndex);
      stepIndexRef.current = nextStepIndex;
      scheduleNextStep();
    }
  };

  const resolveException = (exceptionId: string, choice: string) => {
    // Mark the exception as resolved
    setExceptions((prev) =>
      prev.map((ex) => (ex.id === exceptionId ? { ...ex, resolved: true, resolutionChoice: choice } : ex))
    );

    const activeEx = exceptions.find((ex) => ex.id === exceptionId);
    if (!activeEx) return;

    addLog('info', 'TEAMS_ACTION', `Teams input received from coordinator: "${choice}"`);

    // Resume the process based on exception type and choice
    if (activeEx.type === 'part_resolution') {
      if (choice.includes('Replace with active S-PART-103')) {
        // Resolve discontinued part mapping to active
        const line = activeScenario?.attachmentContent.lines[0]; // Scenario C has 1 line
        if (line && orderRef.current) {
          const crossRef = erpCrossRefs.find((xr) => xr.customerPartNo === 'APEX-CO-HS'); // active product cross ref
          if (crossRef) {
            const finalQty = line.qty * crossRef.conversionFactor;
            const lineTotal = finalQty * crossRef.unitPrice;

            const solvedLines: SalesOrderLine[] = [
              {
                customerPartNo: line.partNo,
                salesPartNo: crossRef.salesPartNo,
                description: crossRef.salesDescription,
                quantity: finalQty,
                customerQty: line.qty,
                customerUom: crossRef.customerUom,
                salesUom: crossRef.salesUom,
                unitPrice: crossRef.unitPrice,
                totalPrice: lineTotal
              }
            ];

            orderRef.current = {
              ...orderRef.current,
              lines: solvedLines,
              totalValue: lineTotal,
              status: 'draft' // Reset back to processing
            };
            setActiveOrder(orderRef.current);
            addLog('info', 'RESOLVE_PART', `Discontinued part code resolved. Swapped "APEX-CO-HS-OLD" for active sales part "${crossRef.salesPartNo}" at pricing $${crossRef.unitPrice}.`);
          }
        }
      } else if (choice.includes('Hold order')) {
        addLog('warn', 'RESOLVE_PART', 'Order held manually. Contacting customer purchasing officer.');
        setIsProcessing(false);
        return;
      } else {
        addLog('info', 'RESOLVE_PART', 'Cancelled order line item. Proceeding with empty lines.');
      }
    } else if (activeEx.type === 'address_resolution') {
      if (choice.includes('Approve custom shipping address')) {
        // We approve Vanguard's custom address
        if (orderRef.current) {
          orderRef.current = {
            ...orderRef.current,
            status: 'draft'
          };
          setActiveOrder(orderRef.current);
          addLog('info', 'MATCH_ADDRESS', `Custom address "${orderRef.current.deliveryAddress}" authorized and registered to customer record.`);
        }
      } else if (choice.includes('Ship to standard billing address')) {
        if (orderRef.current) {
          orderRef.current = {
            ...orderRef.current,
            deliveryAddress: '500 Innovation Ave, Boston, MA 02110',
            status: 'draft'
          };
          setActiveOrder(orderRef.current);
          addLog('info', 'MATCH_ADDRESS', 'Shipping address overridden to standard profile billing address: 500 Innovation Ave, Boston.');
        }
      } else {
        addLog('warn', 'MATCH_ADDRESS', 'Order held in pending authorization bucket. Awaiting direct phone confirmation.');
        setIsProcessing(false);
        return;
      }
    }

    // Resume processing: advance to next step
    setIsProcessing(true);
    const nextIdx = stepIndexRef.current + 1;
    setStepIndex(nextIdx);
    stepIndexRef.current = nextIdx;
    
    // Resume execution loops
    scheduleNextStep();
  };

  const resetSimulation = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setActiveScenario(null);
    setActiveOrder(null);
    setLogs([]);
    setExceptions([]);
    setComms([]);
    setErpOrders([]);
    setErpParts(MOCK_PARTS);
    setIsProcessing(false);
    setCurrentStep('IDLE');
    setStepIndex(-1);
    stepIndexRef.current = -1;
  };

  return (
    <SimulatorContext.Provider
      value={{
        agentConfig,
        setAgentConfig,
        scenarios: MOCK_SCENARIOS,
        activeScenario,
        activeOrder,
        logs,
        exceptions,
        comms,
        erpOrders,
        erpCustomers,
        erpParts,
        erpCrossRefs,
        isProcessing,
        currentStep,
        stepIndex,
        runScenario,
        resolveException,
        resetSimulation
      }}
    >
      {children}
    </SimulatorContext.Provider>
  );
};

export const useSimulator = () => {
  const context = useContext(SimulatorContext);
  if (!context) {
    throw new Error('useSimulator must be used within a SimulatorProvider');
  }
  return context;
};
