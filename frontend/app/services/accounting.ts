import { Transaction } from "../models/Transaction";

export function getAccountBalance(accountId: number, transactions: Transaction[]) {
  return transactions
    .filter((transaction) => transaction.accountId === accountId)
    .reduce((balance, transaction) => {
      if (transaction.type === "income") {
        return balance + transaction.amount;
      }

      return balance - transaction.amount;
    }, 0);
}
