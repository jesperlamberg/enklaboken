import { Header } from "../../../components/Header";
import { readAccounts, readAccountById } from "../../../repositories/AccountRepository";
import { notFound } from "next/navigation";
import { EditAccountForm } from "../../../components/EditAccountForm";

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accountId = parseInt(id, 10);
  const account = await readAccountById(accountId);

  if (!account) {
    notFound();
  }

  const allAccounts = await readAccounts();

  return (
    <>
      <Header />
      <main>
        <EditAccountForm account={account} allAccounts={allAccounts} />
      </main>
    </>
  );
}
