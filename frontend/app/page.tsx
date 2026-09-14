import Link from "next/link";
import { Header } from "./components/Header";
import { TransactionsTable } from "./components/TransactionsTable";
import { AccountsTable } from "./components/AccountsTable";
import { readAccounts } from "./repositories/AccountRepository";
import { readTransactions } from "./repositories/TransactionRepository";
import { calculateAllAccountBalances } from "./services/TransactionService";
import { calculateMatchingStatus } from "./models/Transaction";

export default async function Home() {
  const accounts = await readAccounts();
  const transactions = await readTransactions();

  const balances = calculateAllAccountBalances(accounts, transactions);

  const physicalAccounts = accounts.filter((a) => a.type === "physical");
  const totalBankBalance = physicalAccounts.reduce(
    (sum, a) => sum + (balances[a.id]?.balance || 0),
    0
  );

  const matchedCount = transactions.filter(
    (tx) => calculateMatchingStatus(tx).status === "matched"
  ).length;

  const unmatchedCount = transactions.filter(
    (tx) => calculateMatchingStatus(tx).status !== "matched"
  ).length;

  return (
    <>
      <Header />
      <main>
        {/* KPI Dashboard */}
        <div className="grid-3">
          <div className="stat-card">
            <div className="stat-label">🏦 Totalt saldo på bank & kassa</div>
            <div className="stat-value" style={{ color: "var(--primary)" }}>
              {totalBankBalance.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">✓ Matchade transaktioner</div>
            <div className="stat-value" style={{ color: "var(--success)" }}>
              {matchedCount} st
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">⚠️ Omatchade / Att hantera</div>
            <div
              className="stat-value"
              style={{ color: unmatchedCount > 0 ? "var(--warning)" : "var(--text-muted)" }}
            >
              {unmatchedCount} st
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <section>
          <div className="card-header">
            <div>
              <h2>Fysiska transaktioner & Matchning</h2>
              <p>Bokförda händelser på fysiska konton och deras koppling till virtuella BAS-konton.</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Link href="/create-transaction?type=credit" className="btn btn-secondary btn-sm">
                🔴 Ny utbetalning
              </Link>
              <Link href="/create-transaction?type=debit" className="btn btn-secondary btn-sm">
                🟢 Ny inbetalning
              </Link>
              <Link href="/create-transaction" className="btn btn-primary btn-sm">
                + Registrera transaktion
              </Link>
            </div>
          </div>

          <TransactionsTable transactions={transactions} accounts={accounts} />
        </section>

        {/* Quick Accounts Overview */}
        <section style={{ marginTop: "2rem" }}>
          <div className="card-header">
            <div>
              <h2>Kontoplan & Saldon</h2>
              <p>Översikt över alla fysiska och virtuella konton.</p>
            </div>
            <Link href="/accounts" className="btn btn-secondary btn-sm">
              Hantera kontoplan →
            </Link>
          </div>

          <AccountsTable accounts={accounts} transactions={transactions} />
        </section>
      </main>
    </>
  );
}

