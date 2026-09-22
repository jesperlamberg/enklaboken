import { Account } from "../../models/Account";
import { Transaction } from "../../models/Transaction";
import { calculateAllAccountBalances } from "../../services/TransactionService";
import Link from "next/link";
import { Badge } from "../ui/Badge";

type AccountsTableProps = {
  accounts: Account[];
  transactions: Transaction[];
  filterType?: "all" | "physical" | "virtual";
  showActions?: boolean;
};

export function AccountsTable({
  accounts,
  transactions,
  filterType = "all",
  showActions = false,
}: AccountsTableProps) {
  const balances = calculateAllAccountBalances(accounts, transactions);

  const filteredAccounts = accounts.filter((account) => {
    if (filterType === "all") return true;
    return account.type === filterType;
  });

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Konto</th>
            <th>Namn</th>
            <th>Typ</th>
            <th>Moms / Inställning</th>
            <th className="text-right">Debet</th>
            <th className="text-right">Kredit</th>
            <th className="text-right">Saldo</th>
            {showActions && <th className="text-right">Åtgärd</th>}
          </tr>
        </thead>
        <tbody>
          {filteredAccounts.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 8 : 7} className="text-center" style={{ padding: "2rem", color: "var(--text-muted)" }}>
                Inga konton hittades för valt filter.
              </td>
            </tr>
          ) : (
            filteredAccounts.map((account) => {
              const b = balances[account.id] || { balance: 0, debitTotal: 0, creditTotal: 0 };
              const isPhysical = account.type === "physical";
              const vatTarget = account.vatAccountId
                ? accounts.find((a) => a.id === account.vatAccountId)
                : undefined;

              return (
                <tr key={account.id}>
                  <td className="font-mono" style={{ fontWeight: 600 }}>
                    {account.number}
                  </td>
                  <td>
                    <div>
                      <strong>{account.name}</strong>
                      {account.description && (
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                          {account.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge variant={isPhysical ? "physical" : "virtual"}>
                      {isPhysical ? "🏦 Fysiskt" : "📊 Virtuellt (BAS)"}
                    </Badge>
                  </td>
                  <td>
                    {account.defaultVatRate !== undefined && account.defaultVatRate > 0 ? (
                      <span style={{ fontSize: "0.8125rem" }}>
                        <strong>{account.defaultVatRate}%</strong>
                        {vatTarget && ` → ${vatTarget.number}`}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-light)", fontSize: "0.8125rem" }}>
                        {isPhysical ? "–" : "0% / Ingen"}
                      </span>
                    )}
                  </td>
                  <td className="text-right font-mono" style={{ color: "var(--text-muted)" }}>
                    {b.debitTotal.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
                  </td>
                  <td className="text-right font-mono" style={{ color: "var(--text-muted)" }}>
                    {b.creditTotal.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
                  </td>
                  <td className="text-right font-mono" style={{ fontWeight: 700 }}>
                    <span
                      style={{
                        color:
                          b.balance > 0
                            ? "var(--success)"
                            : b.balance < 0
                            ? "var(--danger)"
                            : "var(--text-main)",
                      }}
                    >
                      {b.balance.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
                    </span>
                  </td>
                  {showActions && (
                    <td className="text-right">
                      <Link
                        href={`/accounts/${account.id}/edit`}
                        className="btn btn-secondary btn-sm"
                      >
                        Redigera
                      </Link>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

