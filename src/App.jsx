import { useState, useEffect } from "react";
import "./App.css";
import CurrencyPicker from "./CurrencyPicker";
import RateChart from "./RateChart";
import Compare from "./Compare";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD"];

const TICKER_PAIRS = [
  { base: "USD", symbol: "EUR" },
  { base: "USD", symbol: "GBP" },
  { base: "USD", symbol: "JPY" },
  { base: "EUR", symbol: "GBP" },
  { base: "USD", symbol: "CHF" },
];

function App() {
  const [sendAmount, setSendAmount] = useState(1000);
  const [sendCurrency, setSendCurrency] = useState("USD");
  const [receiveCurrency, setReceiveCurrency] = useState("EUR");
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticker, setTicker] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(null);
  const [activeTab, setActiveTab] = useState("history");

  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || []
  );
  const [log, setLog] = useState(
    JSON.parse(localStorage.getItem("log")) || []
  );

  useEffect(() => {
    const fetchRate = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.frankfurter.dev/v1/latest?base=${sendCurrency}&symbols=${receiveCurrency}`
        );
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setRate(data.rates[receiveCurrency]);
      } catch (err) {
        setError("Impossible de récupérer le taux. Réessaie plus tard.");
        setRate(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRate();
  }, [sendCurrency, receiveCurrency]);

  useEffect(() => {
    const fetchTicker = async () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const todayStr = today.toISOString().slice(0, 10);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      const results = await Promise.all(
        TICKER_PAIRS.map(async (pair) => {
          try {
            const res = await fetch(
              `https://api.frankfurter.dev/v1/${yesterdayStr}..${todayStr}?base=${pair.base}&symbols=${pair.symbol}`
            );
            const data = await res.json();
            const dates = Object.keys(data.rates);
            const oldRate = data.rates[dates[0]][pair.symbol];
            const newRate = data.rates[dates[dates.length - 1]][pair.symbol];
            const change = (((newRate - oldRate) / oldRate) * 100).toFixed(2);

            return {
              label: `${pair.base}/${pair.symbol}`,
              rate: newRate,
              change,
            };
          } catch {
            return null;
          }
        })
      );

      setTicker(results.filter(Boolean));
    };

    fetchTicker();
  }, []);

  const receiveAmount = rate ? (sendAmount * rate).toFixed(2) : "...";

  const handleSwap = () => {
    let temp = sendCurrency;
    setSendCurrency(receiveCurrency);
    setReceiveCurrency(temp);
  };

  const pairKey = `${sendCurrency}/${receiveCurrency}`;
  const isFavorite = favorites.includes(pairKey);

  const toggleFavorite = () => {
    let updated;
    if (isFavorite) {
      updated = favorites.filter((f) => f !== pairKey);
    } else {
      updated = [...favorites, pairKey];
    }
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const togglePinPair = (key) => {
    let updated;
    if (favorites.includes(key)) {
      updated = favorites.filter((f) => f !== key);
    } else {
      updated = [...favorites, key];
    }
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const logConversion = () => {
    const entry = {
      id: Date.now(),
      pair: pairKey,
      send: sendAmount,
      receive: receiveAmount,
      time: new Date().toLocaleString(),
    };
    const updated = [entry, ...log];
    setLog(updated);
    localStorage.setItem("log", JSON.stringify(updated));
  };

  const deleteLogEntry = (id) => {
    const updated = log.filter((entry) => entry.id !== id);
    setLog(updated);
    localStorage.setItem("log", JSON.stringify(updated));
  };

  const clearLog = () => {
    setLog([]);
    localStorage.setItem("log", JSON.stringify([]));
  };

  return (
    <div className="app">
      <header className="header">
        <h1>FX Checker</h1>
        <p>{CURRENCIES.length} currencies · ECB data</p>
      </header>

      <section className="ticker">
        <h2>Live markets</h2>
        <div className="ticker-scroll">
          {ticker.map((item, i) => (
            <span key={i} className="ticker-item">
              {item.label} {item.rate.toFixed(4)}{" "}
              <span className={item.change >= 0 ? "up" : "down"}>
                {item.change >= 0 ? "▲" : "▼"} {Math.abs(item.change)}%
              </span>
            </span>
          ))}
        </div>
      </section>

      <section className="converter">
        <h2>Check the rate</h2>

        <div className="field">
          <label htmlFor="send">Send</label>
          <div className="input-row">
            <input
              id="send"
              type="number"
              value={sendAmount}
              onChange={(e) => setSendAmount(Number(e.target.value))}
            />
            <button className="currency-btn" onClick={() => setPickerOpen("send")}>
              {sendCurrency} ▾
            </button>
          </div>
        </div>

        <button className="swap-btn" onClick={handleSwap} aria-label="Swap currencies">
          ⇄
        </button>

        <div className="field">
          <label htmlFor="receive">Receive</label>
          <div className="input-row">
            <input id="receive" type="text" value={receiveAmount} readOnly />
            <button className="currency-btn" onClick={() => setPickerOpen("receive")}>
              {receiveCurrency} ▾
            </button>
          </div>
        </div>

        {loading && <p>Chargement du taux...</p>}
        {error && <p className="error">{error}</p>}
        {rate && (
          <p className="rate">
            1 {sendCurrency} = {rate.toFixed(4)} {receiveCurrency}
          </p>
        )}

        <div className="actions">
          <button onClick={toggleFavorite}>
            {isFavorite ? "★ Favorited" : "☆ Favorite"}
          </button>
          <button onClick={logConversion}>Log conversion</button>
        </div>
      </section>

      <div className="tabs">
        <button
          className={activeTab === "history" ? "tab-active" : ""}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
        <button
          className={activeTab === "compare" ? "tab-active" : ""}
          onClick={() => setActiveTab("compare")}
        >
          Compare
        </button>
        <button
          className={activeTab === "favorites" ? "tab-active" : ""}
          onClick={() => setActiveTab("favorites")}
        >
          Favorites ({favorites.length})
        </button>
        <button
          className={activeTab === "log" ? "tab-active" : ""}
          onClick={() => setActiveTab("log")}
        >
          Log ({log.length})
        </button>
      </div>

      {activeTab === "history" && (
        <section className="history">
          <h2>History</h2>
          <RateChart base={sendCurrency} symbol={receiveCurrency} />
        </section>
      )}

      {activeTab === "compare" && (
        <section className="compare-section">
          <h2>Compare</h2>
          <Compare
            sendAmount={sendAmount}
            sendCurrency={sendCurrency}
            favorites={favorites}
            onTogglePin={togglePinPair}
          />
        </section>
      )}

      {activeTab === "favorites" && (
        <section className="favorites">
          <h2>Pinned pairs ({favorites.length})</h2>
          {favorites.length === 0 ? (
            <p className="empty">
              No pinned pairs yet. Pin a pair to track its rate here.
            </p>
          ) : (
            <ul>
              {favorites.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {activeTab === "log" && (
        <section className="log">
          <div className="log-header">
            <h2>Conversion log ({log.length})</h2>
            {log.length > 0 && <button onClick={clearLog}>Clear all</button>}
          </div>
          {log.length === 0 ? (
            <p className="empty">
              No conversions logged yet. Every conversion is recorded here
              automatically when you tap Log conversion.
            </p>
          ) : (
            <ul>
              {log.map((entry) => (
                <li key={entry.id}>
                  <span>{entry.time}</span>
                  <span>{entry.pair}</span>
                  <span>
                    {entry.send} → {entry.receive}
                  </span>
                  <button onClick={() => deleteLogEntry(entry.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {pickerOpen && (
        <CurrencyPicker
          selected={pickerOpen === "send" ? sendCurrency : receiveCurrency}
          onSelect={(code) => {
            if (pickerOpen === "send") setSendCurrency(code);
            else setReceiveCurrency(code);
          }}
          onClose={() => setPickerOpen(null)}
        />
      )}
    </div>
  );
}

export default App;