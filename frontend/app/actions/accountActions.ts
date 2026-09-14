"use server";

import { revalidatePath } from "next/cache";
import { Account, AccountType } from "../models/Account";
import { createAccount } from "../services/AccountService";
import { readAccounts, writeAccounts } from "../repositories/AccountRepository";

export async function saveAccount(input: {
  number: string;
  name: string;
  type: AccountType;
  defaultVatRate?: number;
  vatAccountId?: number;
  description?: string;
}): Promise<Account> {
  const accounts = await readAccounts();
  const account = createAccount(accounts, {
    number: input.number,
    name: input.name,
    type: input.type,
    defaultVatRate: input.defaultVatRate,
    vatAccountId: input.vatAccountId,
    description: input.description,
  });

  const nextAccounts = [...accounts, account];
  await writeAccounts(nextAccounts);

  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath("/create-account");
  revalidatePath("/create-transaction");

  return account;
}

export async function updateAccount(
  accountId: number,
  input: {
    number: string;
    name: string;
    type: AccountType;
    defaultVatRate?: number;
    vatAccountId?: number;
    description?: string;
  }
): Promise<Account> {
  const accounts = await readAccounts();
  const index = accounts.findIndex((account) => account.id === accountId);

  if (index < 0) {
    throw new Error("Kontot hittades inte.");
  }

  const existing = accounts[index];
  const number = input.number.trim();
  const name = input.name.trim();

  if (!number || !name) {
    throw new Error("Kontonummer och kontonamn måste anges.");
  }

  const nextAccount: Account = {
    ...existing,
    number,
    name,
    type: input.type,
    defaultVatRate: input.defaultVatRate,
    vatAccountId: input.vatAccountId,
    description: input.description?.trim() || undefined,
  };

  const nextAccounts = accounts.toSpliced(index, 1, nextAccount);
  await writeAccounts(nextAccounts);

  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${accountId}`);
  revalidatePath(`/accounts/${accountId}/edit`);

  return nextAccount;
}

export async function toggleAccountActive(accountId: number): Promise<Account> {
  const accounts = await readAccounts();
  const index = accounts.findIndex((account) => account.id === accountId);

  if (index < 0) {
    throw new Error("Kontot hittades inte.");
  }

  const existing = accounts[index];
  const nextAccount: Account = {
    ...existing,
    active: !existing.active,
  };

  const nextAccounts = accounts.toSpliced(index, 1, nextAccount);
  await writeAccounts(nextAccounts);

  revalidatePath("/");
  revalidatePath("/accounts");

  return nextAccount;
}

