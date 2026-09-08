import Link from "next/link";

export function Header() {
  return (
    <header className="py-3 mb-4 border-bottom">
      <div className="container d-flex flex-wrap align-items-center justify-content-between gap-3">
        <h1 className="h3 mb-0">Enkelboken</h1>
        <nav aria-label="Huvudnavigation">
          <ul className="nav gap-2 mb-0">
            <li className="nav-item">
              <Link className="btn btn-outline-secondary btn-sm" href="/create-account">Skapa konto</Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-outline-primary btn-sm" href="/create-debit">Skapa kostnad</Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-outline-primary btn-sm" href="/create-credit">Skapa intäkt</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
