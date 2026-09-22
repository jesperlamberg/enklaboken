type BalanceIndicatorProps = {
  balanced: boolean;
  size: "small" | "large";
};

export function BalanceIndicator({ balanced, size }: BalanceIndicatorProps) {
  const isLarge = size === "large";
  const statusClass = balanced
    ? "border-success text-success"
    : "border-warning text-warning";
  const dimension = isLarge ? "2.8rem" : "2.4rem";

  return (
    <span
      className={`d-inline-flex align-items-center justify-content-center border border-2 rounded-circle ${statusClass}${
        isLarge ? " me-3 flex-shrink-0" : ""
      }`}
      style={{ width: dimension, height: dimension }}
      title={balanced ? "Balanserad" : "Obalanserad"}
    >
      {isLarge ? <strong>{balanced ? "✓" : "!"}</strong> : balanced ? "✓" : "!"}
    </span>
  );
}
