import { useState, useCallback, useMemo } from 'react';
import * as turf from '@turf/turf';

/**
 * Manages map interaction state: drawing, point selection, marker styling.
 * Points are supplied externally (from the Luzmo dataset).
 */
export function useMapData(externalPoints = []) {
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [selectedPointId, setSelectedPointId] = useState(null);
  const [markerColor, setMarkerColor] = useState('#1e88e5');
  const [markerSize, setMarkerSize] = useState(8);

  const points = externalPoints;

  const selectedPoint = useMemo(
    () => points.find((p) => p.id === selectedPointId) || null,
    [points, selectedPointId]
  );

  const selectedPoints = useMemo(() => {
    if (!drawnPolygon || points.length === 0) return points;
    return points.filter((pt) => {
      const point = turf.point([pt.lon, pt.lat]);
      return turf.booleanPointInPolygon(point, drawnPolygon);
    });
  }, [points, drawnPolygon]);

  const selectionBounds = useMemo(() => {
    if (drawnPolygon) {
      const bbox = turf.bbox(drawnPolygon);
      return { minLon: bbox[0], minLat: bbox[1], maxLon: bbox[2], maxLat: bbox[3] };
    }
    if (selectedPoint) {
      const buffer = turf.buffer(
        turf.point([selectedPoint.lon, selectedPoint.lat]),
        0.5,
        { units: 'kilometers' }
      );
      const bbox = turf.bbox(buffer);
      return { minLon: bbox[0], minLat: bbox[1], maxLon: bbox[2], maxLat: bbox[3] };
    }
    return null;
  }, [drawnPolygon, selectedPoint]);

  const activeSelection = useMemo(() => {
    if (drawnPolygon) return { mode: 'polygon', points: selectedPoints };
    if (selectedPoint) return { mode: 'point', points: [selectedPoint] };
    return { mode: 'none', points };
  }, [drawnPolygon, selectedPoint, selectedPoints, points]);

  const handlePolygonCreated = useCallback((geoJson) => {
    setDrawnPolygon(geoJson);
    setSelectedPointId(null);
  }, []);

  const handlePolygonDeleted = useCallback(() => {
    setDrawnPolygon(null);
  }, []);

  const handlePointClick = useCallback((pointId) => {
    setSelectedPointId((prev) => (prev === pointId ? null : pointId));
  }, []);

  const clearSelection = useCallback(() => {
    setDrawnPolygon(null);
    setSelectedPointId(null);
  }, []);

  return useMemo(() => ({
    points,
    selectedPoints,
    selectedPoint,
    selectedPointId,
    drawnPolygon,
    selectionBounds,
    activeSelection,
    markerColor,
    markerSize,
    setMarkerColor,
    setMarkerSize,
    handlePolygonCreated,
    handlePolygonDeleted,
    handlePointClick,
    clearSelection,
  }), [points, selectedPoints, selectedPoint, selectedPointId, drawnPolygon,
       selectionBounds, activeSelection, markerColor, markerSize,
       handlePolygonCreated, handlePolygonDeleted, handlePointClick, clearSelection]);
}
