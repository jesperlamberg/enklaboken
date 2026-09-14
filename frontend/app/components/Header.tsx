import Link from "next/link";

export function Header() {
  return (
    <header className="header">
      <Link href="/" className="header-brand">
        <span style={{ fontSize: "1.75rem" }}>📚</span>
        <h1>Enkelboken</h1>
      </Link>
      <nav className="header-nav" aria-label="Huvudnavigation">
        <Link className="nav-link" href="/">
          Översikt & Matchning
        </Link>
        <Link className="nav-link" href="/accounts">
          Kontoplan
        </Link>
        <Link className="btn btn-secondary btn-sm" href="/create-account">
          + Nytt konto
        </Link>
        <Link className="btn btn-primary btn-sm" href="/create-transaction">
          + Registrera transaktion
        </Link>
      </nav>
    </header>
  );
}

