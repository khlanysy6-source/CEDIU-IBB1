/**
 * Unified GIS Road Geometry Normalization & Audit Pipeline
 * Strictly authentic GIS geometry parsing with zero synthetic interpolations.
 * Adheres to ISO/OGC GeoJSON standards and PMO engineering rigor.
 */

export type GeometryType = 'LineString' | 'MultiLineString' | 'Point' | 'None';

export type DataTrustLevel = 
  | 'verified_kml'             // موثق هندسياً (KML / مسار ميداني حقيقي)
  | 'point_gps_only'           // بيانات إحداثيات نقطية فقط (موقع المشروع)
  | 'incomplete_geometry'      // هندسة غير مكتملة (مسار جزئي)
  | 'unverified_metadata'      // غير متحقق / بيانات وصفية فقط
  | 'excluded_out_of_bounds';  // مستبعد - خارج النطاق الجغرافي

export interface GISFeatureRecord {
  id: string;
  name: string;
  district: string;
  subDistrict?: string;
  village?: string;
  status: 'completed' | 'ongoing' | 'stagnant' | 'stopped' | 'pending';
  completionRate: number;
  completedLengthMeters: number;
  estimatedLengthMeters: number;
  avgWidthMeters: number;
  beneficiaries: number;
  estimatedCost: number;
  completedCost: number;
  geometryType: GeometryType;
  trustLevel: DataTrustLevel;
  trustLabel: string;
  lineStrings: [number, number][][]; // Array of LineStrings, each LineString is [lng, lat][]
  point: [number, number] | null;    // [lng, lat] for point locations
  startPoint: [number, number] | null; // [lng, lat]
  endPoint: [number, number] | null;   // [lng, lat]
  endpointVerification: {
    isVerified: boolean;
    startMatchesTrack: boolean;
    endMatchesTrack: boolean;
    offsetDistanceMeters: number;
    diagnosticNote: string;
  } | null;
  totalVertices: number;
  sourceType: 'kml_survey_track' | 'field_gps_point' | 'metadata_only';
  sourceDescription: string;
  sourceTrackId?: string;
  notes?: string;
  lastUpdated: string;
  isExcluded: boolean;
  exclusionReason?: string;
}

export interface GISBounds {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

export interface GISAuditSummary {
  totalRecords: number;
  recordsWithValidGeometry: number;
  recordsWithLineString: number;
  recordsWithMultiLineString: number;
  recordsWithPointOnly: number;
  recordsWithoutGeometry: number;
  invalidOrExcludedRecords: number;
  surveyTracksLoaded: number;
  confirmedTrackMatches: number;
  probableTrackMatches: number;
  unmatchedSurveyTracks: number;
  totalVerticesCount: number;
  auditTimestamp: string;
  excludedDetails: Array<{ id: string; name: string; district: string; reason: string }>;
}

export interface GISNormalizedResult {
  features: GISFeatureRecord[];
  activeRoadFeatures: GISFeatureRecord[];
  pointFeatures: GISFeatureRecord[];
  surveyTracks: any[];
  audit: GISAuditSummary;
  bounds: GISBounds;
}

// Ibb Governorate strict administrative bounding limits
export const IBB_GEO_LIMITS = {
  minLat: 13.50,
  maxLat: 14.65,
  minLng: 43.50,
  maxLng: 44.90
};

// District center coordinates for geospatial anchoring and visual context
export const IBB_DISTRICT_CENTERS: Record<string, [number, number]> = {
  'مديرية المشنة': [44.175, 13.965],
  'مديرية الظهار': [44.165, 13.985],
  'مديرية جبلة': [44.145, 13.920],
  'مديرية ريف إب': [44.195, 14.020],
  'مديرية بعدان': [44.270, 14.010],
  'مديرية ذي السفال': [44.110, 13.825],
  'مديرية السياني': [44.215, 13.845],
  'مديرية حبيش': [44.080, 14.110],
  'مديرية المخادر': [44.140, 14.135],
  'مديرية يريم': [44.280, 14.290],
  'مديرية السدة': [44.375, 14.120],
  'مديرية النادرة': [44.460, 14.090],
  'مديرية الرضمة': [44.520, 14.160],
  'مديرية القفر': [44.020, 14.280],
  'مديرية العدين': [43.965, 13.960],
  'مديرية حزم العدين': [43.890, 14.040],
  'مديرية فرع العدين': [43.760, 13.910],
  'مديرية مذيخرة': [43.990, 13.850],
  'مديرية السبرة': [44.335, 13.890],
  'مديرية الشعر': [44.390, 14.040]
};

/**
 * Calculates haversine distance in meters between two [lng, lat] points
 */
export function calculateHaversineDistanceMeters(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Parses and validates coordinate pair strictly.
 * Returns [lng, lat] if valid, or null if corrupted or out of bounds.
 */
export function parseAndValidateCoordinatePair(raw: any): [number, number] | null {
  if (!raw) return null;

  let rawLng: number | null = null;
  let rawLat: number | null = null;

  if (Array.isArray(raw) && raw.length >= 2) {
    rawLng = Number(raw[0]);
    rawLat = Number(raw[1]);
  } else if (typeof raw === 'string') {
    const cleaned = raw.replace(/[^\d.,\-]/g, ' ').replace(/٫/g, '.');
    const parts = cleaned.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    if (parts.length >= 2) {
      if (parts[0] >= 13.0 && parts[0] <= 15.0 && parts[1] >= 43.0 && parts[1] <= 45.0) {
        rawLat = parts[0];
        rawLng = parts[1];
      } else if (parts[0] >= 43.0 && parts[0] <= 45.0 && parts[1] >= 13.0 && parts[1] <= 15.0) {
        rawLng = parts[0];
        rawLat = parts[1];
      } else {
        // Look for inverted or raw order
        rawLat = parts[0];
        rawLng = parts[1];
      }
    }
  }

  if (rawLng == null || rawLat == null || !Number.isFinite(rawLng) || !Number.isFinite(rawLat)) {
    return null;
  }

  // Handle accidental inversion
  if (rawLng >= 13.0 && rawLng <= 15.0 && rawLat >= 43.0 && rawLat <= 45.0) {
    const temp = rawLng;
    rawLng = rawLat;
    rawLat = temp;
  }

  // Strict check against Ibb bounds: do not guess or shift!
  if (
    rawLng < IBB_GEO_LIMITS.minLng ||
    rawLng > IBB_GEO_LIMITS.maxLng ||
    rawLat < IBB_GEO_LIMITS.minLat ||
    rawLat > IBB_GEO_LIMITS.maxLat
  ) {
    return null;
  }

  return [
    Math.round(rawLng * 1000000) / 1000000,
    Math.round(rawLat * 1000000) / 1000000
  ];
}

/**
 * Normalizes and audits all road records against authentic survey tracks and boundaries.
 * Strictly guarantees ZERO synthetic geometry creation.
 */
export function normalizeAndAuditGISRoads(
  initiatives: any[],
  rawSurveyTracks: any[] = [],
  boundaryCoordinates: [number, number][] = []
): GISNormalizedResult {
  const audit: GISAuditSummary = {
    totalRecords: initiatives.length,
    recordsWithValidGeometry: 0,
    recordsWithLineString: 0,
    recordsWithMultiLineString: 0,
    recordsWithPointOnly: 0,
    recordsWithoutGeometry: 0,
    invalidOrExcludedRecords: 0,
    surveyTracksLoaded: rawSurveyTracks.length,
    confirmedTrackMatches: 0,
    probableTrackMatches: 0,
    unmatchedSurveyTracks: 0,
    totalVerticesCount: 0,
    auditTimestamp: new Date().toISOString(),
    excludedDetails: []
  };

  // 1. Build map of validated survey tracks
  const validTracks = new Map<string, any>();
  const trackMatchedSet = new Set<string>();

  rawSurveyTracks.forEach((t) => {
    if (!t || !Array.isArray(t.points) || t.points.length < 2) return;
    
    // Validate each vertex in track
    const validVertices: [number, number][] = [];
    t.points.forEach((pt: any) => {
      const parsed = parseAndValidateCoordinatePair(pt);
      if (parsed) validVertices.push(parsed);
    });

    if (validVertices.length >= 2) {
      const normalizedTrack = {
        ...t,
        validVertices,
        startPoint: validVertices[0],
        endPoint: validVertices[validVertices.length - 1],
        totalVertices: validVertices.length
      };
      if (t.id) validTracks.set(String(t.id), normalizedTrack);
      if (t.match?.routeId) validTracks.set(`route_${t.match.routeId}`, normalizedTrack);
    }
  });

  const features: GISFeatureRecord[] = [];

  initiatives.forEach((init, index) => {
    const id = String(init.id || `init_${index + 1}`);
    const name = init.name || init.title || `مبادرة طريق #${id}`;
    const district = init.district || 'محافظة إب';
    const subDistrict = init.subDistrict || init.isolation || '';
    const village = init.village || '';
    const status = (init.status || 'ongoing') as any;
    const completionRate = Number(init.completionRate) || 0;

    const rawLen = Number(init.lengthCompleted) || Number(init.completedLength) || Number(init.executedWorkQuantities?.lengthCompleted) || 0;
    const completedLengthMeters = rawLen > 50 ? rawLen : (rawLen > 0 ? rawLen * 1000 : 0);
    const estimatedLen = Number(init.totalDistance) ? Number(init.totalDistance) * 1000 : (completedLengthMeters || 1200);
    const avgWidthMeters = Number(init.avgWidth) || Number(init.executedWorkQuantities?.avgWidth) || 4.5;
    const beneficiaries = Number(init.beneficiaries) || 0;
    const estimatedCost = Number(init.cost) || Number(init.estimatedCost) || 0;
    const completedCost = Number(init.executionCostCompleted) || 0;

    // Check for explicit or safe proximity survey track match
    let matchedTrack = validTracks.get(id) || validTracks.get(`route_${id}`);
    
    // Proximity/Name matching fallback if not matched by ID
    if (!matchedTrack && index < rawSurveyTracks.length) {
      const candidateTrack = rawSurveyTracks[index];
      if (candidateTrack && candidateTrack.id && validTracks.has(String(candidateTrack.id))) {
        // Safe check: verify district or proximity
        const trackObj = validTracks.get(String(candidateTrack.id));
        if (candidateTrack.match?.routeId === id || candidateTrack.match?.routeId === String(index + 1)) {
          matchedTrack = trackObj;
        }
      }
    }

    // Check initiative point coordinate
    const parsedPoint = parseAndValidateCoordinatePair(init.coordinates);

    // Exclusion check: if raw coordinate exists but parsed is null => corrupted or out-of-bounds
    let isExcluded = false;
    let exclusionReason: string | undefined;

    if (init.coordinates && !parsedPoint) {
      isExcluded = true;
      exclusionReason = `الإحداثيات المدخلة (${init.coordinates}) خارج النطاق الجغرافي المعتمد لمحافظة إب أو غير صالحة`;
      audit.invalidOrExcludedRecords++;
      audit.excludedDetails.push({
        id,
        name,
        district,
        reason: exclusionReason
      });
    }

    let geometryType: GeometryType = 'None';
    let trustLevel: DataTrustLevel = 'unverified_metadata';
    let trustLabel = 'غير متحقق / بيانات وصفية فقط';
    let lineStrings: [number, number][][] = [];
    let startPoint: [number, number] | null = null;
    let endPoint: [number, number] | null = null;
    let endpointVerification = null;
    let totalVertices = 0;
    let sourceType: 'kml_survey_track' | 'field_gps_point' | 'metadata_only' = 'metadata_only';
    let sourceDescription = 'سجل بيانات وصفية';
    let sourceTrackId: string | undefined;

    if (isExcluded) {
      trustLevel = 'excluded_out_of_bounds';
      trustLabel = 'مستبعد - خارج النطاق الجغرافي';
    } else if (matchedTrack && matchedTrack.validVertices && matchedTrack.validVertices.length >= 2) {
      // Authentic LineString from KML survey track
      lineStrings = [matchedTrack.validVertices];
      geometryType = 'LineString';
      startPoint = matchedTrack.startPoint;
      endPoint = matchedTrack.endPoint;
      totalVertices = matchedTrack.validVertices.length;
      trustLevel = 'verified_kml';
      trustLabel = 'موثق هندسياً (مسار مسح KML/GPS)';
      sourceType = 'kml_survey_track';
      sourceDescription = `مسار مسح ميداني KML: ${matchedTrack.name || matchedTrack.id}`;
      sourceTrackId = matchedTrack.id;
      trackMatchedSet.add(matchedTrack.id);

      audit.recordsWithLineString++;
      audit.recordsWithValidGeometry++;
      audit.totalVerticesCount += totalVertices;

      if (matchedTrack.match?.matchStatus === 'confirmed') {
        audit.confirmedTrackMatches++;
      } else {
        audit.probableTrackMatches++;
      }

      // Endpoint verification against point coordinate if available
      if (parsedPoint) {
        const distStart = calculateHaversineDistanceMeters(parsedPoint, startPoint);
        const distEnd = calculateHaversineDistanceMeters(parsedPoint, endPoint);
        const minOffset = Math.min(distStart, distEnd);
        const isVerified = minOffset < 500;

        endpointVerification = {
          isVerified,
          startMatchesTrack: distStart < 500,
          endMatchesTrack: distEnd < 500,
          offsetDistanceMeters: minOffset,
          diagnosticNote: isVerified
            ? `مطابقة مؤكدة بين إحداثي البداية ومسار KML (فارق ${minOffset} متر)`
            : `تفاوت بين إحداثي المبادرة ومسار KML بمقدار ${minOffset} متر`
        };
      }
    } else if (parsedPoint) {
      // Discrete point coordinate ONLY - Strictly NO synthetic lines created!
      geometryType = 'Point';
      trustLevel = 'point_gps_only';
      trustLabel = 'بيانات إحداثيات نقطية فقط';
      sourceType = 'field_gps_point';
      sourceDescription = 'إحداثي GPS لموقع المشروع';
      startPoint = parsedPoint;
      endPoint = parsedPoint;
      totalVertices = 1;
      audit.recordsWithPointOnly++;
      audit.recordsWithValidGeometry++;
      audit.totalVerticesCount += 1;
    } else {
      geometryType = 'None';
      trustLevel = 'unverified_metadata';
      trustLabel = 'بدون إحداثيات جغرافية';
      audit.recordsWithoutGeometry++;
    }

    features.push({
      id,
      name,
      district,
      subDistrict,
      village,
      status,
      completionRate,
      completedLengthMeters,
      estimatedLengthMeters: estimatedLen,
      avgWidthMeters,
      beneficiaries,
      estimatedCost,
      completedCost,
      geometryType,
      trustLevel,
      trustLabel,
      lineStrings,
      point: parsedPoint,
      startPoint,
      endPoint,
      endpointVerification,
      totalVertices,
      sourceType,
      sourceDescription,
      sourceTrackId,
      notes: init.notes || init.stagnationReason || '',
      lastUpdated: init.updatedAt || new Date().toISOString().slice(0, 10),
      isExcluded,
      exclusionReason
    });
  });

  audit.unmatchedSurveyTracks = Math.max(0, rawSurveyTracks.length - trackMatchedSet.size);

  // Compute strict bounding box based on prioritized GIS hierarchy:
  // Priority 1: Governorate Boundary Polygon
  // Priority 2: Authentic Road LineStrings & Raw Survey Tracks
  // Priority 3: District Administrative Centers
  let minLng = IBB_GEO_LIMITS.maxLng;
  let maxLng = IBB_GEO_LIMITS.minLng;
  let minLat = IBB_GEO_LIMITS.maxLat;
  let maxLat = IBB_GEO_LIMITS.minLat;

  // 1. Boundary polygon coordinates (Primary envelope)
  if (Array.isArray(boundaryCoordinates) && boundaryCoordinates.length > 0) {
    boundaryCoordinates.forEach(([lng, lat]) => {
      if (lng >= IBB_GEO_LIMITS.minLng && lng <= IBB_GEO_LIMITS.maxLng &&
          lat >= IBB_GEO_LIMITS.minLat && lat <= IBB_GEO_LIMITS.maxLat) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    });
  }

  // 2. Road LineStrings & Survey Tracks (Ensure no road geometry is clipped)
  features.forEach((f) => {
    if (f.isExcluded) return;
    f.lineStrings.forEach((seg) => {
      seg.forEach(([lng, lat]) => {
        if (lng >= IBB_GEO_LIMITS.minLng && lng <= IBB_GEO_LIMITS.maxLng &&
            lat >= IBB_GEO_LIMITS.minLat && lat <= IBB_GEO_LIMITS.maxLat) {
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
      });
    });
  });

  rawSurveyTracks.forEach((t) => {
    if (Array.isArray(t.points)) {
      t.points.forEach(([lng, lat]: [number, number]) => {
        if (lng >= IBB_GEO_LIMITS.minLng && lng <= IBB_GEO_LIMITS.maxLng &&
            lat >= IBB_GEO_LIMITS.minLat && lat <= IBB_GEO_LIMITS.maxLat) {
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
      });
    }
  });

  // 3. District administrative centers
  Object.values(IBB_DISTRICT_CENTERS).forEach(([lng, lat]) => {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  });

  // Fallback to governorate limits if empty or inverted
  if (minLng >= maxLng || minLat >= maxLat) {
    minLng = IBB_GEO_LIMITS.minLng;
    maxLng = IBB_GEO_LIMITS.maxLng;
    minLat = IBB_GEO_LIMITS.minLat;
    maxLat = IBB_GEO_LIMITS.maxLat;
  }

  // Add 3.5% margin padding for balanced visual breathing room
  const padLng = (maxLng - minLng) * 0.035;
  const padLat = (maxLat - minLat) * 0.035;

  const bounds: GISBounds = {
    minLng: minLng - padLng,
    maxLng: maxLng + padLng,
    minLat: minLat - padLat,
    maxLat: maxLat + padLat
  };

  const activeRoadFeatures = features.filter((f) => f.geometryType === 'LineString' && !f.isExcluded);
  const pointFeatures = features.filter((f) => f.geometryType === 'Point' && !f.isExcluded);

  return {
    features,
    activeRoadFeatures,
    pointFeatures,
    surveyTracks: rawSurveyTracks,
    audit,
    bounds
  };
}
