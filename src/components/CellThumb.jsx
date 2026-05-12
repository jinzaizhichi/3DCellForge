export function CellThumb({ cell, selected }) {
  return (
    <span
      className={`cell-thumb ${cell.custom ? 'custom-cell' : cell.id} ${selected ? 'selected' : ''}`}
      style={{ '--cell-accent': cell.accent, '--thumb-image': cell.imageUrl ? `url(${cell.imageUrl})` : undefined }}
    >
      <span />
    </span>
  )
}
