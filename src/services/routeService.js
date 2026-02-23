/**
 * Route Optimization Service using OSRM (Open Source Routing Machine)
 * Free, no API key needed — uses public demo server
 * Provides: shortest path routing, distance, duration, route geometry
 */

const OSRM_BASE = 'https://router.project-osrm.org';

/**
 * Get optimized route between two points
 * @param {number} fromLat - Origin latitude
 * @param {number} fromLng - Origin longitude
 * @param {number} toLat - Destination latitude
 * @param {number} toLng - Destination longitude
 * @returns {object} { distance, duration, geometry, steps }
 */
export async function getRoute(fromLat, fromLng, toLat, toLng) {
    try {
        const url = `${OSRM_BASE}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.code !== 'Ok' || !data.routes?.length) {
            return getFallbackRoute(fromLat, fromLng, toLat, toLng);
        }

        const route = data.routes[0];
        return {
            distance: (route.distance / 1000).toFixed(1), // km
            duration: Math.round(route.duration / 60), // minutes
            geometry: route.geometry.coordinates.map(c => [c[1], c[0]]), // [lat,lng] for Leaflet
            steps: route.legs[0]?.steps?.map(s => ({
                instruction: s.maneuver?.type || 'continue',
                name: s.name || 'Road',
                distance: (s.distance / 1000).toFixed(1),
                duration: Math.round(s.duration / 60),
            })) || [],
        };
    } catch (err) {
        console.error('OSRM routing error:', err);
        return getFallbackRoute(fromLat, fromLng, toLat, toLng);
    }
}

/**
 * Optimize route for multiple stops (TSP - Traveling Salesman)
 * OSRM trip service finds best order to visit all waypoints
 * @param {Array} waypoints - [{lat, lng, name}]
 * @returns {object} { totalDistance, totalDuration, optimizedOrder, legs }
 */
export async function getOptimizedMultiStopRoute(depotLat, depotLng, waypoints) {
    try {
        const coords = [`${depotLng},${depotLat}`, ...waypoints.map(w => `${w.lng},${w.lat}`)].join(';');
        const url = `${OSRM_BASE}/trip/v1/driving/${coords}?overview=full&geometries=geojson&steps=true&roundtrip=false&source=first`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.code !== 'Ok' || !data.trips?.length) {
            return { totalDistance: 0, totalDuration: 0, optimizedOrder: waypoints.map((_, i) => i), legs: [], geometry: [] };
        }

        const trip = data.trips[0];
        return {
            totalDistance: (trip.distance / 1000).toFixed(1),
            totalDuration: Math.round(trip.duration / 60),
            optimizedOrder: data.waypoints.slice(1).map(w => w.waypoint_index - 1),
            geometry: trip.geometry.coordinates.map(c => [c[1], c[0]]),
            legs: trip.legs.map((leg, i) => ({
                from: i === 0 ? 'Depot' : waypoints[i - 1]?.name || `Stop ${i}`,
                to: waypoints[i]?.name || `Stop ${i + 1}`,
                distance: (leg.distance / 1000).toFixed(1),
                duration: Math.round(leg.duration / 60),
            })),
        };
    } catch (err) {
        console.error('OSRM multi-stop error:', err);
        return { totalDistance: 0, totalDuration: 0, optimizedOrder: [], legs: [], geometry: [] };
    }
}

function getFallbackRoute(fromLat, fromLng, toLat, toLng) {
    // Haversine distance fallback
    const R = 6371;
    const dLat = (toLat - fromLat) * Math.PI / 180;
    const dLng = (toLng - fromLng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return {
        distance: dist.toFixed(1),
        duration: Math.round(dist / 40 * 60), // assume 40km/h avg
        geometry: [[fromLat, fromLng], [toLat, toLng]], // straight line
        steps: [],
    };
}
