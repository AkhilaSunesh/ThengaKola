/**
 * Thenga Kola - Lethality & Physics Engine
 * Exact implementation of specification:
 * lethality_score = (size_factor * 0.4) + (maturity_factor * 0.4) + (height_factor * 0.2)
 * size_factor = min(100, (bounding_box_area / reference_area) * 100)
 * height_factor = (1 - (y_position / image_height)) * 100
 */

const LethalityEngine = {
  // Maturity weights according to specification
  MATURITY_FACTORS: {
    'Mature': 95,     // Hard brown heavy husk - deadly
    'Potential': 55,  // Semi-ripe, significant hazard
    'Premature': 20   // Tender coconut (Elaneer) - lighter, soft husk
  },

  // Approximate physics constants for Kerala Coconuts
  AVERAGE_TREE_HEIGHT_METERS: 18.0, // Standard Kerala coconut palm height ~15-25m
  GRAVITY: 9.80665,
  AVERAGE_COCONUT_MASS_KG: 1.8, // Mass range: 1.2kg - 2.8kg

  /**
   * Calculate lethality score and threat level
   * @param {Object} bbox - {x, y, width, height} in normalized 0..1 or pixel coordinates
   * @param {number} imgWidth - width of image
   * @param {number} imgHeight - height of image
   * @param {string} maturity - 'Mature' | 'Potential' | 'Premature'
   * @returns {Object} Full lethality dossier
   */
  calculate(bbox, imgWidth, imgHeight, maturity = 'Mature') {
    // 1. Calculate bounding box area ratio
    const area = bbox.width * bbox.height;
    const totalImageArea = imgWidth * imgHeight;
    
    // Calibrated reference area for a standard single coconut in close/medium crop (~4% of full frame)
    const referenceArea = totalImageArea * 0.04;
    const sizeFactor = Math.min(100, (area / referenceArea) * 100);

    // 2. Maturity Factor
    const maturityFactor = this.MATURITY_FACTORS[maturity] || 70;

    // 3. Height Factor (Higher up on tree = lower y_position in image = higher potential energy)
    // Center Y of bounding box
    const centerY = bbox.y + (bbox.height / 2);
    const heightFactor = Math.max(0, Math.min(100, (1 - (centerY / imgHeight)) * 100));

    // 4. Exact weighted formula
    const rawScore = (sizeFactor * 0.4) + (maturityFactor * 0.4) + (heightFactor * 0.2);
    const lethalityScore = Math.round(Math.max(5, Math.min(100, rawScore)));

    // 5. Threat Level Category Mapping
    let threatLevel = 'Low';
    let threatClass = 'low';
    let skullEmoji = '🟢';
    let tacticalAdvice = 'Safe for afternoon chai underneath.';

    if (lethalityScore >= 80) {
      threatLevel = 'Code Red';
      threatClass = 'code-red';
      skullEmoji = '☠️🚨';
      tacticalAdvice = 'IMMEDIATE EVACUATION REQUIRED. Helmet cannot save you.';
    } else if (lethalityScore >= 55) {
      threatLevel = 'Lethal';
      threatClass = 'lethal';
      skullEmoji = '💀';
      tacticalAdvice = 'High velocity ballistic hazard. Maintain 10m perimeter.';
    } else if (lethalityScore >= 30) {
      threatLevel = 'Moderate';
      threatClass = 'moderate';
      skullEmoji = '⚠️';
      tacticalAdvice = 'Concussion hazard. Wear approved steel hardhat.';
    }

    // 6. Realistic Physics Ballistics
    // Estimated drop height based on tree height * height factor
    const dropHeightMeters = parseFloat((this.AVERAGE_TREE_HEIGHT_METERS * (0.65 + (heightFactor / 100) * 0.35)).toFixed(1));
    // Estimated mass based on size factor & maturity
    const massKg = parseFloat(((this.AVERAGE_COCONUT_MASS_KG * (0.7 + (sizeFactor / 100) * 0.8)) * (maturity === 'Mature' ? 1.2 : 0.85)).toFixed(2));
    
    // Free-fall velocity: v = sqrt(2 * g * h)
    const impactVelocityMps = parseFloat(Math.sqrt(2 * this.GRAVITY * dropHeightMeters).toFixed(1));
    const impactVelocityKmph = parseFloat((impactVelocityMps * 3.6).toFixed(1));

    // Kinetic Energy: KE = 0.5 * m * v^2 (in Joules)
    const impactEnergyJoules = Math.round(0.5 * massKg * Math.pow(impactVelocityMps, 2));

    // Equivalent human skull tolerance is ~100-150 Joules
    const skullCrushMultiplier = parseFloat((impactEnergyJoules / 120).toFixed(1));

    return {
      lethalityScore,
      threatLevel,
      threatClass,
      skullEmoji,
      tacticalAdvice,
      factors: {
        sizeFactor: Math.round(sizeFactor),
        maturityFactor: Math.round(maturityFactor),
        heightFactor: Math.round(heightFactor)
      },
      physics: {
        dropHeightMeters,
        massKg,
        impactVelocityKmph,
        impactEnergyJoules,
        skullCrushMultiplier
      },
      maturity
    };
  }
};

if (typeof module !== 'undefined') {
  module.exports = LethalityEngine;
}
