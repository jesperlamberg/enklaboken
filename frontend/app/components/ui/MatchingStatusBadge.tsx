import { MatchingStatus } from "../../models/Transaction";
import { Badge } from "./Badge";

type MatchingStatusBadgeProps = {
  status: MatchingStatus;
  difference: number;
};

export function MatchingStatusBadge({ status, difference }: MatchingStatusBadgeProps) {
  switch (status) {
    case "matched":
      return <Badge variant="matched">✓ Matchad</Badge>;
    case "unmatched":
      return <Badge variant="unmatched">⚠️ Omatchad</Badge>;
    case "partial":
      return (
        <Badge variant="partial" title={`${difference} kr kvar att matcha`}>
          ⏳ {difference.toLocaleString("sv-SE")} kr kvar
        </Badge>
      );
    case "imbalanced":
      return (
        <Badge variant="imbalanced" title={`Överskjuter med ${Math.abs(difference)} kr`}>
          ✕ Differens {Math.abs(difference).toLocaleString("sv-SE")} kr
        </Badge>
      );
  }
}
