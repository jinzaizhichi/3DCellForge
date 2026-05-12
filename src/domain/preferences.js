import {
  DEFAULT_SETTINGS,
  GENERATION_MODE_IDS,
  GENERATION_PROVIDER_IDS,
  SETTINGS_STORAGE_VERSION,
  UI_STATE_STORAGE_VERSION,
} from '../config/appConfig.js'
import { MICROSCOPE_IMAGES } from './cellData.js'
import { getCellProfile } from './cellCatalog.js'

export function normalizeSettings(value) {
  const stored = value && typeof value === 'object' ? value : {}
  const next = { ...DEFAULT_SETTINGS, ...stored }
  const storedMode = stored.generationMode || stored.generationProvider

  if (stored.settingsVersion !== SETTINGS_STORAGE_VERSION) {
    next.generationProvider = GENERATION_PROVIDER_IDS.has(stored.generationProvider) ? stored.generationProvider : DEFAULT_SETTINGS.generationProvider
    next.generationMode = GENERATION_MODE_IDS.has(storedMode) ? storedMode : DEFAULT_SETTINGS.generationMode
  }

  if (!GENERATION_PROVIDER_IDS.has(next.generationProvider)) {
    next.generationProvider = DEFAULT_SETTINGS.generationProvider
  }

  if (!GENERATION_MODE_IDS.has(next.generationMode)) {
    next.generationMode = DEFAULT_SETTINGS.generationMode
  }

  next.settingsVersion = SETTINGS_STORAGE_VERSION
  return next
}

export function normalizeUiState(value) {
  const stored = value && typeof value === 'object' ? value : {}
  return {
    selectedCell: typeof stored.selectedCell === 'string' ? stored.selectedCell : 'plant',
    selectedOrganelle: typeof stored.selectedOrganelle === 'string' ? stored.selectedOrganelle : 'nucleus',
    selectedMicroscope: typeof stored.selectedMicroscope === 'string' ? stored.selectedMicroscope : MICROSCOPE_IMAGES[0].label,
    compareCell: typeof stored.compareCell === 'string' ? stored.compareCell : getCellProfile('plant').compareTarget,
    crossSection: typeof stored.crossSection === 'boolean' ? stored.crossSection : true,
    favoriteKey: typeof stored.favoriteKey === 'string' ? stored.favoriteKey : '',
    uiStateVersion: UI_STATE_STORAGE_VERSION,
  }
}
