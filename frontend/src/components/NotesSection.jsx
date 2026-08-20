import React from "react";
import { FiTrash2 } from "react-icons/fi";

function NotesSection({ noteInput, notes, onDeleteNote, onNoteChange, onSaveNote }) {
  return (
    <section className="dashboard-card p-5 sm:p-6">
      <div className="mb-5">
        <p className="section-kicker">Personal research</p>
        <h2 className="mt-2 text-2xl font-black text-theme-text">My Notes</h2>
      </div>

      <div className="grid gap-4">
          <textarea
            className="fintech-input min-h-32 w-full resize-y py-3 text-theme-text"
            style={{ backgroundColor: "var(--card)", color: "var(--text)" }}
           onChange={(event) => onNoteChange(event.target.value)}
           placeholder="Write a note about a stock, strategy, or market idea..."
           value={noteInput}
         />
        <button
          className="primary-button w-fit"
          onClick={onSaveNote}
          type="button"
        >
          Save Note
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {notes.length === 0 ? (
          <p className="rounded-2xl border border-theme-border bg-theme-card p-4 text-sm text-theme-muted">
            No notes saved yet.
          </p>
        ) : (
          notes.map((note) => (
            <article
              className="animate-fade-in flex items-start justify-between gap-4 rounded-2xl border border-theme-border bg-theme-card p-4"
              key={note.id}
            >
              <p className="text-sm leading-6 text-theme-text">{note.text}</p>
              <button
                aria-label="Delete note"
                className="rounded-xl border border-theme-danger-light bg-theme-danger-light p-2 text-theme-danger transition hover:bg-[var(--danger)]/20"
                onClick={() => onDeleteNote(note.id)}
                type="button"
              >
                <FiTrash2 size={16} />
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default NotesSection;
