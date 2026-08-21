import { Voucher } from "../models/Voucher";

export function isBalanced(voucher: Voucher): boolean {
  const debit = voucher.entries.reduce(
    (sum, entry) => sum + entry.debit,
    0
  );

  const credit = voucher.entries.reduce(
    (sum, entry) => sum + entry.credit,
    0
  );

  return debit === credit;
}

export function getVoucherTotal(voucher: Voucher, type: "debit" | "credit") {
  return voucher.entries.reduce((total, entry) => total + entry[type], 0);
}
