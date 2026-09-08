import { promises as fs } from "node:fs";
import path from "node:path";
import { Account } from "../models/Account";
import { readVouchers } from "./VoucherRepository";

const ACCOUNTS_FILE_PATH = path.join(process.cwd(), "app", "data", "accounts.json");

export async function readAccounts(): Promise<Account[]> {
  const fileContents = await fs.readFile(ACCOUNTS_FILE_PATH, "utf8");
  return JSON.parse(fileContents) as Account[];
}

export async function writeAccounts(accounts: Account[]): Promise<void> {
  await fs.writeFile(ACCOUNTS_FILE_PATH, `${JSON.stringify(accounts, null, 2)}\n`, "utf8");
}

export async function hasPostedEntries(accountId: number): Promise<boolean> {
  const vouchers = await readVouchers();

  return vouchers.some((voucher) =>
    voucher.entries.some((entry) => entry.accountId === accountId)
  );
}

export async function readAccountById(id: number): Promise<Account | undefined> {
  const accounts = await readAccounts();
  return accounts.find((account) => account.id === id);
}
