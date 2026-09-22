import { Account } from "../../models/Account";
import { VoucherEntry } from "../../models/VoucherEntry";

type VoucherEntryRowProps = {
  entry: VoucherEntry;
  account: Account | undefined;
};

export function VoucherEntryRow({ entry, account }: VoucherEntryRowProps) {
  return (
    <tr>
      <td>{account?.number ?? entry.accountId}</td>
      <td>{account?.name ?? `Konto ${entry.accountId}`}</td>
      <td className="text-end">{entry.debit} kr</td>
      <td className="text-end">{entry.credit} kr</td>
    </tr>
  );
}
