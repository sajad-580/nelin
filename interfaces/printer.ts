export enum PrinterStatus {
  INACTIVE = "inactive",
  READY = "ready",
  BUSY = "busy"
}

export default interface IPrinter {
  id?: string;
  name: string;
  page?: string;
  status?: PrinterStatus;
}

export interface SendPrintType {
  printer?: any,
  printType?: any,
  order: any,
  p_bill?: any,
  reprint?: any,
  isUpdate?: boolean
}