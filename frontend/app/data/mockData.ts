import { Account } from "../models/Account";
import { Voucher } from "../models/Voucher";

export const initialAccounts: Account[] = [
  {
    id: 1,
    number: "1930",
    name: "Företagskonto/checkkonto/affärskonto",
    normalBalance: "debit",
    active: true
  },
  {
    id: 2,
    number: "2611",
    name: "Utgående moms på försäljning inom Sverige, 25 %",
    normalBalance: "credit",
    active: true
  },
  {
    id: 3,
    number: "2641",
    name: "Debiterad ingående moms",
    normalBalance: "debit",
    active: true
  },
  {
    id: 4,
    number: "3010",
    name: "Försäljning",
    normalBalance: "credit",
    active: true
  },
  {
    id: 5,
    number: "5611",
    name: "Drivmedel",
    normalBalance: "debit",
    active: true
  }
];

export const initialVouchers: Voucher[] = [
  {
    id: 1,
    voucherNumber: 1,
    date: "2026-08-19",
    description: "Försäljning av tjänst",
    entries: [
      {
        accountId: 1,
        debit: 1250,
        credit: 0
      },
      {
        accountId: 4,
        debit: 0,
        credit: 1000
      },
      {
        accountId: 2,
        debit: 0,
        credit: 250
      }
    ]
  },
  {
    id: 2,
    voucherNumber: 2,
    date: "2026-08-19",
    description: "Bränsle",
    entries: [
      {
        accountId: 5,
        debit: 640,
        credit: 0
      },
      {
        accountId: 3,
        debit: 160,
        credit: 0
      },
      {
        accountId: 1,
        debit: 0,
        credit: 800
      }
    ]
  }
]
