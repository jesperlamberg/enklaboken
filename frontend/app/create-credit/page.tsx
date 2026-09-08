import { VoucherForm } from "../components/VoucherForm";
import { readAccounts } from "../repositories/AccountRepository";

export default async function CreateCreditPage() {
  const accounts = (await readAccounts()).filter((account) => account.active);

  return <VoucherForm direction="credit" accounts={accounts} />;
}
