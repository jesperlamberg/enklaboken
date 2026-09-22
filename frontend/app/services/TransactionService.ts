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

// Splits an amount across the selected account and its linked VAT account, or allocates it whole if no VAT rate applies.
export function buildAutoSplitAllocations(
  selectedAccount: Account,
  virtualAccounts: Account[],
  amount: number,
  transactionType: "debit" | "credit"
): VirtualAllocation[] {
  const virtualType: "debit" | "credit" = transactionType === "credit" ? "debit" : "credit";

  if (selectedAccount.defaultVatRate && selectedAccount.defaultVatRate > 0 && selectedAccount.vatAccountId) {
    const { net, vat } = calculateVatSplit(amount, selectedAccount.defaultVatRate);
    const vatAcc = virtualAccounts.find((a) => a.id === selectedAccount.vatAccountId);

    const allocations: VirtualAllocation[] = [
      { virtualAccountId: selectedAccount.id, amount: net, type: virtualType, description: selectedAccount.name },
    ];

    if (vatAcc) {
      allocations.push({
        virtualAccountId: vatAcc.id,
        amount: vat,
        type: virtualType,
        description: `Moms (${selectedAccount.defaultVatRate}%)`,
      });
    }

    return allocations;
  }

  return [{ virtualAccountId: selectedAccount.id, amount, type: virtualType, description: selectedAccount.name }];
}

export function addAllocationRow(
  rows: VirtualAllocation[],
  defaultAccountId: number,
  totalAmount: number,
  transactionType: "debit" | "credit"
): VirtualAllocation[] {
  const virtualType: "debit" | "credit" = transactionType === "credit" ? "debit" : "credit";
  const currentAllocated = rows.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  const remaining = Math.max(0, Math.round((totalAmount - currentAllocated) * 100) / 100);

  return [...rows, { virtualAccountId: defaultAccountId, amount: remaining, type: virtualType, description: "" }];
}

export function removeAllocationRow(rows: VirtualAllocation[], index: number): VirtualAllocation[] {
  return rows.filter((_, i) => i !== index);
}

export function updateAllocationRow(
  rows: VirtualAllocation[],
  index: number,
  field: keyof VirtualAllocation,
  value: string | number
): VirtualAllocation[] {
  const next = [...rows];
  next[index] = { ...next[index], [field]: field === "amount" ? Number(value) : value };
  return next;
}

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
