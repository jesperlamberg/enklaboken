import { Fragment, useState } from "react";
import { Account } from "../models/Account";
import { Voucher } from "../models/Voucher";
import { getVoucherTotal } from "../services/VoucherService";

type VouchersTableProps = {
  vouchers: Voucher[];
  accounts: Account[];
};

export function VouchersTable({ vouchers, accounts }: VouchersTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  function toggleVoucher(id: number) {
    setExpandedId((current) => (current === id ? null : id));
  }

  function getAccountLabel(accountId: number) {
    const account = accounts.find((a) => a.id === accountId);
    return account ? `${account.number} ${account.name}` : `Konto ${accountId}`;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Verifikation</th>
          <th>Datum</th>
          <th>Beskrivning</th>
          <th>Debet</th>
          <th>Kredit</th>
        </tr>
      </thead>
      <tbody>
        {vouchers.map((voucher) => (
          <Fragment key={voucher.id}>
            <tr
              onClick={() => toggleVoucher(voucher.id)}
              style={{ cursor: "pointer" }}
              aria-expanded={expandedId === voucher.id}
            >
              <td>{voucher.voucherNumber}</td>
              <td>{voucher.date}</td>
              <td>{voucher.description}</td>
              <td>{getVoucherTotal(voucher, "debit")} kr</td>
              <td>{getVoucherTotal(voucher, "credit")} kr</td>
            </tr>
            {expandedId === voucher.id && (
              <tr>
                <td colSpan={5}>
                  <table>
                    <thead>
                      <tr>
                        <th>Konto</th>
                        <th>Debet</th>
                        <th>Kredit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voucher.entries.map((entry, index) => (
                        <tr key={index}>
                          <td>{getAccountLabel(entry.accountId)}</td>
                          <td>{entry.debit} kr</td>
                          <td>{entry.credit} kr</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
    </table>
  )
}
