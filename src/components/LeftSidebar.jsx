import { useMemo, useState } from 'react'
import { ChevronDown, CircleDot, Heart, Sparkles as SparklesIcon, Trash2 } from 'lucide-react'

import { CELL_TYPES, ORGANELLES } from '../domain/cellData.js'
import { getAvailableOrganelleIds, getCell, getPrimaryCells } from '../domain/cellCatalog.js'
import { CellThumb } from './CellThumb.jsx'

export function LeftSidebar({ selectedCell, setSelectedCell, selectedOrganelle, setSelectedOrganelle, customCells, onDeleteCustomCell }) {
  const [recentOpen, setRecentOpen] = useState(false)
  const primaryCells = getPrimaryCells(customCells)
  const availableOrganelles = getAvailableOrganelleIds(selectedCell, customCells)
  const selected = getCell(selectedCell, customCells)
  const currentCustomCell = selected.custom && !selected.reference ? selected : null
  const recentCells = useMemo(
    () => primaryCells.filter((cell) => cell.custom && !cell.reference && cell.id !== currentCustomCell?.id),
    [currentCustomCell?.id, primaryCells],
  )
  const visibleCells = currentCustomCell ? [currentCustomCell, ...CELL_TYPES] : CELL_TYPES
  const storedCustomIds = new Set(customCells.map((cell) => cell.id))

  function renderCellRow(cell, { compact = false } = {}) {
    const canDelete = storedCustomIds.has(cell.id)

    return (
      <div key={cell.id} className={canDelete ? 'cell-row-shell can-delete' : 'cell-row-shell'}>
        <button
          type="button"
          className={`${selectedCell === cell.id ? 'cell-row active' : 'cell-row'}${compact ? ' compact' : ''}`}
          onClick={() => setSelectedCell(cell.id)}
        >
          <CellThumb cell={cell} selected={selectedCell === cell.id} />
          <span>
            <strong>{cell.name}</strong>
            <small>{cell.type}</small>
          </span>
          {!canDelete && selectedCell === cell.id && <Heart size={13} fill="currentColor" />}
        </button>
        {canDelete && (
          <button type="button" className="cell-delete" aria-label={`Delete ${cell.name}`} onClick={() => onDeleteCustomCell?.(cell.id)}>
            <Trash2 size={12} />
          </button>
        )}
      </div>
    )
  }

  return (
    <aside className="left-rail">
      <section className="panel cell-types-panel">
        <header className="panel-title">
          <span>
            <SparklesIcon size={14} />
            Cell Types
          </span>
          <ChevronDown size={14} />
        </header>
        <div className="cell-list">
          {visibleCells.map((cell) => renderCellRow(cell))}
          {recentCells.length > 0 && (
            <div className="recent-cells">
              <button type="button" className="recent-toggle" onClick={() => setRecentOpen((value) => !value)} aria-expanded={recentOpen}>
                <span>Recent Uploads</span>
                <small>{recentCells.length}</small>
                <ChevronDown size={13} />
              </button>
              {recentOpen && (
                <div className="recent-cell-list">
                  {recentCells.map((cell) => renderCellRow(cell, { compact: true }))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="panel organelles-panel">
        <header className="panel-title">
          <span>
            <CircleDot size={14} />
            Organelles
          </span>
          <ChevronDown size={14} />
        </header>
        <div className="organelle-list">
          {availableOrganelles.map((id) => (
            <button
              key={id}
              type="button"
              className={selectedOrganelle === id ? 'organelle-row active' : 'organelle-row'}
              onClick={() => setSelectedOrganelle(id)}
              style={{ '--dot': ORGANELLES[id].accent }}
            >
              <span className="dot" />
              {ORGANELLES[id].label}
            </button>
          ))}
        </div>
      </section>
    </aside>
  )
}
