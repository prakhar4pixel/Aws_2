import type { Feature, Polygon, MultiPolygon, FeatureCollection } from "geojson";

// Simple utility to add an offset to coordinates
function offsetCoord(coord: [number, number], offsetLng: number, offsetLat: number): [number, number] {
    return [coord[0] + offsetLng, coord[1] + offsetLat];
}

export function generateMockInterventionZones(
    baseFeature: Feature<Polygon | MultiPolygon>,
    interventionIds: string[]
): FeatureCollection {
    const features: Feature[] = [];
    
    // get center approx
    let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
    
    let coords: [number, number][][] = [];
    if (baseFeature.geometry.type === 'Polygon') {
        coords = baseFeature.geometry.coordinates as [number, number][][];
    } else if (baseFeature.geometry.type === 'MultiPolygon') {
        coords = (baseFeature.geometry.coordinates as [number, number][][][])[0];
    }

    if (coords && coords[0]) {
        coords[0].forEach(c => {
            if (c[0] < minLng) minLng = c[0];
            if (c[0] > maxLng) maxLng = c[0];
            if (c[1] < minLat) minLat = c[1];
            if (c[1] > maxLat) maxLat = c[1];
        });
    }
    
    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;
    const sizeLng = maxLng - minLng;
    const sizeLat = maxLat - minLat;

    interventionIds.forEach(id => {
        if (id === 'cool_roofs') {
            features.push({
                type: 'Feature',
                properties: { type: 'cool_roofs', description: 'Potential Cool Roof Zones' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        offsetCoord([centerLng, centerLat], -sizeLng * 0.2, sizeLat * 0.2),
                        offsetCoord([centerLng, centerLat], sizeLng * 0.2, sizeLat * 0.2),
                        offsetCoord([centerLng, centerLat], sizeLng * 0.2, -sizeLat * 0.2),
                        offsetCoord([centerLng, centerLat], -sizeLng * 0.2, -sizeLat * 0.2),
                        offsetCoord([centerLng, centerLat], -sizeLng * 0.2, sizeLat * 0.2)
                    ]]
                }
            });
        }
        if (id === 'pocket_parks') {
            features.push({
                type: 'Feature',
                properties: { type: 'pocket_parks', description: 'Candidate Pocket Park' },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        offsetCoord([centerLng, centerLat], sizeLng * 0.3, sizeLat * 0.3),
                        offsetCoord([centerLng, centerLat], sizeLng * 0.4, sizeLat * 0.3),
                        offsetCoord([centerLng, centerLat], sizeLng * 0.4, sizeLat * 0.4),
                        offsetCoord([centerLng, centerLat], sizeLng * 0.3, sizeLat * 0.4),
                        offsetCoord([centerLng, centerLat], sizeLng * 0.3, sizeLat * 0.3)
                    ]]
                }
            });
        }
        if (id === 'green_corridors') {
            features.push({
                type: 'Feature',
                properties: { type: 'green_corridors', description: 'Potential Green Corridor' },
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        offsetCoord([centerLng, centerLat], -sizeLng * 0.4, -sizeLat * 0.4),
                        offsetCoord([centerLng, centerLat], sizeLng * 0.4, sizeLat * 0.4)
                    ]
                }
            });
        }
        if (id === 'shaded_corridors') {
            features.push({
                type: 'Feature',
                properties: { type: 'shaded_corridors', description: 'Proposed Shade Corridor' },
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        offsetCoord([centerLng, centerLat], -sizeLng * 0.3, sizeLat * 0.4),
                        offsetCoord([centerLng, centerLat], sizeLng * 0.4, -sizeLat * 0.3)
                    ]
                }
            });
        }
    });

    return {
        type: 'FeatureCollection',
        features
    };
}
