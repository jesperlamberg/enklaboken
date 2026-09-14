"use client";

import { useState } from "react";
import { Account } from "../models/Account";
import {
  Transaction,
  VirtualAllocation,
  calculateMatchingStatus,
} from "../models/Transaction";
import {
  updateTransactionAllocations,
  attachReceiptToTransaction,
  deleteTransaction,
} from "../actions/transactionActions";
import { calculateVatSplit } from "../services/TransactionService";

type TransactionsTableProps = {
  transactions: Transaction[];
  accounts: Account[];
};

export function TransactionsTable({ transactions, accounts }: TransactionsTableProps) {
  const [activeMatchingTxId, setActiveMatchingTxId] = useState<number | null>(null);
  const [editingAllocations, setEditingAllocations] = useState<Record<number, VirtualAllocation[]>>({});
  const [uploadingTxId, setUploadingTxId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedQuickVirtualId, setSelectedQuickVirtualId] = useState<string>("");

  const physicalAccounts = accounts.filter((a) => a.type === "physical");
  const virtualAccounts = accounts.filter((a) => a.type === "virtual");

  function getAccount(id: number) {
    return accounts.find((a) => a.id === id);
  }

  function startMatching(tx: Transaction) {
    if (activeMatchingTxId === tx.id) {
      setActiveMatchingTxId(null);
    } else {
      setActiveMatchingTxId(tx.id);
      setEditingAllocations({
        ...editingAllocations,
        [tx.id]: tx.virtualAllocations.length > 0 ? [...tx.virtualAllocations] : [],
      });
      setSelectedQuickVirtualId("");
    }
  }

  function handleAutoSplit(tx: Transaction, virtualAccountId: number) {
    const selectedAcc = virtualAccounts.find((a) => a.id === virtualAccountId);
    if (!selectedAcc) return;

    const virtualType: "debit" | "credit" = tx.type === "credit" ? "debit" : "credit";

    if (selectedAcc.defaultVatRate && selectedAcc.defaultVatRate > 0 && selectedAcc.vatAccountId) {
      const { net, vat } = calculateVatSplit(tx.amount, selectedAcc.defaultVatRate);
      const vatAcc = virtualAccounts.find((a) => a.id === selectedAcc.vatAccountId);

      const newAllocations: VirtualAllocation[] = [
        {
          virtualAccountId: selectedAcc.id,
          amount: net,
          type: virtualType,
          description: selectedAcc.name,
        },
      ];

      if (vatAcc) {
        newAllocations.push({
          virtualAccountId: vatAcc.id,
          amount: vat,
          type: virtualType,
          description: `Moms (${selectedAcc.defaultVatRate}%)`,
        });
      }

      setEditingAllocations({
        ...editingAllocations,
        [tx.id]: newAllocations,
      });
    } else {
      setEditingAllocations({
        ...editingAllocations,
        [tx.id]: [
          {
            virtualAccountId: selectedAcc.id,
            amount: tx.amount,
            type: virtualType,
            description: selectedAcc.name,
          },
        ],
      });
    }
  }

  function handleAddLine(tx: Transaction) {
    const current = editingAllocations[tx.id] || [];
    const virtualType: "debit" | "credit" = tx.type === "credit" ? "debit" : "credit";
    const defaultAcc = virtualAccounts[0];
    if (!defaultAcc) return;

    const currentAllocated = current.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
    const remaining = Math.max(0, Math.round((tx.amount - currentAllocated) * 100) / 100);

    setEditingAllocations({
      ...editingAllocations,
      [tx.id]: [
        ...current,
        {
          virtualAccountId: defaultAcc.id,
          amount: remaining,
          type: virtualType,
          description: "",
        },
      ],
    });
  }

  function handleRemoveLine(txId: number, index: number) {
    const current = editingAllocations[txId] || [];
    setEditingAllocations({
      ...editingAllocations,
      [txId]: current.filter((_, i) => i !== index),
    });
  }

  function handleUpdateLine(
    txId: number,
    index: number,
    field: keyof VirtualAllocation,
    value: string | number
  ) {
    const current = [...(editingAllocations[txId] || [])];
    current[index] = {
      ...current[index],
      [field]: field === "amount" ? Number(value) : value,
    };
    setEditingAllocations({
      ...editingAllocations,
      [txId]: current,
    });
  }

  async function handleSaveMatching(txId: number) {
    const allocations = editingAllocations[txId] || [];
    try {
      setIsSaving(true);
      await updateTransactionAllocations(txId, allocations);
      setActiveMatchingTxId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Kunde inte spara matchning");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReceiptUpload(txId: number, file: File) {
    try {
      setUploadingTxId(txId);
      const formData = new FormData();
      formData.set("receipt", file);
      await attachReceiptToTransaction(txId, formData);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Kunde inte ladda upp kvitto");
    } finally {
      setUploadingTxId(null);
    }
  }

  async function handleDelete(txId: number) {
    if (confirm("Är du säker på att du vill radera denna transaktion?")) {
      await deleteTransaction(txId);
    }
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Datum</th>
            <th>Beskrivning</th>
            <th>Fysiskt konto</th>
            <th>Typ</th>
            <th className="text-right">Belopp</th>
            <th>Kvitto</th>
            <th>Matchade BAS-konton</th>
            <th>Status</th>
            <th className="text-right">Åtgärd</th>
          </tr>
        </thead>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center" style={{ padding: "2.5rem", color: "var(--text-muted)" }}>
                Inga transaktioner registrerade ännu. Klicka på "+ Registrera transaktion" för att komma igång!
              </td>
            </tr>
          ) : (
            transactions.map((tx) => {
              const physicalAcc = getAccount(tx.physicalAccountId);
              const { status, allocatedAmount, difference } = calculateMatchingStatus(tx);
              const isOutflow = tx.type === "credit";
              const isEditing = activeMatchingTxId === tx.id;
              const currentEditingLines = editingAllocations[tx.id] || tx.virtualAllocations || [];

              const editingStats = calculateMatchingStatus({
                ...tx,
                virtualAllocations: currentEditingLines,
              });

              return (
                <tbody key={tx.id} style={{ borderBottom: "2px solid var(--border-color)" }}>
                  <tr>
                    <td className="font-mono" style={{ fontWeight: 600 }}>
                      #{tx.transactionNumber || tx.id}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{tx.date}</td>
                    <td>
                      <strong>{tx.description}</strong>
                    </td>
                    <td>
                      <span className="badge badge-physical">
                        🏦 {physicalAcc ? `${physicalAcc.number} ${physicalAcc.name}` : `Konto #${tx.physicalAccountId}`}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: isOutflow ? "var(--danger-bg)" : "var(--success-bg)",
                          color: isOutflow ? "var(--danger)" : "var(--success)",
                          border: `1px solid ${isOutflow ? "var(--danger-border)" : "var(--success-border)"}`,
                        }}
                      >
                        {isOutflow ? "🔴 Utbetalning" : "🟢 Inbetalning"}
                      </span>
                    </td>
                    <td className="text-right font-mono" style={{ fontWeight: 700 }}>
                      {tx.amount.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
                    </td>
                    <td>
                      {tx.receiptUrl ? (
                        <a
                          href={tx.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="badge badge-receipt"
                          style={{ textDecoration: "none" }}
                          title="Öppna kvitto"
                        >
                          📎 {tx.receiptFileName || "Kvitto"}
                        </a>
                      ) : (
                        <label
                          className="btn btn-secondary btn-sm"
                          style={{ cursor: "pointer", margin: 0, padding: "0.2rem 0.5rem" }}
                        >
                          {uploadingTxId === tx.id ? "Laddar upp..." : "+ Kvitto"}
                          <input
                            type="file"
                            accept=".pdf,image/png,image/jpeg,image/webp"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleReceiptUpload(tx.id, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                        {tx.virtualAllocations.length === 0 ? (
                          <span style={{ color: "var(--text-light)", fontSize: "0.8125rem" }}>
                            Ej fördelad
                          </span>
                        ) : (
                          tx.virtualAllocations.map((v, i) => {
                            const vAcc = getAccount(v.virtualAccountId);
                            return (
                              <span key={i} className="badge badge-virtual" style={{ fontSize: "0.75rem" }}>
                                {vAcc ? vAcc.number : v.virtualAccountId}: {v.amount.toLocaleString("sv-SE")} kr
                              </span>
                            );
                          })
                        )}
                      </div>
                    </td>
                    <td>
                      {status === "matched" && (
                        <span className="badge badge-matched">
                          ✓ Matchad
                        </span>
                      )}
                      {status === "unmatched" && (
                        <span className="badge badge-unmatched">
                          ⚠️ Omatchad
                        </span>
                      )}
                      {status === "partial" && (
                        <span className="badge badge-partial" title={`${difference} kr kvar att matcha`}>
                          ⏳ {difference.toLocaleString("sv-SE")} kr kvar
                        </span>
                      )}
                      {status === "imbalanced" && (
                        <span className="badge badge-imbalanced" title={`Överskjuter med ${Math.abs(difference)} kr`}>
                          ✕ Differens {Math.abs(difference).toLocaleString("sv-SE")} kr
                        </span>
                      )}
                    </td>
                    <td className="text-right" style={{ whiteSpace: "nowrap" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => startMatching(tx)}
                        style={{ marginRight: "0.35rem" }}
                      >
                        {isEditing ? "Dölj" : "Matcha BAS"}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(tx.id)}
                        title="Radera transaktion"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>

                  {/* Inline BAS Matching Drawer */}
                  {isEditing && (
                    <tr>
                      <td colSpan={10} style={{ background: "var(--bg-muted)", padding: "1.25rem" }}>
                        <div style={{ maxWidth: "850px", margin: "0 auto" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                            <h4 style={{ margin: 0, fontSize: "1rem" }}>
                              Matcha transaktion #{tx.transactionNumber || tx.id} ({tx.amount.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr)
                            </h4>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleAddLine(tx)}
                              >
                                + Lägg till rad
                              </button>
                            </div>
                          </div>

                          {/* Quick Auto-split */}
                          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                            <select
                              className="form-select"
                              style={{ maxWidth: "400px" }}
                              value={selectedQuickVirtualId}
                              onChange={(e) => setSelectedQuickVirtualId(e.target.value)}
                            >
                              <option value="">-- Snabbval BAS-konto för auto-moms --</option>
                              {virtualAccounts
                                .filter((a) => !a.number.startsWith("26"))
                                .map((acc) => (
                                  <option key={acc.id} value={acc.id}>
                                    {acc.number} - {acc.name} {acc.defaultVatRate ? `(${acc.defaultVatRate}% moms)` : ""}
                                  </option>
                                ))}
                            </select>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              disabled={!selectedQuickVirtualId}
                              onClick={() => {
                                if (selectedQuickVirtualId) {
                                  handleAutoSplit(tx, Number(selectedQuickVirtualId));
                                }
                              }}
                            >
                              ⚡ Autofördela moms
                            </button>
                          </div>

                          {/* Allocation Rows */}
                          {currentEditingLines.length === 0 ? (
                            <div style={{ padding: "1rem", textAlign: "center", background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)", marginBottom: "1rem" }}>
                              Inga virtuella rader. Klicka på "Autofördela moms" eller "+ Lägg till rad".
                            </div>
                          ) : (
                            <div className="matching-box" style={{ background: "var(--bg-card)", marginBottom: "1rem" }}>
                              {currentEditingLines.map((line, index) => (
                                <div key={index} className="matching-row">
                                  <select
                                    className="form-select"
                                    value={line.virtualAccountId}
                                    onChange={(e) =>
                                      handleUpdateLine(tx.id, index, "virtualAccountId", Number(e.target.value))
                                    }
                                  >
                                    {virtualAccounts.map((acc) => (
                                      <option key={acc.id} value={acc.id}>
                                        {acc.number} - {acc.name}
                                      </option>
                                    ))}
                                  </select>

                                  <input
                                    className="form-control"
                                    placeholder="Beskrivning"
                                    value={line.description || ""}
                                    onChange={(e) =>
                                      handleUpdateLine(tx.id, index, "description", e.target.value)
                                    }
                                  />

                                  <input
                                    type="number"
                                    step="0.01"
                                    className="form-control font-mono text-right"
                                    value={line.amount}
                                    onChange={(e) =>
                                      handleUpdateLine(tx.id, index, "amount", e.target.value)
                                    }
                                  />

                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRemoveLine(tx.id, index)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Balance Summary & Actions */}
                          <div className={`balance-indicator ${editingStats.status}`}>
                            <div>
                              <strong>
                                {editingStats.status === "matched" && "✓ Perfekt matchad!"}
                                {editingStats.status === "unmatched" && "⚠️ Ej fördelad"}
                                {editingStats.status === "partial" && `⏳ ${editingStats.difference.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr återstår`}
                                {editingStats.status === "imbalanced" && `✕ Överskott med ${Math.abs(editingStats.difference).toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr`}
                              </strong>
                            </div>
                            <div className="font-mono">
                              {editingStats.allocatedAmount.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} / {tx.amount.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => setActiveMatchingTxId(null)}
                            >
                              Avbryt
                            </button>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              disabled={isSaving}
                              onClick={() => handleSaveMatching(tx.id)}
                            >
                              {isSaving ? "Sparar..." : "Spara matchning"}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })
          )}
      </table>
    </div>
  );
}
