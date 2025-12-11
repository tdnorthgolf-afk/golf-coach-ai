/**
 * Strokes Gained Calculator
 * Based on PGA Tour benchmark data and Mark Broadie's research
 */

// Lie types for strokes gained adjustments
export type LieType = 'tee' | 'fairway' | 'rough' | 'bunker' | 'green' | 'fringe' | 'recovery'

// Shot categories for breakdown
export type ShotCategory = 'tee' | 'approach' | 'around_green' | 'putting'

// Shot data structure
export interface ShotData {
  shotNumber: number
  startPosition: { x: number; y: number }
  endPosition: { x: number; y: number }
  startLie: LieType
  endLie: LieType
  startDistanceYards: number
  endDistanceYards: number
  club?: string
  isPenalty?: boolean
  penaltyStrokes?: number
}

// Calculated shot result
export interface ShotResult extends ShotData {
  expectedBefore: number
  expectedAfter: number
  strokesGained: number
  category: ShotCategory
}

// Strokes gained summary
export interface StrokesGainedSummary {
  shots: ShotResult[]
  byCategory: {
    tee: number
    approach: number
    around_green: number
    putting: number
  }
  total: number
}

/**
 * PGA Tour baseline expected strokes from fairway (yards to hole)
 */
const FAIRWAY_BASELINE: Record<number, number> = {
  1: 1.00, 2: 1.01, 3: 1.03, 4: 1.06, 5: 1.08,
  10: 1.15, 15: 1.23, 20: 1.32, 25: 1.41, 30: 1.50,
  40: 1.65, 50: 1.78, 60: 1.89, 70: 1.99, 80: 2.08,
  90: 2.17, 100: 2.26, 110: 2.34, 120: 2.42, 130: 2.50,
  140: 2.57, 150: 2.64, 160: 2.71, 170: 2.78, 180: 2.85,
  190: 2.91, 200: 2.97, 210: 3.03, 220: 3.09, 230: 3.15,
  240: 3.21, 250: 3.27, 260: 3.33, 270: 3.38, 280: 3.44,
  290: 3.50, 300: 3.55, 320: 3.66, 340: 3.77, 360: 3.87,
  380: 3.97, 400: 4.07, 420: 4.17, 440: 4.27, 460: 4.37,
  480: 4.47, 500: 4.56, 550: 4.79, 600: 5.01
}

/**
 * PGA Tour baseline expected strokes from green (feet to hole)
 */
const PUTTING_BASELINE: Record<number, number> = {
  1: 1.00, 2: 1.01, 3: 1.04, 4: 1.08, 5: 1.12,
  6: 1.17, 7: 1.22, 8: 1.27, 9: 1.32, 10: 1.37,
  12: 1.46, 14: 1.54, 16: 1.61, 18: 1.67, 20: 1.73,
  25: 1.85, 30: 1.95, 35: 2.03, 40: 2.10, 45: 2.16,
  50: 2.21, 60: 2.31, 70: 2.39, 80: 2.46, 90: 2.52,
  100: 2.57
}

/**
 * Lie adjustments (added to baseline)
 */
const LIE_ADJUSTMENTS: Record<LieType, number> = {
  tee: -0.05,      // Slight advantage from tee
  fairway: 0.00,   // Baseline
  rough: 0.15,     // Moderate penalty
  bunker: 0.40,    // Significant penalty
  green: 0.00,     // Uses putting baseline
  fringe: 0.05,    // Slight penalty
  recovery: 0.80   // Severe penalty (trees, etc.)
}

/**
 * Interpolate between data points
 */
function interpolate(distance: number, baseline: Record<number, number>): number {
  const distances = Object.keys(baseline).map(Number).sort((a, b) => a - b)
  
  // Handle edge cases
  if (distance <= distances[0]) {
    return baseline[distances[0]]
  }
  if (distance >= distances[distances.length - 1]) {
    // Extrapolate linearly for very long distances
    const last = distances[distances.length - 1]
    const secondLast = distances[distances.length - 2]
    const slope = (baseline[last] - baseline[secondLast]) / (last - secondLast)
    return baseline[last] + slope * (distance - last)
  }
  
  // Find surrounding data points and interpolate
  for (let i = 0; i < distances.length - 1; i++) {
    if (distances[i] <= distance && distance <= distances[i + 1]) {
      const d1 = distances[i]
      const d2 = distances[i + 1]
      const e1 = baseline[d1]
      const e2 = baseline[d2]
      const ratio = (distance - d1) / (d2 - d1)
      return e1 + ratio * (e2 - e1)
    }
  }
  
  return baseline[distances[distances.length - 1]]
}

/**
 * Calculate expected strokes to hole out
 */
export function expectedStrokes(distanceYards: number, lie: LieType): number {
  if (lie === 'green') {
    // Convert yards to feet for putting
    const distanceFeet = distanceYards * 3
    return interpolate(distanceFeet, PUTTING_BASELINE)
  }
  
  const baseStrokes = interpolate(distanceYards, FAIRWAY_BASELINE)
  const adjustment = LIE_ADJUSTMENTS[lie] || 0
  return baseStrokes + adjustment
}

/**
 * Determine shot category based on distance and lie
 */
export function categorizeShot(distanceToPin: number, lie: LieType): ShotCategory {
  if (lie === 'green') {
    return 'putting'
  }
  if (distanceToPin <= 50) {
    return 'around_green'
  }
  if (lie === 'tee') {
    return 'tee'
  }
  return 'approach'
}

/**
 * Calculate strokes gained for a single shot
 */
export function calculateShotStrokesGained(shot: ShotData): ShotResult {
  const expectedBefore = expectedStrokes(shot.startDistanceYards, shot.startLie)
  
  // Handle holed shots
  const isHoled = shot.endDistanceYards < 0.5
  const expectedAfter = isHoled ? 0 : expectedStrokes(shot.endDistanceYards, shot.endLie)
  
  // SG = Expected_before - Expected_after - strokes_taken
  const strokesTaken = 1 + (shot.penaltyStrokes || 0)
  const strokesGained = expectedBefore - expectedAfter - strokesTaken
  
  const category = categorizeShot(shot.startDistanceYards, shot.startLie)
  
  return {
    ...shot,
    expectedBefore: Math.round(expectedBefore * 100) / 100,
    expectedAfter: Math.round(expectedAfter * 100) / 100,
    strokesGained: Math.round(strokesGained * 100) / 100,
    category
  }
}

/**
 * Calculate strokes gained for all shots in a hole/round
 */
export function calculateStrokesGained(shots: ShotData[]): StrokesGainedSummary {
  const results: ShotResult[] = []
  const byCategory = {
    tee: 0,
    approach: 0,
    around_green: 0,
    putting: 0
  }
  let total = 0
  
  for (const shot of shots) {
    const result = calculateShotStrokesGained(shot)
    results.push(result)
    byCategory[result.category] += result.strokesGained
    total += result.strokesGained
  }
  
  // Round category totals
  byCategory.tee = Math.round(byCategory.tee * 100) / 100
  byCategory.approach = Math.round(byCategory.approach * 100) / 100
  byCategory.around_green = Math.round(byCategory.around_green * 100) / 100
  byCategory.putting = Math.round(byCategory.putting * 100) / 100
  total = Math.round(total * 100) / 100
  
  return { shots: results, byCategory, total }
}

/**
 * Calculate distance between two points (in pixels) and convert to yards
 */
export function calculateDistance(
  pos1: { x: number; y: number },
  pos2: { x: number; y: number },
  pixelsPerYard: number
): number {
  const pixelDistance = Math.sqrt(
    Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
  )
  return pixelDistance / pixelsPerYard
}

/**
 * Calibrate scale based on known hole distance
 */
export function calibrateScale(
  teePos: { x: number; y: number },
  pinPos: { x: number; y: number },
  holeYardage: number
): number {
  const pixelDistance = Math.sqrt(
    Math.pow(pinPos.x - teePos.x, 2) + Math.pow(pinPos.y - teePos.y, 2)
  )
  return pixelDistance / holeYardage
}

/**
 * Format strokes gained for display
 */
export function formatStrokesGained(value: number): string {
  if (value > 0) return `+${value.toFixed(2)}`
  return value.toFixed(2)
}

/**
 * Get color class for strokes gained value
 */
export function getStrokesGainedColor(value: number): string {
  if (value > 0.5) return 'text-emerald-400'
  if (value > 0) return 'text-emerald-300'
  if (value > -0.5) return 'text-yellow-400'
  return 'text-red-400'
}

/**
 * Get background color class for strokes gained value
 */
export function getStrokesGainedBgColor(value: number): string {
  if (value > 0.5) return 'bg-emerald-500'
  if (value > 0) return 'bg-emerald-400'
  if (value > -0.5) return 'bg-yellow-500'
  return 'bg-red-500'
}

/**
 * Category display names
 */
export const CATEGORY_NAMES: Record<ShotCategory, string> = {
  tee: 'Off the Tee',
  approach: 'Approach',
  around_green: 'Around Green',
  putting: 'Putting'
}

/**
 * Category colors for visualization
 */
export const CATEGORY_COLORS: Record<ShotCategory, string> = {
  tee: '#3b82f6',      // Blue
  approach: '#22c55e', // Green
  around_green: '#f59e0b', // Orange
  putting: '#a855f7'   // Purple
}