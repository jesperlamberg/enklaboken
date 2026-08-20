import { Transaction } from "../models/Transaction";

type TransactionsTableProps = {
  transactions: Transaction[];
};

export function TransactionTable({ transactions }: TransactionsTableProps) {
  return (
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
  )
}
