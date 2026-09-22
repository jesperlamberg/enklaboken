import { BalanceIndicator } from "./BalanceIndicator";

type BalanceFeedbackProps = {
  balanced: boolean;
  debitTotal: number;
  creditTotal: number;
};

export function BalanceFeedback({ balanced, debitTotal, creditTotal }: BalanceFeedbackProps) {
  const statusClass = balanced
    ? "border-success bg-success-subtle"
    : "border-warning bg-warning-subtle";
  const labelClass = balanced ? "text-success" : "text-warning-emphasis";

  return (
    <div className={`mt-3 p-3 border rounded ${statusClass}`}>
      <div className="d-flex align-items-center">
        <BalanceIndicator balanced={balanced} size="large" />
        <div>
          <div className={`fw-bold ${labelClass}`}>
            {balanced ? "Balanserad" : "Obalanserad"}
          </div>
          <div className="small">
            {balanced
              ? `Debet = Kredit (${debitTotal} kr)`
              : `Debet (${debitTotal} kr) ≠ Kredit (${creditTotal} kr)`}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary ms-auto"
          onClick={(event) => event.stopPropagation()}
        >
          Redigera verifikation
        </button>
      </div>
    </div>
  );
}
