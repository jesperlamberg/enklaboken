"use server";

import { revalidatePath } from "next/cache";
import { readAccounts } from "../repositories/AccountRepository";
import { getNextVoucherId, getNextVoucherNumber, readVouchers, writeVouchers } from "../repositories/VoucherRepository";
import { Voucher } from "../models/Voucher";
import { VoucherEntry } from "../models/VoucherEntry";
import { Account } from "../models/Account";

export type VoucherDirection = "debit" | "credit";

const isBusinessAccount = (account: Account) => account.number === "1930";

export type VoucherRowInput = {
  accountId: number;
  side: "debit" | "credit";
  amount: number;
};

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
  const nextEntries: VoucherEntry[] = [];
  let debitTotal = 0;
  let creditTotal = 0;

  for (const row of input.entries) {
    if (!Number.isFinite(row.amount) || row.amount <= 0) {
      throw new Error("Varje rad måste ha ett positivt belopp.");
    }

    const account = accounts.find((item) => item.id === row.accountId && item.active);
    if (!account) {
      throw new Error("Valt konto finns inte eller är inte aktivt.");
    }

    const sameAccountUsedTwice = nextEntries.some((entry) => entry.accountId === account.id);
    if (sameAccountUsedTwice && !isBusinessAccount(account)) {
      throw new Error("Ett konto kan bara användas en gång per verifikation.");
    }

    const side = row.side;
    if (side !== "debit" && side !== "credit") {
      throw new Error("Ogiltig radtyp.");
    }

    if (account.normalBalance !== side && !isBusinessAccount(account)) {
      throw new Error(
        side === "debit"
          ? "Debet-rader får bara peka till debetkonton."
          : "Kredit-rader får bara peka till kreditkonton."
      );
    }

    const nextEntry: VoucherEntry =
      side === "debit"
        ? { accountId: account.id, debit: row.amount, credit: 0 }
        : { accountId: account.id, debit: 0, credit: row.amount };

    nextEntries.push(nextEntry);

    if (side === "debit") {
      debitTotal += row.amount;
    } else {
      creditTotal += row.amount;
    }
  }

  if (debitTotal !== creditTotal) {
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
