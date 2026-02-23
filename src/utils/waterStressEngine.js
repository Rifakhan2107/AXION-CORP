/**
 * Water Stress Index (WSI) Calculation Engine
 * Formula based on SSMI research for Vidarbha region
 * 
 * WSI = (w1 × RainfallDeviation) + (w2 × GroundwaterDepletion) + (w3 × PopulationDemandRatio)
 * 
 * Where:
 *   w1 = 0.40 (Rainfall weight)
 *   w2 = 0.35 (Groundwater weight)  
 *   w3 = 0.25 (Population demand weight)
 * 
 * Risk Classification:
 *   0-30  → Low Risk (Green)
 *   31-60 → Moderate Risk (Yellow)
 *   61-80 → High Risk (Orange)
 *   81-100 → Critical (Red)
 */

const WEIGHTS = {
    rainfall: 0.40,
    groundwater: 0.35,
    population: 0.25,
};

/**
 * Calculate Rainfall Deviation Score (0-100)
 * Based on percentage deviation from historical normal
 * @param {number} actual - Actual rainfall in mm
 * @param {number} normal - Normal/average rainfall in mm
 */
export function calcRainfallDeviation(actual, normal) {
    if (normal === 0) return 100;
    const deviation = ((normal - actual) / normal) * 100;
    // Clamp between 0-100. Higher score = worse deficit
    return Math.max(0, Math.min(100, deviation * 1.5));
}

/**
 * Calculate Groundwater Depletion Score (0-100)
 * Based on current depth and rate of decline
 * @param {number} currentDepth - Current groundwater depth in metres
 * @param {number} trendPerYear - Annual trend in metres/year (negative = declining)
 * @param {number} criticalDepth - Depth considered critical (default 15m for Vidarbha)
 */
export function calcGroundwaterDepletion(currentDepth, trendPerYear, criticalDepth = 15) {
    // Depth score: how close to critical depth
    const depthScore = (currentDepth / criticalDepth) * 60;
    // Trend score: rate of decline
    const trendScore = Math.abs(trendPerYear) * 15;
    return Math.max(0, Math.min(100, depthScore + trendScore));
}

/**
 * Calculate Population Demand Ratio Score (0-100)
 * Based on population density and available water supply
 * @param {number} population - Village population
 * @param {number} waterAvailableLPCD - Litres per capita per day available
 * @param {number} targetLPCD - Target LPCD (NRDWP standard: 55 LPCD rural, 135 urban)
 */
export function calcPopulationDemand(population, waterAvailableLPCD = 40, targetLPCD = 55) {
    // Deficit ratio
    const deficitRatio = Math.max(0, (targetLPCD - waterAvailableLPCD) / targetLPCD);
    // Population pressure (villages > 20000 get higher scores)
    const popFactor = Math.min(1, population / 40000);
    return Math.max(0, Math.min(100, (deficitRatio * 70) + (popFactor * 30)));
}

/**
 * Calculate the composite Water Stress Index (0-100)
 * @param {object} params - Village parameters
 * @returns {object} - { wsi, rainfallScore, groundwaterScore, populationScore, riskLevel, breakdown }
 */
export function calculateWSI({
    actualRainfall, normalRainfall,
    groundwaterDepth, groundwaterTrend,
    population, waterAvailableLPCD
}) {
    const rainfallScore = calcRainfallDeviation(actualRainfall, normalRainfall);
    const groundwaterScore = calcGroundwaterDepletion(groundwaterDepth, groundwaterTrend);
    const populationScore = calcPopulationDemand(population, waterAvailableLPCD);

    const wsi = Math.round(
        (WEIGHTS.rainfall * rainfallScore) +
        (WEIGHTS.groundwater * groundwaterScore) +
        (WEIGHTS.population * populationScore)
    );

    const clampedWSI = Math.max(0, Math.min(100, wsi));

    let riskLevel, riskColor;
    if (clampedWSI <= 30) { riskLevel = 'Low'; riskColor = '#34d399'; }
    else if (clampedWSI <= 60) { riskLevel = 'Moderate'; riskColor = '#fbbf24'; }
    else if (clampedWSI <= 80) { riskLevel = 'High'; riskColor = '#fb923c'; }
    else { riskLevel = 'Critical'; riskColor = '#f87171'; }

    return {
        wsi: clampedWSI,
        riskLevel,
        riskColor,
        breakdown: {
            rainfall: { score: Math.round(rainfallScore), weight: WEIGHTS.rainfall, weighted: Math.round(WEIGHTS.rainfall * rainfallScore) },
            groundwater: { score: Math.round(groundwaterScore), weight: WEIGHTS.groundwater, weighted: Math.round(WEIGHTS.groundwater * groundwaterScore) },
            population: { score: Math.round(populationScore), weight: WEIGHTS.population, weighted: Math.round(WEIGHTS.population * populationScore) },
        }
    };
}

/**
 * Drought Hazard Score (from SSMI research paper)
 * H = (D × M × I) / N
 * D = duration, M = magnitude/severity, I = intensity, N = total events
 */
export function calcDroughtHazard(duration, magnitude, intensity, totalEvents) {
    if (totalEvents === 0) return 0;
    return (duration * magnitude * intensity) / totalEvents;
}

/**
 * Predict tanker demand based on WSI trend + seasonal adjustment
 * Uses exponential moving average with seasonal multiplier
 */
export function predictTankerDemand(currentDemand, wsiTrend, month) {
    // Seasonal multipliers for Vidarbha (peak: Mar-Jun)
    const seasonal = { 1: 1.1, 2: 1.3, 3: 1.6, 4: 1.9, 5: 2.0, 6: 1.8, 7: 0.5, 8: 0.3, 9: 0.4, 10: 0.7, 11: 0.9, 12: 1.0 };
    const alpha = 0.3; // EMA smoothing factor
    const trendFactor = wsiTrend > 0 ? 1 + (wsiTrend * 0.02) : 1;
    return Math.round(currentDemand * alpha * (seasonal[month] || 1) * trendFactor + currentDemand * (1 - alpha));
}

/**
 * Priority score for tanker allocation
 * Higher score = more urgent need
 */
export function calcPriorityScore(population, wsi, distanceKm) {
    const popWeight = 0.25;
    const severityWeight = 0.55;
    const distancePenalty = 0.20;
    return Math.round(
        (popWeight * Math.min(population / 500, 100)) +
        (severityWeight * wsi) +
        (distancePenalty * Math.min(distanceKm * 2, 100))
    );
}
