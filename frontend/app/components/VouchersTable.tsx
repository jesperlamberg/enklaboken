import { Account } from "../models/Account";
import { Voucher } from "../models/Voucher";
import { getVoucherTotal } from "../services/VoucherService";

type VouchersTableProps = {
  vouchers: Voucher[];
  accounts: Account[];
};

export function VouchersTable({ vouchers, accounts }: VouchersTableProps) {
  function getAccountLabel(accountId: number) {
    const account = accounts.find((a) => a.id === accountId);
    return account ? `${account.number} ${account.name}` : `Konto ${accountId}`;
  }

  return (
    <div className="accordion" id="vouchersAccordion">
      <div className="row fw-bold px-3 py-2">
        <div className="col">Verifikation</div>
        <div className="col">Datum</div>
        <div className="col">Beskrivning</div>
        <div className="col">Debet</div>
        <div className="col">Kredit</div>
      </div>
      {vouchers.map((voucher) => {
        const collapseId = `voucher-collapse-${voucher.id}`;
        return (
          <div className="accordion-item" key={voucher.id}>
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#${collapseId}`}
                aria-expanded="false"
                aria-controls={collapseId}
              >
                <span className="row w-100">
                  <span className="col">{voucher.voucherNumber}</span>
                  <span className="col">{voucher.date}</span>
                  <span className="col">{voucher.description}</span>
                  <span className="col text-end">{getVoucherTotal(voucher, "debit")} kr</span>
                  <span className="col text-end">{getVoucherTotal(voucher, "credit")} kr</span>
                </span>
              </button>
            </h2>
            <div id={collapseId} className="accordion-collapse collapse">
              <div className="accordion-body">
                <table className="table table-hover">
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
                        <td className="text-end">{entry.debit} kr</td>
                        <td className="text-end">{entry.credit} kr</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
