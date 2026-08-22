"use client";

import { useState } from "react";
import { Header } from "./components/Header";
import { initialAccounts, initialVouchers } from "./data/mockData";
import { AccountsTable } from "./components/AccountsTable";
import { VouchersTable } from "./components/VouchersTable";
import { createAccount as createAccountService } from "./services/AccountService";
import { Account } from "./models/Account";

export default function Home() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [vouchers, setVouchers] = useState(initialVouchers);

  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNormalBalance, setAccountNormalBalance] = useState<Account["normalBalance"] | "">("");

  function createAccount() {
    if (!accountNumber || !accountName || !accountNormalBalance) {
      return;
    }

    const newAccount = createAccountService(
      accounts,
      accountNumber,
      accountName,
      accountNormalBalance
    );

    setAccounts([...accounts, newAccount]);
  }

  return (
    <>
      <Header onCreateAccount={createAccount} />
      <main>
        <section>
          <h2>Skapa konto</h2>
          <form>
            <input placeholder="Nummer" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            <input placeholder="Namn" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            <select value={accountNormalBalance} onChange={(e) => setAccountNormalBalance(e.target.value as Account["normalBalance"])}>
              <option value="" disabled hidden>Typ</option>
              <option value="debit">Debet</option>
              <option value="credit">Kredit</option>
            </select>
          </form>
        </section>
        <section id="accounts">
          <h2>Konton</h2>
          <AccountsTable accounts={accounts} vouchers={vouchers} />
        </section>
        <section className="transactions">
          <h2>Transaktioner</h2>
          <VouchersTable vouchers={vouchers} accounts={accounts} />
        </section>
      </main>
    </>
  );
}
