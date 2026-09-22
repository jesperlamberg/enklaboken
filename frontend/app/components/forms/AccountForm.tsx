"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { saveAccount, updateAccount } from "../../actions/accountActions";
import { Account, AccountType } from "../../models/Account";
import { getVatAccounts } from "../../services/AccountService";
import Link from "next/link";

type AccountFormProps =
  | { mode: "create"; existingAccounts: Account[] }
  | { mode: "edit"; account: Account; allAccounts: Account[] };

export function AccountForm(props: AccountFormProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const account = isEdit ? props.account : undefined;
  const vatAccountPool = isEdit ? props.allAccounts : props.existingAccounts;

  const [accountType, setAccountType] = useState<AccountType>(account?.type || "physical");
  const [accountNumber, setAccountNumber] = useState(account?.number || "");
  const [accountName, setAccountName] = useState(account?.name || "");
  const [description, setDescription] = useState(account?.description || "");
  const [defaultVatRate, setDefaultVatRate] = useState<number>(account?.defaultVatRate || 0);
  const [vatAccountId, setVatAccountId] = useState<number | undefined>(account?.vatAccountId);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const virtualVatAccounts = getVatAccounts(vatAccountPool, account?.id);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!accountNumber.trim() || !accountName.trim()) {
      setError("Vänligen fyll i både kontonummer och namn.");
      return;
    }

    const payload = {
      number: accountNumber.trim(),
      name: accountName.trim(),
      type: accountType,
      description: description.trim() || undefined,
      defaultVatRate: accountType === "virtual" ? defaultVatRate : undefined,
      vatAccountId: accountType === "virtual" && defaultVatRate > 0 ? vatAccountId : undefined,
    };

    try {
      setIsSubmitting(true);
      if (isEdit) {
        await updateAccount(props.account.id, payload);
      } else {
        await saveAccount(payload);
      }

      router.push("/accounts");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : `Ett fel uppstod vid ${isEdit ? "uppdateringen" : "skapandet"} av kontot.`
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div className="card-header">
        <h2>{isEdit ? `Redigera konto ${props.account.number}` : "Skapa nytt konto"}</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Kontotyp</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem",
                border: `2px solid ${accountType === "physical" ? "var(--primary)" : "var(--border-color)"}`,
                borderRadius: "var(--radius-md)",
                background: accountType === "physical" ? "var(--primary-light)" : "var(--bg-card)",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="accountType"
                value="physical"
                checked={accountType === "physical"}
                onChange={() => setAccountType("physical")}
              />
              <div>
                <strong>🏦 Fysiskt konto</strong>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  Bankkonto, Kassa, Skattekonto
                </div>
              </div>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem",
                border: `2px solid ${accountType === "virtual" ? "var(--primary)" : "var(--border-color)"}`,
                borderRadius: "var(--radius-md)",
                background: accountType === "virtual" ? "var(--primary-light)" : "var(--bg-card)",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="accountType"
                value="virtual"
                checked={accountType === "virtual"}
                onChange={() => setAccountType("virtual")}
              />
              <div>
                <strong>📊 Virtuellt konto (BAS)</strong>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                  Kostnader, Intäkter, Moms
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="accountNumber">Kontonummer</label>
            <input
              id="accountNumber"
              className="form-control font-mono"
              placeholder={accountType === "physical" ? "t.ex. 1930" : "t.ex. 5611"}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
            {!isEdit && (
              <div className="form-help">
                {accountType === "physical" ? "Typiskt 1910-1940" : "Konto ur BAS-kontoplanen"}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="accountName">Kontonamn</label>
            <input
              id="accountName"
              className="form-control"
              placeholder={accountType === "physical" ? "t.ex. Företagskonto Handelsbanken" : "t.ex. Drivmedel"}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Beskrivning {isEdit ? "" : "(valfritt)"}</label>
          <input
            id="description"
            className="form-control"
            placeholder="Valfri anteckning om hur kontot ska användas"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {accountType === "virtual" && (
          <div
            style={{
              padding: "1rem",
              background: "var(--bg-muted)",
              borderRadius: "var(--radius-md)",
              marginBottom: "1.25rem",
              border: "1px solid var(--border-color)",
            }}
          >
            <h4 style={{ fontSize: "0.9375rem", marginBottom: "0.75rem" }}>⚙️ Momsautomatik</h4>
            <div className="form-row" style={{ marginBottom: 0 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="vatRate">Standard momssats</label>
                <select
                  id="vatRate"
                  className="form-select"
                  value={defaultVatRate}
                  onChange={(e) => setDefaultVatRate(Number(e.target.value))}
                >
                  <option value={0}>0% (Ingen moms / momsbefriad)</option>
                  <option value={25}>25% (Standard)</option>
                  <option value={12}>12% (Mat, hotell m.m.)</option>
                  <option value={6}>6% (Böcker, resor, kultur)</option>
                </select>
                <div className="form-help">
                  Vid registrering av transaktioner föreslås moms automatiskt.
                </div>
              </div>

              {defaultVatRate > 0 && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="vatAccount">Kopplat momskonto</label>
                  <select
                    id="vatAccount"
                    className="form-select"
                    value={vatAccountId || ""}
                    onChange={(e) =>
                      setVatAccountId(e.target.value ? Number(e.target.value) : undefined)
                    }
                  >
                    <option value="">-- Välj momskonto --</option>
                    {virtualVatAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.number} - {acc.name}
                      </option>
                    ))}
                  </select>
                  <div className="form-help">
                    T.ex. 2641 (Ingående moms vid köp) eller 2611 (Utgående vid försäljning)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
          <Link href="/accounts" className="btn btn-secondary">
            Avbryt
          </Link>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? "Sparar..." : "Skapar...") : isEdit ? "Spara ändringar" : "Skapa konto"}
          </button>
        </div>
      </form>
    </div>
  );
}
