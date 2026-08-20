import { VoucherEntry } from "./VoucherEntry";

export type Voucher = {
  id: number;
  voucherNumber: number;
  date: string;
  description: string;
  entries: VoucherEntry[];
}
