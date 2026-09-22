import { Header } from "../components/layout/Header";
import { TransactionForm } from "../components/forms/TransactionForm";
import { readAccounts } from "../repositories/AccountRepository";

export default async function CreateCreditPage() {
  const accounts = await readAccounts();

  return (
    <>
      <Header />
      <main>
        <TransactionForm accounts={accounts} initialType="debit" />
      </main>
    </>
  );
}

