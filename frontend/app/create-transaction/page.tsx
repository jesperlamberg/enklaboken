import { Header } from "../components/Header";
import { TransactionForm } from "../components/TransactionForm";
import { readAccounts } from "../repositories/AccountRepository";

export default async function CreateTransactionPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string }>;
}) {
  const accounts = await readAccounts();
  const params = searchParams ? await searchParams : {};
  const initialType = params.type === "debit" ? "debit" : "credit";

  return (
    <>
      <Header />
      <main>
        <TransactionForm accounts={accounts} initialType={initialType} />
      </main>
    </>
  );
}
