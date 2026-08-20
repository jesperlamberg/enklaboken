import { Account } from "../models/Account";

export function createAccount(
  accounts: Account[],
  number: string,
  name: string,
  normalBalance: "debit" | "credit"
): Account {
  return {
    id: accounts.length + 1,
    number,
    name,
    normalBalance,
    active: true
  }
}
