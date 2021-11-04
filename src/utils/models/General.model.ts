export type GoFn = (page: string) => void

export interface QR {
  data: string
  scanDate: number
  hash: string
}
