/** Minimal route fallback: a thin progress bar at the top (no layout jump, no spinner wall). */
export function PageLoader() {
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden">
      <span className="sr-only">Loading</span>
      <div className="h-full w-1/3 animate-[loader_1.1s_var(--ease-out)_infinite] bg-gradient-to-r from-transparent via-brand to-transparent" />
      <style>{"@keyframes loader{from{transform:translateX(-100%)}to{transform:translateX(300%)}}"}</style>
    </div>
  );
}
