import { Account } from "../models/Account";

export function createAccount(accounts: Account[], name: string): Account {
  return {
    id: accounts.length + 1,
    name
  }
}
