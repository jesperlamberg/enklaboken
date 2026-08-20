"use client";

import { useState } from "react";
import { Header } from "./components/Header";
import { initialAccounts, initialVouchers } from "./data/mockData";
import { AccountsTable } from "./components/AccountsTable";
import { VouchersTable } from "./components/VouchersTable";
import { createAccount as createAccountService } from "./services/AccountService";

export default function Home() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [vouchers, setVouchers] = useState(initialVouchers);

  function createAccount() {
    const newAccount = createAccountService(
      accounts,
      "1930",
      "Företagskonto",
      "debit"
    );

    setAccounts([...accounts, newAccount]);
  }

  return (
    <>
      <Header onCreateAccount={createAccount} />
      <main>
        <section id="accounts">
          <h2>Konton</h2>
          <AccountsTable accounts={accounts} vouchers={vouchers} />
        </section>
        <section className="transactions">
          <h2>Transaktioner</h2>
          <VouchersTable vouchers={vouchers} />
        </section>
      </main>
    </>
  );
}
