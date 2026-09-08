"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { saveAccount } from "../actions/accountActions";

export default function CreateAccountPage() {
  const router = useRouter();
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNormalBalance, setAccountNormalBalance] = useState<"debit" | "credit" | "">("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accountNumber || !accountName || !accountNormalBalance) {
      return;
    }

    await saveAccount({
      number: accountNumber,
      name: accountName,
      normalBalance: accountNormalBalance,
    });

    setAccountNumber("");
    setAccountName("");
    setAccountNormalBalance("");
    router.refresh();
    router.push("/");
  }

  return (
    <div className="container py-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="mb-4">Skapa konto</h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Nummer</label>
                <input
                  className="form-control"
                  placeholder="Nummer"
                  value={accountNumber}
                  onChange={(event) => setAccountNumber(event.target.value)}
                />
              </div>
              <div className="col-md-5">
                <label className="form-label">Namn</label>
                <input
                  className="form-control"
                  placeholder="Namn"
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Typ</label>
                <select
                  className="form-select"
                  value={accountNormalBalance}
                  onChange={(event) => setAccountNormalBalance(event.target.value as "debit" | "credit")}
                >
                  <option value="" disabled hidden>
                    Typ
                  </option>
                  <option value="debit">Debet</option>
                  <option value="credit">Kredit</option>
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button type="submit" className="btn btn-primary">Skapa konto</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
