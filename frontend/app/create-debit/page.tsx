import { Header } from "../components/Header";
import { TransactionForm } from "../components/TransactionForm";
import { readAccounts } from "../repositories/AccountRepository";

export default async function CreateDebitPage() {
  const accounts = await readAccounts();

  return (
    <>
      <Header />
      <main>
        <TransactionForm accounts={accounts} initialType="credit" />
      </main>
    </>
  );
}

