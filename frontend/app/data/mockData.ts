export const accounts = [
  {
    id: 1,
    name: "Företagskonto"
  },
  {
    id: 2,
    name: "Moms"
  }
];

export const transactions = [
  {
    id: 1,
    accountId: 1,
    type: "income",
    description: "Avgift för tjänst",
    amount: 49,
    date: "2026-08-19"
  },
  {
    id: 2,
    accountId: 1,
    type: "expense",
    description: "Bränsle",
    amount: 800,
    date: "2026-08-19"
  }
]
