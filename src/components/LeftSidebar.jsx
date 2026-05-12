import { ChevronDown, CircleDot, Heart, Sparkles as SparklesIcon } from 'lucide-react'

import { ORGANELLES } from '../domain/cellData.js'
import { getAvailableOrganelleIds, getPrimaryCells } from '../domain/cellCatalog.js'
import { CellThumb } from './CellThumb.jsx'

export function LeftSidebar({ selectedCell, setSelectedCell, selectedOrganelle, setSelectedOrganelle, customCells }) {
  const cells = getPrimaryCells(customCells)
  const availableOrganelles = getAvailableOrganelleIds(selectedCell, customCells)

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
          {cells.map((cell) => (
            <button
              key={cell.id}
              type="button"
              className={selectedCell === cell.id ? 'cell-row active' : 'cell-row'}
              onClick={() => setSelectedCell(cell.id)}
            >
              <CellThumb cell={cell} selected={selectedCell === cell.id} />
              <span>
                <strong>{cell.name}</strong>
                <small>{cell.type}</small>
              </span>
              {selectedCell === cell.id && <Heart size={13} fill="currentColor" />}
            </button>
          ))}
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
