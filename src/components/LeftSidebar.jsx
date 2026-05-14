import { useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, Clock3, Heart, RotateCcw, Sparkles as SparklesIcon, Trash2 } from 'lucide-react'

import { getProviderLabel } from '../services/modelApi.js'
import { CellThumb } from './CellThumb.jsx'

const ACTIVE_STATUSES = new Set(['uploading', 'processing', 'queued', 'running', 'pending'])
const READY_STATUSES = new Set(['success', 'local'])

export function LeftSidebar({ selectedCell, setSelectedCell, customCells, onDeleteCustomCell, onRetryGeneration }) {
  const [recentOpen, setRecentOpen] = useState(false)
  const libraryCells = customCells.filter((cell) => cell.custom && !cell.reference)
  const selectedCustomCell = libraryCells.find((cell) => cell.id === selectedCell)
  const activeAsset = selectedCustomCell || libraryCells[0]
  const recentCells = libraryCells.filter((cell) => cell.id !== activeAsset?.id)
  const queueItems = libraryCells.filter((cell) => cell.generation)
  const storedCustomIds = new Set(customCells.map((cell) => cell.id))
  const queueCount = queueItems.filter((cell) => ACTIVE_STATUSES.has(String(cell.generation?.status || '').toLowerCase())).length || queueItems.length

  function renderCellRow(cell, { compact = false } = {}) {
    const canDelete = storedCustomIds.has(cell.id)
    const generation = cell.generation || {}
    const status = formatQueueStatus(String(generation.status || 'ready').toLowerCase(), generation.progress)

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
            <small>{getProviderLabel(generation.provider || generation.requestedProvider)} · {status}</small>
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
            Model Library
          </span>
          <ChevronDown size={14} />
        </header>
        {activeAsset && (
          <div className="pinned-models">
            <div className="pinned-model-block">
              <span className="model-section-label">{selectedCustomCell ? 'Active Asset' : 'Latest Asset'}</span>
              {renderCellRow(activeAsset)}
            </div>
          </div>
        )}
        <div className="cell-list">
          {!activeAsset && recentCells.length === 0 && (
            <div className="library-empty">
              <SparklesIcon size={16} />
              <span>No saved models yet.</span>
              <small>Upload an image or GLB from Asset Source.</small>
            </div>
          )}
          {recentCells.length > 0 && (
            <div className="recent-cells">
              <button type="button" className="recent-toggle" onClick={() => setRecentOpen((value) => !value)} aria-expanded={recentOpen}>
                <span>Saved Assets</span>
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
            <Clock3 size={14} />
            Generation Queue
          </span>
          <small>{queueCount}</small>
        </header>
        {queueItems.length === 0 ? (
          <div className="queue-empty">
            <Clock3 size={15} />
            <span>No generation jobs yet.</span>
          </div>
        ) : (
          <div className="left-queue-list">
            {queueItems.map((cell) => {
              const generation = cell.generation || {}
              const status = String(generation.status || 'pending').toLowerCase()
              const failed = status === 'failed'
              const ready = READY_STATUSES.has(status)
              const active = ACTIVE_STATUSES.has(status)

              return (
                <div key={cell.id} className={selectedCell === cell.id ? 'left-queue-row active' : 'left-queue-row'}>
                  <button type="button" onClick={() => setSelectedCell(cell.id)}>
                    <CellThumb cell={cell} selected={selectedCell === cell.id} />
                    <span>
                      <strong>{cell.name}</strong>
                      <small>{getProviderLabel(generation.provider || generation.requestedProvider)} · {formatQueueStatus(status, generation.progress)}</small>
                    </span>
                  </button>
                  <span className={failed ? 'queue-state failed' : ready ? 'queue-state ready' : active ? 'queue-state active' : 'queue-state'}>
                    {failed ? <AlertTriangle size={13} /> : ready ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
                  </span>
                  {failed && (
                    <button type="button" className="queue-retry" onClick={() => onRetryGeneration?.(cell.id)} aria-label={`Retry ${cell.name}`}>
                      <RotateCcw size={12} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </aside>
  )
}

function formatQueueStatus(status, progress) {
  if (status === 'success') return 'ready'
  if (status === 'local') return 'local ready'
  if (status === 'failed') return 'failed'
  if (Number.isFinite(progress)) return `${progress}%`
  if (status === 'uploading') return 'uploading'
  if (status === 'processing' || status === 'running') return 'generating'
  if (status === 'queued' || status === 'pending') return 'queued'
  return status || 'pending'
}
