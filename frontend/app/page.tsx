import { Header } from "./components/Header";
import { AccountsTable } from "./components/AccountsTable";
import { VouchersTable } from "./components/VouchersTable";
import { readAccounts } from "./repositories/AccountRepository";
import { readVouchers } from "./repositories/VoucherRepository";

export default async function Home() {
  const accounts = await readAccounts();
  const vouchers = await readVouchers();

  return (
    <>
      <Header />
      <main>
        <section id="accounts">
          <h2>Konton</h2>
          <AccountsTable accounts={accounts} vouchers={vouchers} />
        </section>
        <section className="transactions">
          <VouchersTable vouchers={vouchers} accounts={accounts} />
        </section>
      </main>
    </>
  );
}
