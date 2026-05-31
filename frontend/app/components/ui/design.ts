/** Clases reutilizables alineadas con stitch_web_app_redesign_overhaul (3) */
export const ds = {
  card: "rounded-3xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm",
  cardSm: "rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm",
  pageTitle: "font-headline text-xl font-bold text-on-surface",
  pageSubtitle: "mt-1 text-xs text-on-surface-variant",
  sectionHeader: "flex flex-col gap-4 border-b border-outline-variant/30 pb-5 sm:flex-row sm:items-center sm:justify-between",
  label: "block text-xs font-bold uppercase tracking-wider text-on-surface-variant",
  input: "ds-input w-full px-4 py-2.5 text-sm",
  select: "ds-input w-full px-4 py-2.5 text-sm cursor-pointer",
  btnPrimary: "ds-btn-primary cursor-pointer px-4 py-2.5 text-xs font-bold shadow-lg shadow-primary/20",
  btnSecondary:
    "cursor-pointer rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-2.5 text-xs font-bold text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface",
  btnDanger:
    "cursor-pointer rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-xs font-bold text-error transition-all hover:bg-error/20",
  tableWrap: "overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm",
  tableHead: "bg-surface-container-low text-xs font-bold uppercase tracking-wider text-on-surface-variant",
  tableRow: "border-t border-outline-variant/20 transition-colors hover:bg-surface-container-low/50",
  modalOverlay: "fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm",
  modal: "relative w-full max-w-md space-y-6 rounded-3xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-2xl sm:p-8",
} as const;
