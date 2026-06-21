import { useState, useEffect } from "react";

const ALL_CURRENCIES = ["EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "USD"];

function Compare({ sendAmount, sendCurrency, favorites, onTogglePin }) {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(false);

  const targets = ALL_CURRENCIES.filter((c) => c !== sendCurrency);

  useEffect(() => {
    if (!sendAmount || sendAmount <= 0) return;

    const fetchRates = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.frankfurter.dev/v1/latest?base=${sendCurrency}&symbols=${targets.join(",")}`
        );
        const data = await res.json();
        setRates(data.rates);
      } catch (err) {
        setRates({});
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [sendCurrency, sendAmount]);

  if (!sendAmount || sendAmount <= 0) {
    return (
      <div className="compare-empty">
        <p>No comparison available</p>
        <p className="empty">
          Enter an amount in Send above to see what your money is worth in
          other currencies.
        </p>
      </div>
    );
  }

  return (
    <div className="compare">
      <h3>Multi-currency</h3>
      <p className="compare-meta">
        {sendAmount.toLocaleString()} from {sendCurrency} · {targets.length}{" "}
        pairs
      </p>

      {loading && <p>Chargement...</p>}

      <ul>
        {targets.map((code) => {
          const rate = rates[code];
          if (!rate) return null;
          const converted = (sendAmount * rate).toFixed(2);
          const pairKey = `${sendCurrency}/${code}`;
          const isPinned = favorites.includes(pairKey);

          return (
            <li key={code} className="compare-row">
              <span className="compare-code">{code}</span>
              <span className="compare-amount">{converted}</span>
              <span className="compare-rate">@ {rate.toFixed(4)}</span>
              <button
                className={`pin-btn ${isPinned ? "pinned" : ""}`}
                onClick={() => onTogglePin(pairKey)}
                aria-label={isPinned ? "Unpin pair" : "Pin pair"}
              >
                {isPinned ? "★" : "☆"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Compare;