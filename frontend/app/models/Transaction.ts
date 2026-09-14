export type TransactionType = "in" | "out" | "debit" | "credit";

export type VirtualAllocation = {
  id?: string;
  virtualAccountId: number;
  amount: number;
  type: "debit" | "credit";
  description?: string;
};

export type MatchingStatus = "matched" | "unmatched" | "partial" | "imbalanced";

export type Transaction = {
  id: number;
  transactionNumber: number;
  date: string;
  description: string;
  physicalAccountId: number;
  type: "debit" | "credit"; // debit = inbetalning/ökning på bank, credit = utbetalning/minskning från bank
  amount: number;
  receiptUrl?: string;
  receiptFileName?: string;
  virtualAllocations: VirtualAllocation[];
};

export function calculateMatchingStatus(transaction: Transaction): {
  status: MatchingStatus;
  allocatedAmount: number;
  difference: number;
} {
  const allocatedAmount = (transaction.virtualAllocations || []).reduce(
    (sum, line) => sum + (Number(line.amount) || 0),
    0
  );
  const total = Number(transaction.amount) || 0;
  const roundedAllocated = Math.round(allocatedAmount * 100) / 100;
  const roundedTotal = Math.round(total * 100) / 100;
  const difference = Math.round((roundedTotal - roundedAllocated) * 100) / 100;

  if (transaction.virtualAllocations.length === 0) {
    return { status: "unmatched", allocatedAmount: roundedAllocated, difference: roundedTotal };
  }

  if (Math.abs(difference) < 0.001) {
    return { status: "matched", allocatedAmount: roundedAllocated, difference: 0 };
  }

  if (roundedAllocated < roundedTotal) {
    return { status: "partial", allocatedAmount: roundedAllocated, difference };
  }

  return { status: "imbalanced", allocatedAmount: roundedAllocated, difference };
}
