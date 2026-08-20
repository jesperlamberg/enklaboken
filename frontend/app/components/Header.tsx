type HeaderProps = {
  onCreateAccount: () => void;
};

export function Header({ onCreateAccount }: HeaderProps) {
  return (
    <header>
      <h1>Enkelboken</h1>
      <div className="actions">
        <button onClick={onCreateAccount}>Skapa konto</button>
        <button>Skapa kostnad</button>
        <button>Skapa intäkt</button>
      </div>
    </header>
  )
}
