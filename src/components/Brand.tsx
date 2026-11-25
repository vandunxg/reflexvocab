export function BrandMark() {
  return <span className="brand-mark" aria-hidden="true">r.</span>;
}

export function Brand() {
  return (
    <span className="brand">
      <BrandMark />
      reflexvocab
    </span>
  );
}
