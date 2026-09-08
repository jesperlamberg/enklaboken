import { Account } from "../models/Account";

export function createAccount(
  accounts: Account[],
  number: string,
  name: string,
  normalBalance: "debit" | "credit"
): Account {
  const nextId = accounts.length === 0
    ? 1
    : Math.max(...accounts.map((account) => account.id)) + 1;

  return {
    id: nextId,
    number,
    name,
    normalBalance,
    active: true,
  };
}
