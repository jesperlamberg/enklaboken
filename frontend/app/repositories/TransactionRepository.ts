import { promises as fs } from "node:fs";
import path from "node:path";
import { Transaction } from "../models/Transaction";

const TRANSACTIONS_FILE_PATH = path.join(process.cwd(), "app", "data", "transactions.json");

export async function readTransactions(): Promise<Transaction[]> {
  try {
    const fileContents = await fs.readFile(TRANSACTIONS_FILE_PATH, "utf8");
    return JSON.parse(fileContents) as Transaction[];
  } catch {
    return [];
  }
}

export async function writeTransactions(transactions: Transaction[]): Promise<void> {
  await fs.writeFile(TRANSACTIONS_FILE_PATH, `${JSON.stringify(transactions, null, 2)}\n`, "utf8");
}

export async function readTransactionById(id: number): Promise<Transaction | undefined> {
  const transactions = await readTransactions();
  return transactions.find((tx) => tx.id === id);
}
