export type GoFn = (page: string) => void

export interface QR {
  data: string
  scanDate: number
  hash: string
}

export interface Friend {
  id: number
  first_name: string
  last_name: string
  sex: 2
  photo_200: string
}
