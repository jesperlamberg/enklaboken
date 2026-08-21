import { Voucher } from "../models/Voucher";
import { getVoucherTotal } from "../services/VoucherService";

type VouchersTableProps = {
  vouchers: Voucher[];
};

export function VouchersTable({ vouchers }: VouchersTableProps) {
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
          <tr key={voucher.id}>
            <td>{voucher.voucherNumber}</td>
            <td>{voucher.date}</td>
            <td>{voucher.description}</td>
            <td>{getVoucherTotal(voucher, "debit")} kr</td>
            <td>{getVoucherTotal(voucher, "credit")} kr</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
