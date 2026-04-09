export function ViewportFrame({
  children,
  overlay,
}: {
  children: React.ReactNode;
  overlay?: React.ReactNode;
}) {
  return (
    <div className="theme-scope fixed inset-0 bg-(--surface) p-2 [--frame-gap:0.5rem] sm:p-3 sm:[--frame-gap:0.75rem]">
      <div className="shadow-surface-inset relative h-full w-full overflow-hidden rounded-[1.25rem] bg-(--surface) sm:rounded-[1.75rem]">
        {overlay}
        <div className="h-full overflow-x-hidden overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
