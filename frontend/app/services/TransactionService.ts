import { Account } from "../models/Account";
import { Transaction, VirtualAllocation } from "../models/Transaction";

export function calculateVatSplit(grossAmount: number, vatRatePercentage: number): { net: number; vat: number } {
  if (!vatRatePercentage || vatRatePercentage <= 0) {
    return { net: grossAmount, vat: 0 };
  }

  // VAT = Gross * (Rate / (100 + Rate))
  const vat = Math.round((grossAmount * (vatRatePercentage / (100 + vatRatePercentage))) * 100) / 100;
  const net = Math.round((grossAmount - vat) * 100) / 100;

  return { net, vat };
}

export function createTransaction(
  existingTransactions: Transaction[],
  accounts: Account[],
  params: {
    date: string;
    description: string;
    physicalAccountId: number;
    type: "debit" | "credit";
    amount: number;
    receiptUrl?: string;
    receiptFileName?: string;
    virtualAllocations?: VirtualAllocation[];
  }
): Transaction {
  const physicalAccount = accounts.find((a) => a.id === params.physicalAccountId);
  if (!physicalAccount || physicalAccount.type !== "physical") {
    throw new Error("Ett giltigt fysiskt konto (t.ex. Bank eller Kassa) måste väljas.");
  }

  if (params.amount <= 0) {
    throw new Error("Beloppet måste vara större än 0.");
  }

  const nextId = existingTransactions.length === 0
    ? 1
    : Math.max(...existingTransactions.map((tx) => tx.id)) + 1;

  const nextTransactionNumber = existingTransactions.length === 0
    ? 1
    : Math.max(...existingTransactions.map((tx) => tx.transactionNumber || tx.id)) + 1;

  const virtualAllocations = params.virtualAllocations || [];

  return {
    id: nextId,
    transactionNumber: nextTransactionNumber,
    date: params.date || new Date().toISOString().split("T")[0],
    description: params.description.trim(),
    physicalAccountId: params.physicalAccountId,
    type: params.type,
    amount: Number(params.amount),
    receiptUrl: params.receiptUrl,
    receiptFileName: params.receiptFileName,
    virtualAllocations,
  };
}

export type AccountBalanceMap = Record<number, { balance: number; debitTotal: number; creditTotal: number }>;

export function calculateAllAccountBalances(
  accounts: Account[],
  transactions: Transaction[]
): AccountBalanceMap {
  const balances: AccountBalanceMap = {};

  for (const account of accounts) {
    balances[account.id] = { balance: 0, debitTotal: 0, creditTotal: 0 };
  }

  for (const tx of transactions) {
    // Physical account entry
    if (balances[tx.physicalAccountId]) {
      const amt = Number(tx.amount) || 0;
      if (tx.type === "debit") {
        balances[tx.physicalAccountId].debitTotal += amt;
        balances[tx.physicalAccountId].balance += amt; // Inflow to bank
      } else {
        balances[tx.physicalAccountId].creditTotal += amt;
        balances[tx.physicalAccountId].balance -= amt; // Outflow from bank
      }
    }

    // Virtual allocations
    for (const v of tx.virtualAllocations || []) {
      if (balances[v.virtualAccountId]) {
        const amt = Number(v.amount) || 0;
        if (v.type === "debit") {
          balances[v.virtualAccountId].debitTotal += amt;
          balances[v.virtualAccountId].balance += amt;
        } else {
          balances[v.virtualAccountId].creditTotal += amt;
          balances[v.virtualAccountId].balance -= amt;
        }
      }
    }
  }

  return balances;
}
