import { getProviderLabel } from '../services/modelApi.js'
import { inferMotionProfile } from './motionProfiles.js'

const CATEGORY_RULES = [
  {
    id: 'artifact',
    label: 'Museum Artifact',
    keywords: ['artifact', 'bronze', 'gold', 'mask', 'statue', 'relic', 'sanxingdui', '三星堆', '青铜', '金器', '金面', '面具', '文物', '器物', '人像'],
    material: 'Metal, patina, carved relief, and aged surface detail',
    scale: 'Reference-derived object scale',
    description: 'A museum-style artifact asset. The important visual signals are silhouette, surface relief, material aging, and readable symbolic details rather than mechanical precision.',
    value: 'Works best as a slow inspection demo with side lighting, close orbit, and detail pauses on the face, edge profile, and weathered material transitions.',
    tags: ['artifact', 'patina', 'relief detail', 'museum display', 'inspection'],
  },
  {
    id: 'road',
    label: 'Performance Vehicle',
    keywords: ['supercar', 'sports car', 'race car', 'ferrari', 'lamborghini', 'porsche', 'vehicle', 'automobile', 'car', 'truck', 'suv', 'motorcycle', '跑车', '赛车', '汽车', '法拉利', '兰博基尼', '保时捷', '卡车', '摩托'],
    material: 'Painted body panels, glass, rubber, alloy, and dark trim',
    scale: 'Single vehicle asset',
    description: 'A road-vehicle asset where stance, wheel placement, front profile, glass canopy, and body highlights decide whether the model feels believable.',
    value: 'Use a low camera, road push-in, and front three-quarter framing. The demo should sell motion, gloss, and mass instead of treating it like a static specimen.',
    tags: ['vehicle', 'road pass', 'low camera', 'paint gloss', 'showcase'],
  },
  {
    id: 'vessel',
    label: 'Naval Vessel',
    keywords: ['aircraft carrier', 'carrier', 'warship', 'destroyer', 'ship', 'vessel', 'naval', 'submarine', '航母', '航空母舰', '军舰', '驱逐舰', '舰', '船', '潜艇'],
    material: 'Painted steel, deck surfaces, tower forms, antenna detail, and waterline mass',
    scale: 'Large vessel asset',
    description: 'A naval-vessel asset. The key read is the long hull, deck plane, island/superstructure, and heavy silhouette rather than small decorative parts.',
    value: 'Use a slow side cruise, broad camera distance, water/wake cues, and a heavier pacing so the object does not feel like a small toy.',
    tags: ['naval', 'hull', 'deck', 'waterline', 'slow cruise'],
  },
  {
    id: 'aircraft',
    label: 'Aircraft',
    keywords: ['fighter jet', 'fighter', 'airplane', 'aeroplane', 'aircraft', 'plane', 'jet', 'drone', 'helicopter', 'missile', '战斗机', '飞机', '歼', '轰炸机', '无人机', '直升机', '导弹'],
    material: 'Painted fuselage, canopy glass, wing edges, intakes, and exhaust geometry',
    scale: 'Single aircraft asset',
    description: 'An aircraft asset where the fuselage centerline, wings, tail, canopy, and engine areas must stay coherent from multiple angles.',
    value: 'Use a flight-pass camera with banking, contrails, and forward drift. The demo should make direction and lift obvious.',
    tags: ['aircraft', 'flight pass', 'banking', 'canopy', 'aero form'],
  },
  {
    id: 'product',
    label: 'Product Object',
    keywords: ['watch', 'phone', 'camera', 'shoe', 'bag', 'chair', 'lamp', 'bottle', 'headphone', 'jewelry', 'ring', '手表', '手机', '相机', '鞋', '包', '椅子', '灯', '瓶', '耳机', '戒指'],
    material: 'Mixed product materials, edge highlights, texture breaks, and brand-like surface zones',
    scale: 'Single product asset',
    description: 'A product asset. The model quality depends on whether the silhouette, primary material zones, and recognisable feature layout survived generation.',
    value: 'Use a clean studio turntable, soft reflections, and short zoom pauses on the recognisable product features.',
    tags: ['product', 'turntable', 'studio light', 'material zones', 'detail pause'],
  },
  {
    id: 'specimen',
    label: 'Organic Specimen',
    keywords: ['cell', 'biology', 'biological', 'organism', 'specimen', 'plant', 'neuron', 'bacteria', 'blood', 'epithelial', 'muscle', 'mosquito', '细胞', '生物', '植物', '神经', '细菌', '肌肉'],
    material: 'Soft translucent surfaces, organic volume, color-separated internal forms',
    scale: 'Specimen-style asset',
    description: 'An organic/specimen asset. The useful read is the overall volume, translucent surface, and clustered internal detail rather than exact biological accuracy.',
    value: 'Use close orbit, clean rim light, and slower zooms. This works best as an educational inspection view.',
    tags: ['specimen', 'organic', 'inspection orbit', 'soft volume', 'education'],
  },
]

export function getAssetMetadata(cell = {}) {
  const category = inferCategory(cell)
  const provider = getAssetProviderLabel(cell)
  const status = normalizeStatus(cell)
  const motion = inferMotionProfile(cell)
  const title = cell.fullName || cell.name || 'Untitled Asset'
  const task = cell.generation?.taskId ? String(cell.generation.taskId).slice(0, 14) : 'none'
  const source = getSourceLabel(cell)

  return {
    title,
    subtitle: category.label,
    accent: cell.accent || '#72a4bf',
    facts: [
      ['Category', category.label],
      ['Source', source],
      ['Provider', provider],
      ['Status', status],
      ['Scale', category.scale],
      ['Task', task],
    ],
    description: buildDescription(cell, category),
    value: buildValue(cell, category, motion),
    tags: dedupeTags([...category.tags, provider.toLowerCase(), status.toLowerCase().replace(/\s+/g, '-')]).slice(0, 7),
  }
}

function inferCategory(cell) {
  const text = normalizeSearchText([
    cell.id,
    cell.fullName,
    cell.sourceFileName,
    cell.name,
    cell.type,
    cell.template,
    cell.referenceSummary,
    cell.referenceSource,
    cell.imageUrl,
    cell.thumbnailUrl,
  ])

  const scored = CATEGORY_RULES
    .map((rule) => ({
      rule,
      score: rule.keywords.reduce((sum, keyword) => (matchesKeyword(text, keyword) ? sum + getKeywordWeight(keyword) : sum), 0),
    }))
    .sort((a, b) => b.score - a.score)

  if (scored[0]?.score > 0) return scored[0].rule
  return CATEGORY_RULES.find((rule) => rule.id === 'product')
}

function buildDescription(cell, category) {
  if (cell.reference) {
    return cell.referenceSummary || category.description
  }

  const modelState = cell.generation?.modelUrl
    ? 'A generated GLB is available, so the viewer is showing the actual cached 3D model.'
    : cell.generation?.provider === 'cinematic'
    ? 'This is currently a browser-side depth preview rather than a full GLB mesh.'
    : 'The viewer may use a procedural preview until the generated GLB is ready.'

  return `${category.description} ${modelState} The classification is inferred from the asset name and generation metadata, so rename the asset if the subject is wrong.`
}

function buildValue(cell, category, motion) {
  const material = `Material focus: ${category.material}.`
  const demo = `Recommended presentation: ${motion.label}. ${category.value}`
  const warning = cell.generation?.status === 'failed'
    ? ' Current generation failed, so this asset should not be used for a final demo until retried.'
    : ''

  return `${material} ${demo}${warning}`
}

function getSourceLabel(cell) {
  if (cell.reference) return 'Khronos reference model'
  if (cell.generation?.provider === 'local') return 'Local GLB import'
  if (cell.imageUrl || cell.thumbnailUrl) return 'Uploaded reference image'
  if (cell.custom) return 'Generated workspace asset'
  return 'Built-in starter scene'
}

function getAssetProviderLabel(cell) {
  if (cell.reference) return 'Khronos Reference'
  if (!cell.custom && !cell.generation?.provider && !cell.generation?.requestedProvider) return 'Built-in'
  return getProviderLabel(cell.generation?.provider || cell.generation?.requestedProvider)
}

function normalizeStatus(cell) {
  if (cell.reference) return 'Reference ready'
  if (cell.generation?.modelUrl) return 'GLB ready'
  if (cell.generation?.status === 'failed') return 'Generation failed'
  if (cell.generation?.status) return String(cell.generation.status)
  return cell.custom ? 'Queued' : 'Interactive starter'
}

function normalizeSearchText(parts) {
  return parts
    .filter(Boolean)
    .join(' ')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
}

function matchesKeyword(text, keyword) {
  if (!text || !keyword) return false
  const normalizedKeyword = keyword.toLowerCase()
  if (/[a-z0-9]/i.test(normalizedKeyword)) {
    const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(text)
  }

  return text.includes(normalizedKeyword)
}

function getKeywordWeight(keyword) {
  return keyword.length > 5 ? 3 : 2
}

function dedupeTags(tags) {
  return [...new Set(tags.filter(Boolean).map((tag) => String(tag).trim()).filter(Boolean))]
}
