let accounts = [
  {
    id: 1,
    name: "Företagskonto"
  },
  {
    id: 2,
    name: "Moms"
  }
];

let transactions = [
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

function getBalance(accountId: number) {
  return transactions
    .filter((transaction) => transaction.accountId === accountId)
    .reduce((balance, transaction) => {
      if (transaction.type === "income") {
        return balance + transaction.amount;
      }

      return balance - transaction.amount;
    }, 0);
}

export default function Home() {
  return (
    <>
      <header>
        <h1>Enkelboken</h1>
        <div className="actions">
          <button>Skapa konto</button>
          <button>Skapa kostnad</button>
          <button>Skapa utgift</button>
        </div>
      </header>
      <main>
        <section id="accounts">
          <h2>Konton</h2>
          <table>
            <thead>
              <tr>
                <th>Konto</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.name}</td>
                  <td>{getBalance(account.id)} kr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="transactions">
          <h2>Transaktioner</h2>
          <table>
            <thead>
              <tr>
                <th>Beskrivning</th>
                <th>Belopp</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.description}</td>
                  <td>{transaction.type === "income" ? "+" : "-"} {transaction.amount} kr</td>
                  <td>{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}

// Account

// Income

// Expense
