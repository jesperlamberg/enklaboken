import { Account } from "../models/Account";

export function createAccount(
  accounts: Account[],
  number: string,
  name: string
): Account {
  return {
    id: accounts.length + 1,
    number,
    name,
    active: true
  }
}
