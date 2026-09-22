import { Header } from "../components/layout/Header";
import { TransactionForm } from "../components/forms/TransactionForm";
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

