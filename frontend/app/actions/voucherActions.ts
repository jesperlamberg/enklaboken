"use server";

import { revalidatePath } from "next/cache";
import { readAccounts } from "../repositories/AccountRepository";
import { getNextVoucherId, getNextVoucherNumber, readVouchers, writeVouchers } from "../repositories/VoucherRepository";
import { Voucher } from "../models/Voucher";
import { buildVoucherEntries, areEntriesBalanced, VoucherRowInput } from "../services/VoucherService";

export type VoucherDirection = "debit" | "credit";

export async function saveVoucher(input: {
  direction: VoucherDirection;
  date: string;
  description: string;
  entries: VoucherRowInput[];
}): Promise<Voucher> {
  const date = input.date.trim();
  const description = input.description.trim();

  if (!date) {
    throw new Error("Datum krävs.");
  }

  if (!description) {
    throw new Error("Beskrivning krävs.");
  }

  if (!Array.isArray(input.entries) || input.entries.length < 2) {
    throw new Error("Minst två rader krävs.");
  }

  const accounts = await readAccounts();
  const nextEntries = buildVoucherEntries(input.entries, accounts);

  if (!areEntriesBalanced(nextEntries)) {
    throw new Error("Debet och kredit måste vara lika stora.");
  }

  const vouchers = await readVouchers();
  const nextId = getNextVoucherId(vouchers);
  const nextVoucherNumber = getNextVoucherNumber(vouchers);

  const nextVoucher: Voucher = {
    id: nextId,
    voucherNumber: nextVoucherNumber,
    date,
    description,
    entries: nextEntries,
  };

  const nextVouchers = [...vouchers, nextVoucher];
  await writeVouchers(nextVouchers);

  revalidatePath("/");
  revalidatePath("/create-account");
  revalidatePath("/create-debit");
  revalidatePath("/create-credit");

  return nextVoucher;
}

export async function saveDebitVoucher(input: {
  date: string;
  description: string;
  entries: VoucherRowInput[];
}): Promise<Voucher> {
  return saveVoucher({ ...input, direction: "debit" });
}

export async function saveCreditVoucher(input: {
  date: string;
  description: string;
  entries: VoucherRowInput[];
}): Promise<Voucher> {
  return saveVoucher({ ...input, direction: "credit" });
}
