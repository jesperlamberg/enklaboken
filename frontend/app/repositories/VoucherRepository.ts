import { promises as fs } from "node:fs";
import path from "node:path";
import { Voucher } from "../models/Voucher";

const VOUCHERS_FILE_PATH = path.join(process.cwd(), "app", "data", "vouchers.json");

export async function readVouchers(): Promise<Voucher[]> {
  const fileContents = await fs.readFile(VOUCHERS_FILE_PATH, "utf8");
  return JSON.parse(fileContents) as Voucher[];
}

export async function writeVouchers(vouchers: Voucher[]): Promise<void> {
  await fs.writeFile(VOUCHERS_FILE_PATH, `${JSON.stringify(vouchers, null, 2)}\n`, "utf8");
}

export function getNextVoucherId(vouchers: Voucher[]): number {
  return vouchers.length === 0 ? 1 : Math.max(...vouchers.map((voucher) => voucher.id)) + 1;
}

export const nextVoucherId = getNextVoucherId;

export function getNextVoucherNumber(vouchers: Voucher[]): number {
  return vouchers.length === 0 ? 1 : Math.max(...vouchers.map((voucher) => voucher.voucherNumber)) + 1;
}

export const nextVoucherNumber = getNextVoucherNumber;
