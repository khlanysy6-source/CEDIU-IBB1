import { INITIAL_INITIATIVES } from '../data';
import { Initiative } from '../types';

export type OfficialRouteRecord = {
  id: string | number;
  name: string;
  district: string;
  status: 'completed' | 'ongoing' | 'stagnant' | 'stopped' | 'pending';
  completionRate: number;
  completedLength?: number;
  avgWidth?: number;
  beneficiaries?: number;
  estimatedCost?: number;
  completedCost?: number;
  geometryQuality?: 'complete' | 'partial' | 'none';
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
  notes?: string;
  geometrySegments?: [number, number][][];
};

function parseCoordinatePair(raw?: string): { lat: number; lng: number } | null {
  if (!raw) return null;
  const match = raw.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
  if (match.length < 2) return null;
  let [lat, lng] = match;
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) [lat, lng] = [lng, lat];
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

export function buildOfficialRouteNetwork(initiatives: Initiative[] = INITIAL_INITIATIVES): OfficialRouteRecord[] {
  return initiatives.map((init, index) => {
    const coords = parseCoordinatePair(init.coordinates);
    const startLat = coords ? coords.lat : 13.85 + (index % 50) * 0.008;
    const startLng = coords ? coords.lng : 44.05 + (index % 40) * 0.009;
    
    // Calculate accurate end coordinate using distance if available
    const km = (Number((init as any).lengthCompleted) || Number((init as any).completedLength) || Number(init.totalDistance) || 1.2);
    const deltaLat = (km / 111) * 0.707;
    const deltaLng = (km / (111 * Math.cos(startLat * (Math.PI / 180)))) * 0.707;
    const endLat = Math.round((startLat + deltaLat) * 1000000) / 1000000;
    const endLng = Math.round((startLng + deltaLng) * 1000000) / 1000000;

    const rawLen = (init as any).lengthCompleted || (init as any).completedLength;
    const compLength = Number(rawLen) 
      ? (Number(rawLen) > 50 ? Number(rawLen) : Number(rawLen) * 1000)
      : (Number(init.totalDistance) ? Number(init.totalDistance) * 1000 : 850);

    return {
      id: init.id,
      name: init.name,
      district: init.district || 'محافظة إب',
      status: (init.status as any) || 'ongoing',
      completionRate: Number(init.completionRate) || 0,
      completedLength: compLength,
      avgWidth: 4.5,
      beneficiaries: Number(init.beneficiaries) || 0,
      estimatedCost: Number(init.cost) || Number(init.estimatedCost) || 0,
      completedCost: Number(init.executionCostCompleted) || 0,
      geometryQuality: init.coordinates ? 'complete' : 'partial',
      startLat,
      startLng,
      endLat,
      endLng,
      notes: init.notes || init.stagnationReason || '',
      geometrySegments: [
        [
          [startLng, startLat],
          [startLng + (endLng - startLng) * 0.5 + (index % 2 === 0 ? 0.001 : -0.001), startLat + (endLat - startLat) * 0.5],
          [endLng, endLat]
        ]
      ]
    };
  });
}

export const OFFICIAL_ROUTE_NETWORK: OfficialRouteRecord[] = buildOfficialRouteNetwork(INITIAL_INITIATIVES);
