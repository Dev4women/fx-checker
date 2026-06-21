import { useState } from "react";

const CURRENCY_NAMES = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  CHF: "Swiss Franc",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
};

const POPULAR = ["USD", "EUR", "GBP"];
const OTHER = ["JPY", "CHF", "CAD", "AUD"];

function CurrencyPicker({ selected, onSelect, onClose }) {
  const [search, setSearch] = useState("");

  const filterList = (list) =>
    list.filter((code) => {
      const name = CURRENCY_NAMES[code].toLowerCase();
      const query = search.toLowerCase();
      return code.toLowerCase().includes(query) || name.includes(query);
    });

  const renderRow = (code) => (
    <li
      key={code}
      className={`picker-row ${selected === code ? "selected" : ""}`}
      onClick={() => {
        onSelect(code);
        onClose();
      }}
    >
      <span className="picker-code">{code}</span>
      <span className="picker-name">{CURRENCY_NAMES[code]}</span>
      {selected === code && <span className="picker-check">✓</span>}
    </li>
  );

  const popularFiltered = filterList(POPULAR);
  const otherFiltered = filterList(OTHER);

  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-popover" onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          className="picker-search"
          placeholder="Search currencies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        {popularFiltered.length > 0 && (
          <>
            <h3 className="picker-group-label">
              Popular ({popularFiltered.length})
            </h3>
            <ul>{popularFiltered.map(renderRow)}</ul>
          </>
        )}

        {otherFiltered.length > 0 && (
          <>
            <h3 className="picker-group-label">
              Other currencies ({otherFiltered.length})
            </h3>
            <ul>{otherFiltered.map(renderRow)}</ul>
          </>
        )}

        {popularFiltered.length === 0 && otherFiltered.length === 0 && (
          <p className="picker-empty">No currencies found.</p>
        )}
      </div>
    </div>
  );
}

export default CurrencyPicker;