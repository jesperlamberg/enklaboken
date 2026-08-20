import { Account } from "../models/Account";
import { Transaction } from "../models/Transaction";
import { getAccountBalance } from "../services/accounting";

type AccountsTableProps = {
  accounts: Account[];
  transactions: Transaction[];
};

export function AccountsTable({ accounts, transactions }: AccountsTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Konto</th>
          <th>Saldo</th>
        </tr>
      </thead>
      <tbody>
        {accounts.map((account) => (
          <tr key={account.id}>
            <td>{account.name}</td>
            <td>{getAccountBalance(account.id, transactions)} kr</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
