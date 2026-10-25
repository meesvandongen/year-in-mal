import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import type { ListEntry } from "../lib/types";
import { buttonClass } from "./Button";
import { EntryRow } from "./EntryRow";
import { Close, ListIcon } from "./Icons";

export interface SheetItem {
  entry: ListEntry;
  /** Shown on the right, e.g. `1.4M members`. */
  aside?: ReactNode;
}

export interface EntrySheetProps {
  title: ReactNode;
  description?: ReactNode;
  items: SheetItem[];
  /** Numbers the rows. */
  ranked?: boolean;
}

interface ControlledSheetProps extends EntrySheetProps {
  open: boolean;
  onClose: () => void;
}

/**
 * A modal list of anime: a bottom sheet on phones and a centred panel on
 * larger screens. Rows render the first time it opens, so posters only load
 * when someone asks for them.
 */
export function EntrySheet({
  open,
  onClose,
  title,
  description,
  items,
  ranked = false,
}: ControlledSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [seen, setSeen] = useState(open);
  if (open && !seen) setSeen(true);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      onClose={onClose}
      // The panel fills the dialog, so a click on the dialog itself is a click
      // on the backdrop.
      onClick={(event) => event.target === event.currentTarget && event.currentTarget.close()}
      className="mx-0 mt-auto mb-0 max-h-[85dvh] w-full max-w-none translate-y-full overflow-hidden rounded-t-3xl border-0 bg-ink-raised p-0 text-white shadow-2xl ring-1 ring-white/10 transition-[translate,opacity,scale,display,overlay] transition-discrete duration-300 ease-out backdrop:bg-black/60 backdrop:backdrop-blur-sm open:translate-y-0 sm:m-auto sm:max-h-[min(80dvh,48rem)] sm:max-w-lg sm:translate-y-0 sm:scale-95 sm:rounded-3xl sm:opacity-0 sm:open:scale-100 sm:open:opacity-100 motion-reduce:transition-none starting:open:translate-y-full sm:starting:open:translate-y-0 sm:starting:open:scale-95 sm:starting:open:opacity-0"
    >
      <div className="flex max-h-[inherit] flex-col">
        <header className="flex items-start gap-4 border-b border-white/10 px-5 pt-5 pb-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 id={`${id}-title`} className="font-display text-2xl font-extrabold tracking-tight">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-white/60">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => ref.current?.close()}
            className="-mt-1 -mr-2 grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Close />
          </button>
        </header>
        <ol className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-3">
          {seen &&
            items.map(({ entry, aside }, i) => (
              <EntryRow
                key={entry.node.id}
                entry={entry}
                aside={aside}
                rank={ranked ? i + 1 : undefined}
              />
            ))}
        </ol>
      </div>
    </dialog>
  );
}

/** A button that opens the full list behind a chapter's highlights. */
export function SeeAll({ label, ...sheet }: EntrySheetProps & { label: string }) {
  const [open, setOpen] = useState(false);
  if (sheet.items.length < 3) return null;

  return (
    <div className="reveal mt-8 flex justify-center sm:mt-10">
      <button type="button" className={buttonClass("ghost")} onClick={() => setOpen(true)}>
        <ListIcon />
        {label}
      </button>
      <EntrySheet {...sheet} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
