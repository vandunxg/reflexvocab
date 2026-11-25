/** Full-screen wait state: the brand's circle, square and triangle hop in turn above the status text. */
export function LoadingScreen({ label }: { label: string }) {
  return (
    <main className="center-screen">
      <div className="loading-screen">
        <div className="loading-shapes" aria-hidden="true">
          <span className="loading-shape loading-circle" />
          <span className="loading-shape loading-square" />
          <span className="loading-shape loading-triangle" />
        </div>
        <p role="status" className="muted">{label}</p>
      </div>
    </main>
  );
}
