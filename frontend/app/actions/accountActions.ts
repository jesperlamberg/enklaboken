"use server";

import { revalidatePath } from "next/cache";
import { Account } from "../models/Account";
import { createAccount } from "../services/AccountService";
import { hasPostedEntries, readAccounts, writeAccounts } from "../repositories/AccountRepository";

export async function saveAccount(input: {
  number: string;
  name: string;
  normalBalance: Account["normalBalance"];
}): Promise<Account> {
  const number = input.number.trim();
  const name = input.name.trim();

  if (!number || !name || !input.normalBalance) {
    throw new Error("Konto måste ha nummer, namn och typ.");
  }

  const accounts = await readAccounts();
  const account = createAccount(accounts, number, name, input.normalBalance);
  const nextAccounts = [...accounts, account];

  await writeAccounts(nextAccounts);
  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath("/create-account");

  return account;
}

export async function updateAccount(
  accountId: number,
  input: {
    number: string;
    name: string;
    normalBalance: Account["normalBalance"];
    description?: string;
  }
): Promise<Account> {
  const accounts = await readAccounts();
  const index = accounts.findIndex((account) => account.id === accountId);

  if (index < 0) {
    throw new Error("Kontot hittades inte.");
  }

  const existing = accounts[index];
  const hasEntries = await hasPostedEntries(accountId);
  const number = input.number.trim();
  const name = input.name.trim();
  const description = input.description?.trim();

  if (!number || !name || !input.normalBalance) {
    throw new Error("Konto måste ha nummer, namn och typ.");
  }

  if (hasEntries) {
    if (number !== existing.number) {
      throw new Error("Kontonummer kan inte ändras efter bokförda transaktioner.");
    }

    if (input.normalBalance !== existing.normalBalance) {
      throw new Error("Kontotyp kan inte ändras efter bokförda transaktioner.");
    }
  }

  const nextAccount: Account = {
    ...existing,
    number,
    name,
    normalBalance: input.normalBalance,
    description: description || undefined,
  };

  const nextAccounts = accounts.toSpliced(index, 1, nextAccount);
  await writeAccounts(nextAccounts);

  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${accountId}`);
  revalidatePath(`/accounts/${accountId}/edit`);

  return nextAccount;
}

export async function closeAccount(accountId: number, closedAt: string): Promise<Account> {
  const accounts = await readAccounts();
  const index = accounts.findIndex((account) => account.id === accountId);

  if (index < 0) {
    throw new Error("Kontot hittades inte.");
  }

  if (!closedAt) {
    throw new Error("Stängningsdatum krävs.");
  }

  const existing = accounts[index];
  const nextAccount: Account = {
    ...existing,
    active: false,
    closedAt,
  };

  const nextAccounts = accounts.toSpliced(index, 1, nextAccount);
  await writeAccounts(nextAccounts);

  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${accountId}`);
  revalidatePath(`/accounts/${accountId}/close`);

  return nextAccount;
}

export async function reopenAccount(accountId: number): Promise<Account> {
  const accounts = await readAccounts();
  const index = accounts.findIndex((account) => account.id === accountId);

  if (index < 0) {
    throw new Error("Kontot hittades inte.");
  }

  const existing = accounts[index];
  const nextAccount: Account = {
    ...existing,
    active: true,
    closedAt: undefined,
  };

  const nextAccounts = accounts.toSpliced(index, 1, nextAccount);
  await writeAccounts(nextAccounts);

  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath(`/accounts/${accountId}`);
  revalidatePath(`/accounts/${accountId}/close`);

  return nextAccount;
}
