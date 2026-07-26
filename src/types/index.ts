export type AgentMode = 'basic' | 'reasoning';
export type ReasoningEffort = 'low' | 'medium' | 'high';
export type LogType = 'info' | 'warn' | 'error' | 'tool_call' | 'tool_response' | 'reasoning';
export type OrderStatus = 'draft' | 'verifying' | 'exception' | 'processing' | 'completed';

export interface AgentConfig {
  mode: AgentMode;
  reasoningEffort: ReasoningEffort;
  verbosity: 'standard' | 'verbose';
  concurrent: boolean;
}

export interface SalesOrderLine {
  customerPartNo: string;
  salesPartNo: string;
  description: string;
  quantity: number; // resolved in sales UoM
  customerQty: number; // original quantity
  customerUom: string;
  salesUom: string;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesOrder {
  id: string; // ERP Sales Order ID
  poNumber: string;
  customerId: string;
  customerName: string;
  siteId: string;
  coordinator: string;
  status: OrderStatus;
  lines: SalesOrderLine[];
  totalValue: number;
  deliveryAddress: string;
  dateCreated: string;
}

export interface Customer {
  id: string;
  name: string;
  siteId: string;
  coordinator: string;
  addresses: string[];
}

export interface PartCrossReference {
  customerPartNo: string;
  salesPartNo: string;
  salesDescription: string;
  conversionFactor: number; // customerQty * factor = salesQty
  customerUom: string;
  salesUom: string;
  unitPrice: number;
}

export interface PartInfo {
  salesPartNo: string;
  description: string;
  unitPrice: number;
  stock: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: LogType;
  step: string;
  message: string;
  details?: string; // JSON string or text details
}

export interface BoundingBox {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  w: number; // percentage width
  h: number; // percentage height
  label: string;
  value: string;
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  emailSubject: string;
  emailBody: string;
  emailSender: string;
  attachmentName: string;
  attachmentType: 'pdf' | 'image' | 'excel';
  attachmentContent: {
    customerName: string;
    poNumber: string;
    deliveryAddress: string;
    lines: Array<{
      partNo: string;
      qty: number;
      uom: string;
      price: number;
    }>;
  };
  boundingBoxes?: BoundingBox[];
}

export interface TeamsException {
  id: string;
  orderId: string;
  poNumber: string;
  customerName: string;
  type: 'part_resolution' | 'address_resolution' | 'price_override';
  message: string;
  options: string[];
  resolved: boolean;
  resolutionChoice?: string;
  timestamp: string;
}
export interface CustomerComm {
  id: string;
  timestamp: string;
  orderId: string;
  to: string;
  subject: string;
  body: string;
  type: 'acknowledgement' | 'query' | 'confirmation' | 'exception_update';
}
