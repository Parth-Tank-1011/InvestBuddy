import React, { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import CompareStocks from "../components/CompareStocks";
import NotesSection from "../components/NotesSection";
import { formatCurrency, formatNumber, formatPercent, displayValue, displayPE } from "../utils/helpers";
import { fetchWatchlist, deleteFromWatchlist, fetchStock } from "../services/api";

function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [selectedStock1, setSelectedStock1] = useState("");
  const [selectedStock2, setSelectedStock2] = useState("");
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");

  // Fetch watchlist on page load
  useEffect(() => {
    const fetchFullData = async () => {
      try {
        // Get stored items from localStorage
        const stored = JSON.parse(localStorage.getItem("watchlist") || "[]") || [];
        if (stored.length === 0) {
          // Try API as fallback if localStorage empty
          try {
            const apiData = await fetchWatchlist();
            if (Array.isArray(apiData)) {
              const enriched = await Promise.all(
                apiData.map(async (stock) => {
                  try {
                    const fullData = await fetchStock(stock.symbol);
                    return {
                      name: fullData.company_name || stock.company_name,
                      symbol: fullData.symbol || stock.symbol,
                      price: fullData.current_price || null,
                       change: fullData.change_percent ?? null,
                      high: fullData.high_52w || null,
                      low: fullData.low_52w || null,
                      pe: fullData.pe_ratio || null,
                    };
                  } catch (e) {
                    console.error(`Failed to fetch ${stock.symbol}:`, e);
                     return {
                       name: stock.company_name,
                       symbol: stock.symbol,
                       price: null,
                       change: null,
                       high: null,
                       low: null,
                       pe: null,
                     };
                  }
                })
              );
              setWatchlist(enriched);
              localStorage.setItem("watchlist", JSON.stringify(enriched));
            }
          } catch (apiError) {
            console.error("API fetch failed:", apiError);
          }
          return;
        }

        // Enrich each stored item with full data from backend
        const updated = await Promise.all(
          stored.map(async (item) => {
            try {
              const data = await fetchStock(item.symbol);
              return {
                ...item,
                price: data.current_price ?? null,
                change: data.change_percent ?? null,
                high: data.high_52w || null,
                low: data.low_52w || null,
                pe: data.pe_ratio || null,
              };
            } catch (e) {
              console.error(`Failed to fetch full data for ${item.symbol}:`, e);
              return item;
            }
          })
        );

        setWatchlist(updated);
        // Save enriched data back to localStorage
        localStorage.setItem("watchlist", JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to load watchlist:", error);
        setWatchlist([]);
      }
    };

    fetchFullData();
  }, []);

  useEffect(() => {
    if (watchlist.length === 0) {
      setSelectedStock1("");
      setSelectedStock2("");
      return;
    }

    const names = watchlist.map((stock) => stock.name);

    if (names.length > 0 && !names.includes(selectedStock1)) {
      setSelectedStock1(names[0]);
    }

    if (names.length > 0 && !names.includes(selectedStock2)) {
      setSelectedStock2(names[1] || names[0]);
    }
  }, [selectedStock1, selectedStock2, watchlist]);

  function handleRemoveStock(stockSymbol) {
    async function removeStock() {
      try {
        await deleteFromWatchlist(stockSymbol);
        setWatchlist((current) => {
          const newList = current.filter((stock) => stock.symbol !== stockSymbol);
          // Save cleaned version to localStorage
          localStorage.setItem("watchlist", JSON.stringify(newList));
          return newList;
        });
      } catch (error) {
        console.error("Failed to remove stock, using fallback:", error);
        setWatchlist((current) => {
          const newList = current.filter((stock) => stock.symbol !== stockSymbol);
          localStorage.setItem("watchlist", JSON.stringify(newList));
          return newList;
        });
      }
    }
    removeStock();
  }

  function handleSaveNote() {
    const text = noteInput.trim();
    if (!text) return;

    setNotes((current) => [{ id: Date.now(), text }, ...current]);
    setNoteInput("");
  }

  function handleDeleteNote(noteId) {
    setNotes((current) => current.filter((note) => note.id !== noteId));
  }

return (
      <section className="page-shell space-y-8">
        <div>
          <p className="section-kicker">Saved stocks</p>
          <h1 className="section-title">My Watchlist</h1>
        </div>

       <WatchlistTable onRemoveStock={handleRemoveStock} watchlist={watchlist} />

      <CompareStocks
        onSelectStock1={setSelectedStock1}
        onSelectStock2={setSelectedStock2}
        selectedStock1={selectedStock1}
        selectedStock2={selectedStock2}
        watchlist={watchlist}
      />

      <NotesSection
        noteInput={noteInput}
        notes={notes}
        onDeleteNote={handleDeleteNote}
        onNoteChange={setNoteInput}
        onSaveNote={handleSaveNote}
      />
    </section>
  );
}

function WatchlistTable({ watchlist, onRemoveStock }) {
  return (
    <section className="dashboard-card overflow-hidden">
      <div className="border-b border-theme-border p-5 sm:p-6">
        <h2 className="text-2xl font-black text-theme-text">Watchlist Table</h2>
      </div>

       {watchlist.length === 0 ? (
          <p className="p-6 text-sm text-theme-muted">No stocks added yet</p>
        ) : (
         <div className="overflow-x-auto">
           <table className="min-w-[900px] w-full border-collapse text-left">
             <thead>
               <tr className="border-b border-theme-border text-xs uppercase tracking-[0.12em] text-theme-muted">
                 <th className="px-5 py-4 font-semibold">Stock Name</th>
                 <th className="px-5 py-4 font-semibold">Current Price</th>
                 <th className="px-5 py-4 font-semibold">% Change</th>
                 <th className="px-5 py-4 font-semibold">52 Week High</th>
                 <th className="px-5 py-4 font-semibold">52 Week Low</th>
                 <th className="px-5 py-4 font-semibold">PE Ratio</th>
                 <th className="px-5 py-4 font-semibold">Action</th>
               </tr>
             </thead>
             <tbody>
               {watchlist.map((stock, index) => (
                  <tr
                    className="border-b border-theme-border text-sm transition-colors hover:bg-cyan-500/[0.03]"
                   key={stock.symbol || index}
                 >
                   <td className="px-5 py-4 font-bold text-theme-text">{stock.name}</td>
                   <td className="px-5 py-4 text-theme-muted">{formatCurrency(stock.price)}</td>
                    <td className={`px-5 py-4 font-bold ${stock.change != null && stock.change >= 0 ? "text-theme-success" : "text-theme-danger"}`}>
                      {formatPercent(stock.change)}
                    </td>
                   <td className="px-5 py-4 text-theme-muted">{displayValue(stock.high, "₹ ")}</td>
                   <td className="px-5 py-4 text-theme-muted">{displayValue(stock.low, "₹ ")}</td>
                   <td className="px-5 py-4 text-theme-muted">{displayPE(stock.pe)}</td>
                   <td className="px-5 py-4">
                     <button
                       className="inline-flex items-center gap-2 rounded-xl border border-theme-danger-light bg-theme-danger-light px-3 py-2 text-xs font-bold text-theme-danger transition hover:bg-[var(--danger)]/20"
                       onClick={() => onRemoveStock(stock.symbol)}
                       type="button"
                     >
                       <FiTrash2 size={14} />
                       Remove
                     </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       )}
     </section>
   );
}

export default WatchlistPage;
