import { Account } from "../models/Account";
import { Voucher } from "../models/Voucher";

type AccountsTableProps = {
  accounts: Account[];
  vouchers: Voucher[];
}

function getBalance(accountId: number, vouchers: Voucher[]) {
  return vouchers.reduce((balance, voucher) => {
    return balance + voucher.entries.reduce((total, entry) => {
      if (entry.accountId !== accountId) {
        return total;
      }

      return total + entry.debit - entry.credit;
    }, 0);
  }, 0);
}

export function AccountsTable({ accounts, vouchers }: AccountsTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Konto</th>
          <th>Namn</th>
          <th>Saldo</th>
        </tr>
      </thead>
      <tbody>
        {accounts.map((account) => (
          <tr key={account.id}>
            <td>{account.number}</td>
            <td>{account.name}</td>
            <td>{getBalance(account.id, vouchers)} kr</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
