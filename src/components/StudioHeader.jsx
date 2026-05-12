import { BookOpen, ChevronDown, Dna, Grid3X3, Library, Settings } from 'lucide-react'

import { CELL_TYPES } from '../domain/cellData.js'
import { CellThumb } from './CellThumb.jsx'

export function StudioHeader({ activePanel, setActivePanel, onNotify }) {
  function openPanel(panel) {
    const next = activePanel === panel ? null : panel
    setActivePanel(next)
    onNotify(next ? `${panel} opened` : `${panel} closed`)
  }

  return (
    <header className="studio-header">
      <div className="studio-brand">
        <div className="brand-mark">
          <CellThumb cell={CELL_TYPES[1]} selected />
        </div>
        <div>
          <strong>Cell Architecture Studio</strong>
          <span>Explore life at the microscopic level</span>
        </div>
      </div>
      <nav className="studio-nav">
        <button type="button" className={activePanel === 'Gallery' ? 'active' : ''} onClick={() => openPanel('Gallery')}>
          <Grid3X3 size={15} />
          Gallery
        </button>
        <button type="button" className={activePanel === 'Library' ? 'active' : ''} onClick={() => openPanel('Library')}>
          <Library size={15} />
          Library
        </button>
        <button type="button" className={activePanel === 'Notebooks' ? 'active' : ''} onClick={() => openPanel('Notebooks')}>
          <BookOpen size={15} />
          Notebooks
        </button>
        <button type="button" className={activePanel === 'Settings' ? 'active' : ''} onClick={() => openPanel('Settings')}>
          <Settings size={15} />
          Settings
        </button>
      </nav>
      <button type="button" className={activePanel === 'Profile' ? 'profile-button active' : 'profile-button'} onClick={() => openPanel('Profile')}>
        <Dna size={18} />
        <ChevronDown size={13} />
      </button>
    </header>
  )
}
