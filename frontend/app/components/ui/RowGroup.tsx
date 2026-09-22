import { Account } from "../../models/Account";

export type RowState = {
  id: number;
  accountId: number;
  amount: string;
  side: "debit" | "credit";
};

type RowGroupProps = {
  title: string;
  subtitle: string;
  rows: RowState[];
  updateRow: (rowId: number, changes: Partial<RowState>) => void;
  removeRow: (rowId: number) => void;
  addRow: () => void;
  accountOptions: Account[];
};

export function RowGroup({ title, subtitle, rows, updateRow, removeRow, addRow, accountOptions }: RowGroupProps) {
  return (
    <div className="border rounded p-3 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="h5 mb-1">{title}</h4>
          <small className="text-muted">{subtitle}</small>
        </div>
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={addRow}>
          + Lägg till rad
        </button>
      </div>

      {rows.map((row, index) => (
        <div key={row.id} className="border rounded p-3 mb-3 bg-light-subtle">
          <div className="row g-3 align-items-end">
            <div className="col-md-7">
              <label className="form-label">Konto</label>
              <select
                className="form-select"
                value={row.accountId || ""}
                onChange={(event) => updateRow(row.id, { accountId: Number(event.target.value) })}
              >
                <option value="" disabled>
                  Välj konto
                </option>
                {accountOptions.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.number} - {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Belopp</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="form-control"
                value={row.amount}
                onChange={(event) => updateRow(row.id, { amount: event.target.value })}
                placeholder="0"
              />
            </div>

            <div className="col-md-2 text-end">
              {rows.length > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm w-100"
                  onClick={() => removeRow(row.id)}
                  aria-label={`Ta bort ${title.toLowerCase()} rad ${index + 1}`}
                >
                  Ta bort
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
