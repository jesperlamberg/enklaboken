import { Account } from "../models/Account";
import { Voucher } from "../models/Voucher";

type AccountsTableProps = {
  accounts: Account[];
  vouchers: Voucher[];
}

function getBalance(account: Account, vouchers: Voucher[]) {
  const balance = vouchers.reduce((total, voucher) => {
    return total + voucher.entries.reduce((entryTotal, entry) => {
      if (entry.accountId !== account.id) {
        return entryTotal;
      }

      return entryTotal + entry.debit - entry.credit;
    }, 0);
  }, 0);

  return account.normalBalance === "debit"
    ? balance
    : -balance;
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
            <td>{getBalance(account, vouchers)} kr</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
