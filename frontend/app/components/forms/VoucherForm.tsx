"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Account } from "../../models/Account";
import { saveCreditVoucher, saveDebitVoucher, VoucherDirection } from "../../actions/voucherActions";
import { RowGroup, RowState } from "../ui/RowGroup";

type VoucherFormProps = {
  direction: VoucherDirection;
  accounts: Account[];
};

const isBusinessAccount = (account: Account) => account.number === "1930";

const createEmptyRow = (side: "debit" | "credit"): RowState => ({
  id: Date.now() + Math.random(),
  accountId: 0,
  amount: "",
  side,
});

export function VoucherForm({ direction, accounts }: VoucherFormProps) {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [debitRows, setDebitRows] = useState<RowState[]>(() => [createEmptyRow("debit")]);
  const [creditRows, setCreditRows] = useState<RowState[]>(() => [createEmptyRow("credit")]);

  function updateDebitRow(rowId: number, changes: Partial<RowState>) {
    setDebitRows((currentRows) =>
      currentRows.map((row) => (row.id === rowId ? { ...row, ...changes } : row))
    );
  }

  function updateCreditRow(rowId: number, changes: Partial<RowState>) {
    setCreditRows((currentRows) =>
      currentRows.map((row) => (row.id === rowId ? { ...row, ...changes } : row))
    );
  }

  function addDebitRow() {
    setDebitRows((currentRows) => [...currentRows, createEmptyRow("debit")]);
  }

  function addCreditRow() {
    setCreditRows((currentRows) => [...currentRows, createEmptyRow("credit")]);
  }

  function removeDebitRow(rowId: number) {
    setDebitRows((currentRows) => (currentRows.length <= 1 ? currentRows : currentRows.filter((row) => row.id !== rowId)));
  }

  function removeCreditRow(rowId: number) {
    setCreditRows((currentRows) => (currentRows.length <= 1 ? currentRows : currentRows.filter((row) => row.id !== rowId)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedDescription = description.trim();
    const debitEntries = debitRows
      .map((row) => ({ accountId: Number(row.accountId), amount: Number(row.amount), side: row.side as "debit" | "credit" }))
      .filter((entry) => entry.accountId > 0 && Number.isFinite(entry.amount) && entry.amount > 0);

    const creditEntries = creditRows
      .map((row) => ({ accountId: Number(row.accountId), amount: Number(row.amount), side: row.side as "debit" | "credit" }))
      .filter((entry) => entry.accountId > 0 && Number.isFinite(entry.amount) && entry.amount > 0);

    if (!date || !trimmedDescription || debitEntries.length === 0 || creditEntries.length === 0) {
      return;
    }

    const payload = {
      date,
      description: trimmedDescription,
      entries: [...debitEntries, ...creditEntries],
    };

    if (direction === "debit") {
      await saveDebitVoucher(payload);
    } else {
      await saveCreditVoucher(payload);
    }

    setDate(new Date().toISOString().slice(0, 10));
    setDescription("");
    setDebitRows([createEmptyRow("debit")]);
    setCreditRows([createEmptyRow("credit")]);
    router.refresh();
    router.push("/");
  }

  const debitAccounts = accounts;
  const creditAccounts = accounts;

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="mb-4">{direction === "debit" ? "Skapa kostnad" : "Skapa intäkt"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Datum</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Beskrivning</label>
              <input
                className="form-control"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Beskrivning"
              />
            </div>

            <div className="mb-4">
              {(direction === "debit" ? [
                { title: "Kredit", subtitle: "Valda konton måste ha kreditbalans", rows: creditRows, updateRow: updateCreditRow, removeRow: removeCreditRow, addRow: addCreditRow, accountOptions: creditAccounts },
                { title: "Debet", subtitle: "Valda konton måste ha debetbalans", rows: debitRows, updateRow: updateDebitRow, removeRow: removeDebitRow, addRow: addDebitRow, accountOptions: debitAccounts },
              ] : [
                { title: "Debet", subtitle: "Valda konton måste ha debetbalans", rows: debitRows, updateRow: updateDebitRow, removeRow: removeDebitRow, addRow: addDebitRow, accountOptions: debitAccounts },
                { title: "Kredit", subtitle: "Valda konton måste ha kreditbalans", rows: creditRows, updateRow: updateCreditRow, removeRow: removeCreditRow, addRow: addCreditRow, accountOptions: creditAccounts },
              ]).map((group) => (
                <RowGroup
                  key={group.title}
                  title={group.title}
                  subtitle={group.subtitle}
                  rows={group.rows}
                  updateRow={group.updateRow}
                  removeRow={group.removeRow}
                  addRow={group.addRow}
                  accountOptions={group.accountOptions}
                />
              ))}
            </div>

            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-primary">
                {direction === "debit" ? "Skapa kostnad" : "Skapa intäkt"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
