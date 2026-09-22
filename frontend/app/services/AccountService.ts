import { Account, AccountType } from "../models/Account";
import { Voucher } from "../models/Voucher";

export function isVatAccount(account: Account): boolean {
  return account.number.startsWith("26") || account.name.toLowerCase().includes("moms");
}

export function getVatAccounts(accounts: Account[], excludeId?: number): Account[] {
  return accounts.filter((a) => a.type === "virtual" && isVatAccount(a) && a.id !== excludeId);
}

export function hasPostedEntries(accountId: number, vouchers: Voucher[]): boolean {
  return vouchers.some((voucher) =>
    voucher.entries.some((entry) => entry.accountId === accountId)
  );
}

export function createAccount(
  accounts: Account[],
  params: {
    number: string;
    name: string;
    type: AccountType;
    defaultVatRate?: number;
    vatAccountId?: number;
    description?: string;
  }
): Account {
  const trimmedNumber = params.number.trim();
  const trimmedName = params.name.trim();

  if (!trimmedNumber) {
    throw new Error("Kontonummer måste anges.");
  }

  if (!trimmedName) {
    throw new Error("Kontonamn måste anges.");
  }

  if (accounts.some((acc) => acc.number === trimmedNumber)) {
    throw new Error(`Kontonummer ${trimmedNumber} finns redan.`);
  }

  const nextId = accounts.length === 0
    ? 1
    : Math.max(...accounts.map((account) => account.id)) + 1;

  return {
    id: nextId,
    number: trimmedNumber,
    name: trimmedName,
    type: params.type,
    defaultVatRate: params.defaultVatRate,
    vatAccountId: params.vatAccountId,
    description: params.description?.trim(),
    active: true,
  };
}

