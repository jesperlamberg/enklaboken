import { VoucherForm } from "../components/VoucherForm";
import { readAccounts } from "../repositories/AccountRepository";

export default async function CreateDebitPage() {
  const accounts = (await readAccounts()).filter((account) => account.active);

  return <VoucherForm direction="debit" accounts={accounts} />;
}
