"use client";

import { useState } from "react";
import { Header } from "./components/Header";
import { initialAccounts, initialTransactions } from "./data/mockData";
import { AccountsTable } from "./components/AccountsTable";
import { TransactionTable } from "./components/TransactionsTable";

export default function Home() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [transactions, setTransactions] = useState(initialTransactions);

  function createAccount() {
    const newAccount = {
      id: accounts.length + 1,
      name: "Företagskonto"
    };

    setAccounts([...accounts, newAccount]);
  }

  return (
    <>
      <Header onCreateAccount={createAccount} />
      <main>
        <section id="accounts">
          <h2>Konton</h2>
          <AccountsTable accounts={accounts} transactions={transactions} />
        </section>
        <section className="transactions">
          <h2>Transaktioner</h2>
          <TransactionTable transactions={transactions} />
        </section>
      </main>
    </>
  );
}
