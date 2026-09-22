import { Voucher } from "../models/Voucher";
import { VoucherEntry } from "../models/VoucherEntry";
import { Account } from "../models/Account";

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

export type VoucherRowInput = {
  accountId: number;
  side: "debit" | "credit";
  amount: number;
};

const isBusinessAccount = (account: Account) => account.number === "1930";

export function buildVoucherEntries(rows: VoucherRowInput[], accounts: Account[]): VoucherEntry[] {
  const entries: VoucherEntry[] = [];

  for (const row of rows) {
    if (!Number.isFinite(row.amount) || row.amount <= 0) {
      throw new Error("Varje rad måste ha ett positivt belopp.");
    }

    const account = accounts.find((item) => item.id === row.accountId && item.active);
    if (!account) {
      throw new Error("Valt konto finns inte eller är inte aktivt.");
    }

    const sameAccountUsedTwice = entries.some((entry) => entry.accountId === account.id);
    if (sameAccountUsedTwice && !isBusinessAccount(account)) {
      throw new Error("Ett konto kan bara användas en gång per verifikation.");
    }

    if (row.side !== "debit" && row.side !== "credit") {
      throw new Error("Ogiltig radtyp.");
    }

    entries.push(
      row.side === "debit"
        ? { accountId: account.id, debit: row.amount, credit: 0 }
        : { accountId: account.id, debit: 0, credit: row.amount }
    );
  }

  return entries;
}

export function areEntriesBalanced(entries: VoucherEntry[]): boolean {
  const debitTotal = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const creditTotal = entries.reduce((sum, entry) => sum + entry.credit, 0);
  return debitTotal === creditTotal;
}

