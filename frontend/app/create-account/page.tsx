import { Header } from "../components/Header";
import { CreateAccountForm } from "../components/CreateAccountForm";
import { readAccounts } from "../repositories/AccountRepository";

export default async function CreateAccountPage() {
  const accounts = await readAccounts();

  return (
    <>
      <Header />
      <main>
        <CreateAccountForm existingAccounts={accounts} />
      </main>
    </>
  );
}

