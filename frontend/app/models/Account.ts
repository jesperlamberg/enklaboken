export type Account = {
  id: number;
  number: string;
  name: string;
  normalBalance: "debit" | "credit";
  active: boolean;
}
