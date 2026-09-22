"use server";

import { revalidatePath } from "next/cache";
import { Transaction, VirtualAllocation } from "../models/Transaction";
import { readAccounts } from "../repositories/AccountRepository";
import {
  readTransactions,
  writeTransactions,
  readTransactionById,
} from "../repositories/TransactionRepository";
import { saveReceiptFile } from "../repositories/ReceiptRepository";
import { createTransaction } from "../services/TransactionService";

export async function saveTransaction(formData: FormData): Promise<Transaction> {
  const date = (formData.get("date") as string) || new Date().toISOString().split("T")[0];
  const description = (formData.get("description") as string) || "";
  const physicalAccountId = parseInt(formData.get("physicalAccountId") as string, 10);
  const type = (formData.get("type") as "debit" | "credit") || "credit";
  const amount = parseFloat(formData.get("amount") as string) || 0;
  const receiptFile = formData.get("receipt") as File | null;
  const allocationsRaw = formData.get("virtualAllocations") as string;

  let virtualAllocations: VirtualAllocation[] = [];
  if (allocationsRaw) {
    try {
      virtualAllocations = JSON.parse(allocationsRaw);
    } catch {
      virtualAllocations = [];
    }
  }

  const { receiptUrl, receiptFileName } = await saveReceiptFile(receiptFile);

  const accounts = await readAccounts();
  const transactions = await readTransactions();

  const transaction = createTransaction(transactions, accounts, {
    date,
    description,
    physicalAccountId,
    type,
    amount,
    receiptUrl,
    receiptFileName,
    virtualAllocations,
  });

  const nextTransactions = [transaction, ...transactions];
  await writeTransactions(nextTransactions);

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/accounts");

  return transaction;
}

export async function updateTransactionAllocations(
  transactionId: number,
  allocations: VirtualAllocation[]
): Promise<Transaction> {
  const transactions = await readTransactions();
  const index = transactions.findIndex((tx) => tx.id === transactionId);

  if (index < 0) {
    throw new Error("Transaktionen hittades inte.");
  }

  const existing = transactions[index];
  const updated: Transaction = {
    ...existing,
    virtualAllocations: allocations,
  };

  const nextTransactions = transactions.toSpliced(index, 1, updated);
  await writeTransactions(nextTransactions);

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/accounts");

  return updated;
}

export async function attachReceiptToTransaction(
  transactionId: number,
  formData: FormData
): Promise<Transaction> {
  const file = formData.get("receipt") as File | null;
  if (!file) {
    throw new Error("Ingen fil vald.");
  }

  const { receiptUrl, receiptFileName } = await saveReceiptFile(file);
  const transactions = await readTransactions();
  const index = transactions.findIndex((tx) => tx.id === transactionId);

  if (index < 0) {
    throw new Error("Transaktionen hittades inte.");
  }

  const existing = transactions[index];
  const updated: Transaction = {
    ...existing,
    receiptUrl: receiptUrl || existing.receiptUrl,
    receiptFileName: receiptFileName || existing.receiptFileName,
  };

  const nextTransactions = transactions.toSpliced(index, 1, updated);
  await writeTransactions(nextTransactions);

  revalidatePath("/");
  revalidatePath("/transactions");

  return updated;
}

export async function deleteTransaction(transactionId: number): Promise<void> {
  const transactions = await readTransactions();
  const nextTransactions = transactions.filter((tx) => tx.id !== transactionId);

  await writeTransactions(nextTransactions);

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
}
