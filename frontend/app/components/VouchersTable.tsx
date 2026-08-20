import { Voucher } from "../models/Voucher";

type VouchersTableProps = {
  vouchers: Voucher[];
};

export function VouchersTable({ vouchers }: VouchersTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Verifikation</th>
          <th>Beskrivning</th>
          <th>Datum</th>
        </tr>
      </thead>
      <tbody>
        {vouchers.map((voucher) => (
          <tr key={voucher.id}>
            <td>{voucher.voucherNumber}</td>
            <td>{voucher.description}</td>
            <td>{voucher.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
