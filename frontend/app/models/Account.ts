export type AccountType = "physical" | "virtual";

export type Account = {
  id: number;
  number: string;
  name: string;
  type: AccountType;
  defaultVatRate?: number; // e.g. 25, 12, 6, 0
  vatAccountId?: number; // target VAT virtual account id
  active: boolean;
  description?: string;
  closedAt?: string;
};

