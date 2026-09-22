import Link from "next/link";
import { Header } from "../components/layout/Header";
import { AccountsTable } from "../components/tables/AccountsTable";
import { readAccounts } from "../repositories/AccountRepository";
import { readTransactions } from "../repositories/TransactionRepository";
import { calculateAllAccountBalances } from "../services/TransactionService";

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type = "all" } = await searchParams;
  const accounts = await readAccounts();
  const transactions = await readTransactions();

  const balances = calculateAllAccountBalances(accounts, transactions);

  const physicalAccounts = accounts.filter((a) => a.type === "physical");
  const virtualAccounts = accounts.filter((a) => a.type === "virtual");

  const physicalSum = physicalAccounts.reduce(
    (sum, a) => sum + (balances[a.id]?.balance || 0),
    0
  );
  const virtualSum = virtualAccounts.reduce(
    (sum, a) => sum + (balances[a.id]?.balance || 0),
    0
  );

  return (
    <>
      <Header />
      <main>
        <div className="card-header">
          <div>
            <h1>Kontoplan</h1>
            <p>Hantera fysiska bank/kassa-konton och virtuella BAS-konton.</p>
          </div>
          <Link href="/create-account" className="btn btn-primary">
            + Skapa nytt konto
          </Link>
        </div>

        <div className="grid-2">
          <div className="stat-card">
            <div className="stat-label">Totalt saldo på fysiska konton</div>
            <div className="stat-value" style={{ color: "var(--primary)" }}>
              {physicalSum.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Antal konton (Fysiska / Virtuella)</div>
            <div className="stat-value">
              {physicalAccounts.length} / {virtualAccounts.length}
            </div>
          </div>
        </div>

        <div className="tabs">
          <Link
            href="/accounts"
            className={`tab-btn ${type === "all" ? "active" : ""}`}
          >
            Alla konton ({accounts.length})
          </Link>
          <Link
            href="/accounts?type=physical"
            className={`tab-btn ${type === "physical" ? "active" : ""}`}
          >
            Fysiska konton ({physicalAccounts.length})
          </Link>
          <Link
            href="/accounts?type=virtual"
            className={`tab-btn ${type === "virtual" ? "active" : ""}`}
          >
            Virtuella konton ({virtualAccounts.length})
          </Link>
        </div>

        <AccountsTable
          accounts={accounts}
          transactions={transactions}
          filterType={type as "all" | "physical" | "virtual"}
          showActions={true}
        />
      </main>
    </>
  );
}
