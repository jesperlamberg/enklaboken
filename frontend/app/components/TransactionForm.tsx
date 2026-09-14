"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useRef } from "react";
import { saveTransaction } from "../actions/transactionActions";
import { Account } from "../models/Account";
import { VirtualAllocation, calculateMatchingStatus, Transaction } from "../models/Transaction";
import { calculateVatSplit } from "../services/TransactionService";
import Link from "next/link";

type TransactionFormProps = {
  accounts: Account[];
  initialType?: "debit" | "credit";
};

export function TransactionForm({ accounts, initialType = "credit" }: TransactionFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const physicalAccounts = accounts.filter((a) => a.type === "physical" && a.active);
  const virtualAccounts = accounts.filter((a) => a.type === "virtual" && a.active);

  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [physicalAccountId, setPhysicalAccountId] = useState<number>(
    physicalAccounts[0]?.id || 0
  );
  // type: 'credit' = Utbetalning från bank, 'debit' = Inbetalning till bank
  const [type, setType] = useState<"debit" | "credit">(initialType);
  const [amount, setAmount] = useState<string>("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [virtualAllocations, setVirtualAllocations] = useState<VirtualAllocation[]>([]);
  const [selectedVirtualAccountForQuickAdd, setSelectedVirtualAccountForQuickAdd] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numAmount = parseFloat(amount) || 0;

  // Mock transaction object to calculate live matching status
  const liveTransaction: Transaction = {
    id: 0,
    transactionNumber: 0,
    date,
    description,
    physicalAccountId,
    type,
    amount: numAmount,
    virtualAllocations,
  };

  const { status, allocatedAmount, difference } = calculateMatchingStatus(liveTransaction);

  function handleAutoSplitWithAccount(virtualAccountId: number) {
    if (numAmount <= 0) {
      setError("Ange först ett belopp på transaktionen innan du väljer BAS-konto för automatisk moms.");
      return;
    }

    const selectedAcc = virtualAccounts.find((a) => a.id === virtualAccountId);
    if (!selectedAcc) return;

    setError(null);

    // Opposite type for virtual allocation:
    // If physical is credit (outflow), virtual expense is debit.
    // If physical is debit (inflow), virtual revenue is credit.
    const virtualType: "debit" | "credit" = type === "credit" ? "debit" : "credit";

    if (selectedAcc.defaultVatRate && selectedAcc.defaultVatRate > 0 && selectedAcc.vatAccountId) {
      const { net, vat } = calculateVatSplit(numAmount, selectedAcc.defaultVatRate);
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

      setVirtualAllocations(newAllocations);
    } else {
      // 100% to this account
      setVirtualAllocations([
        {
          virtualAccountId: selectedAcc.id,
          amount: numAmount,
          type: virtualType,
          description: selectedAcc.name,
        },
      ]);
    }
  }

  function handleAddCustomAllocation() {
    const virtualType: "debit" | "credit" = type === "credit" ? "debit" : "credit";
    const defaultAcc = virtualAccounts[0];
    if (!defaultAcc) return;

    const remaining = Math.max(0, Math.round((numAmount - allocatedAmount) * 100) / 100);

    setVirtualAllocations([
      ...virtualAllocations,
      {
        virtualAccountId: defaultAcc.id,
        amount: remaining > 0 ? remaining : 0,
        type: virtualType,
        description: "",
      },
    ]);
  }

  function handleRemoveAllocation(index: number) {
    setVirtualAllocations(virtualAllocations.filter((_, i) => i !== index));
  }

  function handleUpdateAllocation(
    index: number,
    field: keyof VirtualAllocation,
    value: string | number
  ) {
    const next = [...virtualAllocations];
    next[index] = {
      ...next[index],
      [field]: field === "amount" ? Number(value) : value,
    };
    setVirtualAllocations(next);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!physicalAccountId) {
      setError("Välj ett fysiskt konto.");
      return;
    }

    if (numAmount <= 0) {
      setError("Beloppet måste vara större än 0.");
      return;
    }

    if (!description.trim()) {
      setError("Beskrivning måste anges.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.set("date", date);
      formData.set("description", description.trim());
      formData.set("physicalAccountId", physicalAccountId.toString());
      formData.set("type", type);
      formData.set("amount", numAmount.toString());

      if (receiptFile) {
        formData.set("receipt", receiptFile);
      }

      formData.set("virtualAllocations", JSON.stringify(virtualAllocations));

      await saveTransaction(formData);

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Kunde inte spara transaktionen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="card-header">
        <div>
          <h2>Registrera fysisk transaktion</h2>
          <p>Bokför händelse på bank/kassa och matcha mot virtuella BAS-konton.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Physical Account & Direction */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.0625rem", marginBottom: "0.75rem", color: "var(--primary)" }}>
            1. Fysiskt konto & Transaktionstyp
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="physicalAccount">Fysiskt konto</label>
              <select
                id="physicalAccount"
                className="form-select"
                value={physicalAccountId}
                onChange={(e) => setPhysicalAccountId(Number(e.target.value))}
                required
              >
                {physicalAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.number} - {acc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Riktning</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <button
                  type="button"
                  className={`btn ${type === "credit" ? "btn-danger" : "btn-secondary"}`}
                  onClick={() => setType("credit")}
                  style={{ fontWeight: 600 }}
                >
                  🔴 Utbetalning (Köp/Kredit)
                </button>
                <button
                  type="button"
                  className={`btn ${type === "debit" ? "btn-success" : "btn-secondary"}`}
                  onClick={() => setType("debit")}
                  style={{ fontWeight: 600 }}
                >
                  🟢 Inbetalning (Sälj/Debet)
                </button>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="txAmount">Totalt belopp (SEK)</label>
              <input
                id="txAmount"
                type="number"
                step="0.01"
                min="0.01"
                className="form-control font-mono"
                style={{ fontSize: "1.125rem", fontWeight: 700 }}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="txDate">Bokföringsdatum</label>
              <input
                id="txDate"
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="txDesc">Beskrivning</label>
            <input
              id="txDesc"
              className="form-control"
              placeholder="t.ex. Drivmedel bensinmack, Konsultarvode, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Receipt Upload */}
          <div className="form-group">
            <label htmlFor="receiptUpload">Kvitto / Underlag (PDF, PNG, JPG)</label>
            <input
              id="receiptUpload"
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              className="form-control"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setReceiptFile(e.target.files[0]);
                } else {
                  setReceiptFile(null);
                }
              }}
            />
            {receiptFile && (
              <div style={{ marginTop: "0.375rem", fontSize: "0.8125rem", color: "var(--success)" }}>
                ✓ Vald fil: {receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Virtual BAS Matching */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h3 style={{ fontSize: "1.0625rem", color: "var(--primary)" }}>
              2. Matchning mot Virtuella konton (BAS)
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddCustomAllocation}
            >
              + Lägg till rad manuellt
            </button>
          </div>

          {/* Quick Auto-VAT selection box */}
          <div
            style={{
              padding: "0.875rem",
              background: "var(--primary-light)",
              border: "1px solid #bfdbfe",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
            }}
          >
            <label style={{ color: "var(--primary-hover)", fontWeight: 600 }}>
              ⚡ Snabbmatcha med automatisk moms:
            </label>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.375rem" }}>
              <select
                className="form-select"
                value={selectedVirtualAccountForQuickAdd}
                onChange={(e) => setSelectedVirtualAccountForQuickAdd(e.target.value)}
              >
                <option value="">-- Välj kostnads-/intäktskonto --</option>
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
                className="btn btn-primary"
                onClick={() => {
                  if (selectedVirtualAccountForQuickAdd) {
                    handleAutoSplitWithAccount(Number(selectedVirtualAccountForQuickAdd));
                  }
                }}
                disabled={!selectedVirtualAccountForQuickAdd}
              >
                Autofördela
              </button>
            </div>
            <div className="form-help" style={{ color: "#1e40af" }}>
              Räknar automatiskt ut moms och nettobelopp för hela transaktionen.
            </div>
          </div>

          {/* Matching Lines */}
          {virtualAllocations.length === 0 ? (
            <div
              style={{
                padding: "1.5rem",
                textAlign: "center",
                background: "var(--bg-muted)",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--border-color)",
                color: "var(--text-muted)",
              }}
            >
              Inga virtuella rader matchade ännu. Använd snabbmatcharen ovan eller lägg till rader manuellt.
            </div>
          ) : (
            <div className="matching-box">
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "0.5rem", marginBottom: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-muted)" }}>
                <div>Virtuellt BAS-konto</div>
                <div>Beskrivning</div>
                <div className="text-right">Belopp (kr)</div>
                <div></div>
              </div>

              {virtualAllocations.map((line, index) => (
                <div key={index} className="matching-row">
                  <select
                    className="form-select"
                    value={line.virtualAccountId}
                    onChange={(e) =>
                      handleUpdateAllocation(index, "virtualAccountId", Number(e.target.value))
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
                    placeholder="t.ex. Drivmedel"
                    value={line.description || ""}
                    onChange={(e) =>
                      handleUpdateAllocation(index, "description", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    step="0.01"
                    className="form-control font-mono text-right"
                    value={line.amount}
                    onChange={(e) =>
                      handleUpdateAllocation(index, "amount", e.target.value)
                    }
                  />

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveAllocation(index)}
                    title="Ta bort rad"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Live Matching Status Banner */}
          {numAmount > 0 && (
            <div className={`balance-indicator ${status}`}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {status === "matched" && (
                  <>
                    <span style={{ fontSize: "1.25rem" }}>✓</span>
                    <span>
                      <strong>Perfekt matchad!</strong> Fysiskt belopp matchar virtuella BAS-konton exakt.
                    </span>
                  </>
                )}
                {status === "unmatched" && (
                  <>
                    <span style={{ fontSize: "1.25rem" }}>⚠️</span>
                    <span>
                      <strong>Omatchad!</strong> Hela beloppet ({numAmount.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr) återstår att fördela.
                    </span>
                  </>
                )}
                {status === "partial" && (
                  <>
                    <span style={{ fontSize: "1.25rem" }}>⏳</span>
                    <span>
                      <strong>Delvis matchad:</strong> {difference.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr återstår att fördela.
                    </span>
                  </>
                )}
                {status === "imbalanced" && (
                  <>
                    <span style={{ fontSize: "1.25rem" }}>✕</span>
                    <span>
                      <strong>Felaktig matchning:</strong> Virtuellt belopp överstiger fysiskt belopp med {Math.abs(difference).toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr.
                    </span>
                  </>
                )}
              </div>
              <div className="font-mono" style={{ fontWeight: 700 }}>
                {allocatedAmount.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} / {numAmount.toLocaleString("sv-SE", { minimumFractionDigits: 2 })} kr
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem" }}>
          <Link href="/" className="btn btn-secondary">
            Avbryt
          </Link>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Sparar..." : "Spara transaktion"}
          </button>
        </div>
      </form>
    </div>
  );
}
