import { Header } from "./components/Header";
import { accounts, transactions } from "./data/mockData";
import { AccountsTable } from "./components/AccountsTable";
import { TransactionTable } from "./components/TransactionsTable";

function createAccount(name: string) {
  const newAccount = {
    id: accounts.length + 1,
    name
  };
  accounts.push(newAccount);
  return newAccount;
}

export default function Home() {
  return (
    <>
      <Header />
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
