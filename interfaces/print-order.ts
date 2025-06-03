import IPrinter from 'interfaces/printer'
export interface IPrintOrder {
  printers: IPrinter[]
  totalItems: number
  orderId: number
  billUrl: string
}
