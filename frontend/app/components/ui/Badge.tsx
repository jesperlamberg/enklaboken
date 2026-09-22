import { CSSProperties, ReactNode } from "react";

type BadgeVariant =
  | "physical"
  | "virtual"
  | "receipt"
  | "matched"
  | "unmatched"
  | "partial"
  | "imbalanced";

type BadgeProps = {
  variant?: BadgeVariant;
  title?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function Badge({ variant, title, style, children }: BadgeProps) {
  const className = variant ? `badge badge-${variant}` : "badge";
  return (
    <span className={className} title={title} style={style}>
      {children}
    </span>
  );
}
