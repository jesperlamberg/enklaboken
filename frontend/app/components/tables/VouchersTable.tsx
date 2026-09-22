"use client"

import { Account } from "../../models/Account";
import { Voucher } from "../../models/Voucher";
import { getVoucherTotal } from "../../services/VoucherService";
import { BalanceIndicator } from "../ui/BalanceIndicator";
import { VoucherEntryRow } from "../ui/VoucherEntryRow";
import { BalanceFeedback } from "../ui/BalanceFeedback";

type VouchersTableProps = {
  vouchers: Voucher[];
  accounts: Account[];
};



export function VouchersTable({
  vouchers,
  accounts,
}: VouchersTableProps) {
  const accountsById = new Map(accounts.map((account) => [account.id, account]));

  return (
    <div>
      <h2 className="mb-4">Transaktioner</h2>
      <div className="accordion" id="vouchersAccordion">
        {vouchers.map((voucher) => {
          const collapseId = `voucher-collapse-${voucher.id}`;

          const debitTotal = getVoucherTotal(voucher, "debit");
          const creditTotal = getVoucherTotal(voucher, "credit");
          const balanced = debitTotal === creditTotal;

          return (
            <div className="accordion-item" key={voucher.id}>
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed py-3"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#${collapseId}`}
                  aria-expanded="false"
                  aria-controls={collapseId}
                >
                  <div className="container-fluid px-0">
                    <div className="row align-items-center g-0">
                      <div className="col-1">
                        <span>{voucher.id}</span>
                      </div>
                      <div className="col-2">
                        <span>{voucher.date}</span>
                      </div>
                      <div className="col">
                        <span>{voucher.description}</span>
                      </div>
                      <div className="col-2 text-end">
                        <span>{debitTotal} kr</span>
                      </div>
                      <div className="col-2 text-end">
                        <span>{creditTotal} kr</span>
                      </div>
                      <div className="col-1 text-center">
                        <BalanceIndicator balanced={balanced} size="small" />
                      </div>
                    </div>
                  </div>
                </button>
              </h2>
              <div
                id={collapseId}
                className="accordion-collapse collapse"
                data-bs-parent="#vouchersAccordion"
              >
                <div className="accordion-body">
                  <div className="row mb-4">
                    <div className="col-md-7">
                      <h6 className="fw-bold">Beskrivning</h6>

                      <p className="mb-0">
                        {voucher.description}
                      </p>
                    </div>
                    <div className="col-md-5 mt-3 mt-md-0">
                      <h6 className="fw-bold">Verifikation</h6>

                      <div className="text-muted">
                        <div>
                          <strong>Nr:</strong> {voucher.id}
                        </div>

                        <div>
                          <strong>Datum:</strong> {voucher.date}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr>
                          <th style={{ width: "15%" }}>Konto</th>
                          <th>Kontonamn</th>
                          <th className="text-end">Debet</th>
                          <th className="text-end">Kredit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {voucher.entries.map((entry, index) => (
                          <VoucherEntryRow
                            key={`${entry.accountId}-${index}`}
                            entry={entry}
                            account={accountsById.get(entry.accountId)}
                          />
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-light fw-bold">
                          <td></td>
                          <td className="text-end">Summa</td>

                          <td className="text-end">
                            {debitTotal} kr
                          </td>

                          <td className="text-end">
                            {creditTotal} kr
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <BalanceFeedback
                    balanced={balanced}
                    debitTotal={debitTotal}
                    creditTotal={creditTotal}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
