import { Header } from "../components/layout/Header";
import { AccountForm } from "../components/forms/AccountForm";
import { readAccounts } from "../repositories/AccountRepository";

export default async function CreateAccountPage() {
  const accounts = await readAccounts();

  return (
    <>
      <Header />
      <main>
        <AccountForm mode="create" existingAccounts={accounts} />
      </main>
    </>
  );
}

