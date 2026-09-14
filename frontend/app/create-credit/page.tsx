import { Header } from "../components/Header";
import { TransactionForm } from "../components/TransactionForm";
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

