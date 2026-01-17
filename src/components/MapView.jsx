import { useState, useRef, useEffect, useMemo } from 'react';
import ReactMapGL, { Source, Layer, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getIsochrone, calculateMultipleDistances } from '../utils/mapboxDirections';
import { generateProviders } from '../data/generateProviders';
import { getBeneficiariesInBounds, TOTAL_BENEFICIARIES } from '../data/generateBeneficiaries';

// Mapbox access token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYXJ0aHVyaDEiLCJhIjoiY21raDJmb2cyMGVzYjNmcW1kOWRmbGJqbyJ9.K5fViocsPVuK_22SwWc4Lg';

const stateData = {
  AL: { name: 'Alabama', providers: 420, score: 79, driveTime: 17, ratio: 1750, status: 'review' },
  AK: { name: 'Alaska', providers: 85, score: 68, driveTime: 35, ratio: 2800, status: 'critical' },
  AZ: { name: 'Arizona', providers: 680, score: 84, driveTime: 14, ratio: 1450, status: 'ok' },
  AR: { name: 'Arkansas', providers: 310, score: 76, driveTime: 19, ratio: 1900, status: 'review' },
  CA: { name: 'California', providers: 2840, score: 92, driveTime: 11, ratio: 1100, status: 'ok' },
  CO: { name: 'Colorado', providers: 540, score: 88, driveTime: 13, ratio: 1300, status: 'ok' },
  CT: { name: 'Connecticut', providers: 380, score: 90, driveTime: 10, ratio: 1150, status: 'ok' },
  DE: { name: 'Delaware', providers: 95, score: 86, driveTime: 12, ratio: 1280, status: 'ok' },
  FL: { name: 'Florida', providers: 1680, score: 88, driveTime: 13, ratio: 1300, status: 'ok' },
  GA: { name: 'Georgia', providers: 850, score: 81, driveTime: 15, ratio: 1600, status: 'review' },
  HI: { name: 'Hawaii', providers: 145, score: 82, driveTime: 18, ratio: 1650, status: 'review' },
  ID: { name: 'Idaho', providers: 180, score: 77, driveTime: 22, ratio: 2100, status: 'critical' },
  IL: { name: 'Illinois', providers: 760, score: 82, driveTime: 14, ratio: 1500, status: 'review' },
  IN: { name: 'Indiana', providers: 580, score: 83, driveTime: 14, ratio: 1480, status: 'ok' },
  IA: { name: 'Iowa', providers: 340, score: 85, driveTime: 16, ratio: 1550, status: 'review' },
  KS: { name: 'Kansas', providers: 295, score: 80, driveTime: 18, ratio: 1850, status: 'review' },
  KY: { name: 'Kentucky', providers: 425, score: 78, driveTime: 17, ratio: 1800, status: 'review' },
  LA: { name: 'Louisiana', providers: 460, score: 75, driveTime: 19, ratio: 1950, status: 'critical' },
  ME: { name: 'Maine', providers: 150, score: 81, driveTime: 20, ratio: 1700, status: 'review' },
  MD: { name: 'Maryland', providers: 620, score: 89, driveTime: 11, ratio: 1200, status: 'ok' },
  MA: { name: 'Massachusetts', providers: 740, score: 93, driveTime: 9, ratio: 1050, status: 'ok' },
  MI: { name: 'Michigan', providers: 790, score: 80, driveTime: 16, ratio: 1700, status: 'review' },
  MN: { name: 'Minnesota', providers: 560, score: 87, driveTime: 14, ratio: 1400, status: 'ok' },
  MS: { name: 'Mississippi', providers: 285, score: 73, driveTime: 21, ratio: 2200, status: 'critical' },
  MO: { name: 'Missouri', providers: 590, score: 82, driveTime: 15, ratio: 1520, status: 'review' },
  MT: { name: 'Montana', providers: 120, score: 74, driveTime: 28, ratio: 2500, status: 'critical' },
  NE: { name: 'Nebraska', providers: 210, score: 83, driveTime: 17, ratio: 1620, status: 'review' },
  NV: { name: 'Nevada', providers: 290, score: 79, driveTime: 18, ratio: 1880, status: 'review' },
  NH: { name: 'New Hampshire', providers: 165, score: 87, driveTime: 13, ratio: 1350, status: 'ok' },
  NJ: { name: 'New Jersey', providers: 920, score: 91, driveTime: 10, ratio: 1100, status: 'ok' },
  NM: { name: 'New Mexico', providers: 210, score: 76, driveTime: 24, ratio: 2300, status: 'critical' },
  NY: { name: 'New York', providers: 1420, score: 85, driveTime: 10, ratio: 1100, status: 'review' },
  NC: { name: 'North Carolina', providers: 920, score: 83, driveTime: 14, ratio: 1400, status: 'ok' },
  ND: { name: 'North Dakota', providers: 85, score: 78, driveTime: 25, ratio: 2350, status: 'critical' },
  OH: { name: 'Ohio', providers: 980, score: 84, driveTime: 13, ratio: 1350, status: 'ok' },
  OK: { name: 'Oklahoma', providers: 380, score: 77, driveTime: 19, ratio: 1920, status: 'review' },
  OR: { name: 'Oregon', providers: 420, score: 85, driveTime: 15, ratio: 1480, status: 'ok' },
  PA: { name: 'Pennsylvania', providers: 1120, score: 86, driveTime: 12, ratio: 1250, status: 'ok' },
  RI: { name: 'Rhode Island', providers: 125, score: 88, driveTime: 11, ratio: 1220, status: 'ok' },
  SC: { name: 'South Carolina', providers: 485, score: 80, driveTime: 16, ratio: 1680, status: 'review' },
  SD: { name: 'South Dakota', providers: 95, score: 76, driveTime: 26, ratio: 2400, status: 'critical' },
  TN: { name: 'Tennessee', providers: 640, score: 81, driveTime: 16, ratio: 1650, status: 'review' },
  TX: { name: 'Texas', providers: 2156, score: 74, driveTime: 19, ratio: 1800, status: 'critical' },
  UT: { name: 'Utah', providers: 310, score: 84, driveTime: 16, ratio: 1560, status: 'ok' },
  VT: { name: 'Vermont', providers: 78, score: 83, driveTime: 18, ratio: 1720, status: 'review' },
  VA: { name: 'Virginia', providers: 820, score: 86, driveTime: 13, ratio: 1320, status: 'ok' },
  WA: { name: 'Washington', providers: 750, score: 87, driveTime: 13, ratio: 1380, status: 'ok' },
  WV: { name: 'West Virginia', providers: 195, score: 75, driveTime: 21, ratio: 2150, status: 'critical' },
  WI: { name: 'Wisconsin', providers: 570, score: 85, driveTime: 14, ratio: 1450, status: 'ok' },
  WY: { name: 'Wyoming', providers: 68, score: 72, driveTime: 32, ratio: 2700, status: 'critical' },
};

// Map state names to abbreviations for GeoJSON data
const stateNameToCode = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY',
};

export default function MapView({
  hoveredState,
  setHoveredState,
  selectedState,
  setSelectedState,
  isSimulationMode = false,
  removedProviders = new Set(),
  setRemovedProviders = () => {},
}) {
  const [mapFilter, setMapFilter] = useState('all');
  const [viewMode, setViewMode] = useState('state'); // 'state' or 'county'
  const [mapDisplayMode, setMapDisplayMode] = useState('adequacy'); // 'adequacy', 'directory'
  const [hoveredCounty, setHoveredCounty] = useState(null); // Store county info for tooltip
  const [hoveredProvider, setHoveredProvider] = useState(null); // Store provider info
  const [hoveredBeneficiary, setHoveredBeneficiary] = useState(null); // Store beneficiary info
  const [isDriveTimeMode, setIsDriveTimeMode] = useState(false); // Drive time analysis mode
  const [selectedLocation, setSelectedLocation] = useState(null); // { lng, lat }
  const [isochrones, setIsochrones] = useState(null); // Isochrone data
  const [isLoadingIsochrone, setIsLoadingIsochrone] = useState(false);
  const [highlightedProviders, setHighlightedProviders] = useState(new Set()); // Provider IDs within range
  const [highlightedBeneficiaries, setHighlightedBeneficiaries] = useState(new Set()); // Beneficiary IDs within range
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState(null); // ID of clicked beneficiary
  const [selectedProviderId, setSelectedProviderId] = useState(null); // ID of clicked provider
  const [contextMenu, setContextMenu] = useState(null); // { x, y, provider }
  const [viewState, setViewState] = useState({
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 3.5,
  });
  const mapRef = useRef(null);

  // Generate providers once (memoized)
  const providers = useMemo(() => {
    return generateProviders(25000);
  }, []);

  // Get visible beneficiaries based on map bounds
  const [visibleBeneficiaries, setVisibleBeneficiaries] = useState([]);

  // Update visible data when map moves or display mode changes
  useEffect(() => {
    if (mapDisplayMode === 'directory' && mapRef.current) {
      const map = mapRef.current.getMap();
      const bounds = map.getBounds();

      // Sample more beneficiaries for clustering visualization
      const beneficiaries = getBeneficiariesInBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      }, 10000); // Increased sample size for better clustering

      setVisibleBeneficiaries(beneficiaries);
    }
  }, [mapDisplayMode, viewState]);


  // Convert providers to GeoJSON - filter based on selection
  const providersGeoJSON = useMemo(() => {
    if (!providers || providers.length === 0) {
      return { type: 'FeatureCollection', features: [] };
    }

    // Filter providers based on current selection and removed providers
    let filteredProviders = providers.filter(p => !removedProviders.has(p.id)); // Exclude removed providers

    if (selectedBeneficiaryId && highlightedProviders.size > 0) {
      // When beneficiary is selected, only show providers in range
      filteredProviders = filteredProviders.filter(p => highlightedProviders.has(p.id));
      console.log(`Filtering to ${filteredProviders.length} providers within range`);
    } else if (selectedProviderId) {
      // When provider is selected, only show that provider
      filteredProviders = filteredProviders.filter(p => p.id === selectedProviderId);
    }

    return {
      type: 'FeatureCollection',
      features: filteredProviders.map(p => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p.lng, p.lat]
        },
        properties: {
          id: p.id,
          name: p.name,
          specialty: p.specialty,
          address: `${p.address}, ${p.city}, ${p.state} ${p.zip}`,
          accepting: p.accepting,
          network: p.network,
          isRemoved: removedProviders.has(p.id)
        }
      }))
    };
  }, [providers, selectedBeneficiaryId, selectedProviderId, highlightedProviders, removedProviders]);

  // Convert beneficiaries to GeoJSON - filter based on selection
  const beneficiariesGeoJSON = useMemo(() => {
    // Filter beneficiaries based on current selection
    let filteredBeneficiaries = visibleBeneficiaries;
    if (selectedProviderId && highlightedBeneficiaries.size > 0) {
      // When provider is selected, only show beneficiaries in range
      filteredBeneficiaries = visibleBeneficiaries.filter(b => highlightedBeneficiaries.has(b.id));
      console.log(`Filtering to ${filteredBeneficiaries.length} beneficiaries within range`);
    } else if (selectedBeneficiaryId) {
      // When beneficiary is selected, only show that beneficiary
      filteredBeneficiaries = visibleBeneficiaries.filter(b => b.id === selectedBeneficiaryId);
    }

    return {
      type: 'FeatureCollection',
      features: filteredBeneficiaries.map(b => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [b.lng, b.lat]
        },
        properties: {
          id: b.id,
          name: b.name,
          ageGroup: b.ageGroup,
          planType: b.planType,
          hasProvider: b.hasProvider
        }
      }))
    };
  }, [visibleBeneficiaries, selectedBeneficiaryId, selectedProviderId, highlightedBeneficiaries]);

  // Generate random but consistent county rating based on county name
  const getCountyRating = (countyName, stateName) => {
    // Use county+state name to generate consistent hash
    const hash = (countyName + stateName).split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const normalized = Math.abs(hash % 100);

    // Generate metrics based on hash
    const driveTime = 8 + (normalized % 25); // 8-32 minutes
    const ratio = 1000 + (normalized % 2000); // 1000-3000

    let status = 'ok';
    if (driveTime > 20 || ratio > 2000) status = 'critical';
    else if (driveTime > 15 || ratio > 1600) status = 'review';

    return { driveTime, ratio, status };
  };

  // Get color for county based on generated rating
  const getColorForCounty = (countyName, stateName) => {
    const rating = getCountyRating(countyName, stateName);

    if (mapFilter === 'driveTime') {
      if (rating.driveTime > 20) return 'rgba(244,63,94,0.7)';
      if (rating.driveTime > 15) return 'rgba(245,158,11,0.7)';
      return 'rgba(16,185,129,0.6)';
    }

    if (mapFilter === 'ratio') {
      if (rating.ratio > 2000) return 'rgba(244,63,94,0.7)';
      if (rating.ratio > 1600) return 'rgba(245,158,11,0.7)';
      return 'rgba(16,185,129,0.6)';
    }

    // Status colors
    if (rating.status === 'critical') return 'rgba(244,63,94,0.7)';
    if (rating.status === 'review') return 'rgba(245,158,11,0.7)';
    return 'rgba(16,185,129,0.6)';
  };

  // Get color for a specific state based on data and filter
  const getColorForState = (stateCode) => {
    const data = stateData[stateCode];
    if (!data) return 'rgba(71,85,105,0.2)';

    if (mapFilter === 'driveTime') {
      if (data.driveTime > 15) return 'rgba(244,63,94,0.6)';
      if (data.driveTime > 12) return 'rgba(245,158,11,0.6)';
      return 'rgba(16,185,129,0.5)';
    }

    if (mapFilter === 'ratio') {
      if (data.ratio > 1600) return 'rgba(244,63,94,0.6)';
      if (data.ratio > 1300) return 'rgba(245,158,11,0.6)';
      return 'rgba(16,185,129,0.5)';
    }

    // Convert hex to rgba for status colors
    if (data.status === 'critical') return 'rgba(244,63,94,0.6)';
    if (data.status === 'review') return 'rgba(245,158,11,0.6)';
    return 'rgba(16,185,129,0.5)';
  };

  // Build Mapbox expression for fill colors
  const buildFillColorExpression = () => {
    const cases = [];
    Object.keys(stateData).forEach(stateCode => {
      // Match by state name from GeoJSON
      const stateName = stateData[stateCode].name;
      cases.push(['==', ['get', 'name'], stateName]);
      cases.push(getColorForState(stateCode));
    });
    return ['case', ...cases, 'rgba(71,85,105,0.2)'];
  };

  // Mapbox layer configuration for state fills using custom GeoJSON
  const dataLayer = {
    id: 'state-fills',
    type: 'fill',
    paint: {
      'fill-color': buildFillColorExpression(),
      'fill-opacity': 0.8,
    },
  };

  const outlineLayer = {
    id: 'state-borders',
    type: 'line',
    paint: {
      'line-color': '#334155',
      'line-width': 1,
    },
  };

  const hoverLayer = {
    id: 'state-hover',
    type: 'line',
    filter: ['==', ['get', 'name'], hoveredState && !selectedState ? stateData[hoveredState]?.name : ''],
    paint: {
      'line-color': '#ffffff',
      'line-width': 2,
      'line-opacity': 0.8,
    },
  };

  const highlightLayer = {
    id: 'state-highlighted',
    type: 'line',
    filter: ['==', ['get', 'name'], selectedState ? stateData[selectedState]?.name : ''],
    paint: {
      'line-color': '#14b8a6',
      'line-width': 3,
    },
  };

  // Build fill color expression for counties using GeoJSON
  const buildCountyFillColorExpression = () => {
    // We'll generate colors based on county properties when we have the data
    // For now, use a hash-based approach with the county ID/name
    return [
      'case',
      ['has', 'NAME'],
      [
        'interpolate',
        ['linear'],
        ['%', ['length', ['get', 'NAME']], 10],
        0, 'rgba(16,185,129,0.6)',
        3, 'rgba(245,158,11,0.6)',
        7, 'rgba(244,63,94,0.6)',
        10, 'rgba(16,185,129,0.6)'
      ],
      'rgba(71,85,105,0.2)' // default
    ];
  };

  // County layers - only shown in county view
  const countyLayer = {
    id: 'county-fills',
    type: 'fill',
    paint: {
      'fill-color': buildCountyFillColorExpression(),
      'fill-opacity': 0.7,
    },
  };

  const countyBorderLayer = {
    id: 'county-borders',
    type: 'line',
    paint: {
      'line-color': '#334155',
      'line-width': 0.5,
    },
  };

  const countyHoverLayer = {
    id: 'county-hover',
    type: 'line',
    filter: ['==', ['id'], hoveredState || ''],
    paint: {
      'line-color': '#ffffff',
      'line-width': 2,
      'line-opacity': 0.8,
    },
  };

  const onMapClick = async (event) => {
    // If in drive time mode, set location and fetch isochrones
    if (isDriveTimeMode) {
      const { lngLat } = event;
      setSelectedLocation({ lng: lngLat.lng, lat: lngLat.lat });
      setIsLoadingIsochrone(true);

      try {
        const isochroneData = await getIsochrone(
          { lng: lngLat.lng, lat: lngLat.lat },
          [15, 30, 45] // 15, 30, 45 minute drive times
        );
        setIsochrones(isochroneData);
      } catch (error) {
        console.error('Error fetching isochrone:', error);
      } finally {
        setIsLoadingIsochrone(false);
      }
      return;
    }

    // Handle cluster clicks - zoom in
    const features = event.features;
    if (features && features.length > 0) {
      const feature = features[0];

      // If clicking on a beneficiary (individual, not cluster), show 15-min drive time range
      if (mapDisplayMode === 'directory' && feature.layer?.id === 'beneficiaries-unclustered') {
        const { lngLat } = event;
        const beneficiaryId = feature.properties.id;

        setSelectedLocation({ lng: lngLat.lng, lat: lngLat.lat });
        setSelectedBeneficiaryId(beneficiaryId);
        setSelectedProviderId(null); // Clear provider selection
        setHighlightedProviders(new Set()); // Clear while loading
        setIsLoadingIsochrone(true);

        try {
          // Show only 15-minute isochrone (adequacy target)
          const isochroneData = await getIsochrone(
            { lng: lngLat.lng, lat: lngLat.lat },
            [15] // 15 minute drive time per adequacy rules
          );
          setIsochrones(isochroneData);

          // Use simple geographic filtering: providers within ~15 miles (~0.22 degrees)
          // This is a rough approximation but avoids hitting API rate limits
          const maxDistance = 0.22; // Approximately 15 miles at mid-latitudes
          const providersInRange = new Set(
            providers
              .filter(p => {
                const latDiff = Math.abs(p.lat - lngLat.lat);
                const lngDiff = Math.abs(p.lng - lngLat.lng);
                const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
                return distance <= maxDistance;
              })
              .map(p => p.id)
          );

          console.log(`Found ${providersInRange.size} providers within ~15 mile radius`);
          setHighlightedProviders(providersInRange);
        } catch (error) {
          console.error('Error fetching isochrone:', error);
        } finally {
          setIsLoadingIsochrone(false);
        }
        return;
      }

      // If clicking on a provider, calculate beneficiaries within 15 minutes
      if (mapDisplayMode === 'directory' && feature.layer?.id === 'providers-circle') {
        const { lngLat } = event;
        const providerId = feature.properties.id;

        setSelectedLocation({ lng: lngLat.lng, lat: lngLat.lat });
        setSelectedProviderId(providerId);
        setSelectedBeneficiaryId(null); // Clear beneficiary selection
        setHighlightedBeneficiaries(new Set()); // Clear while loading
        setHighlightedProviders(new Set()); // Clear provider highlights
        setIsLoadingIsochrone(true);

        try {
          // Show only 15-minute isochrone (adequacy target)
          const isochroneData = await getIsochrone(
            { lng: lngLat.lng, lat: lngLat.lat },
            [15] // 15 minute drive time per adequacy rules
          );
          setIsochrones(isochroneData);

          // Use simple geographic filtering: beneficiaries within ~15 miles (~0.22 degrees)
          // This is a rough approximation but avoids hitting API rate limits
          const maxDistance = 0.22; // Approximately 15 miles at mid-latitudes
          const beneficiariesInRange = new Set(
            visibleBeneficiaries
              .filter(b => {
                const latDiff = Math.abs(b.lat - lngLat.lat);
                const lngDiff = Math.abs(b.lng - lngLat.lng);
                const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
                return distance <= maxDistance;
              })
              .map(b => b.id)
          );

          console.log(`Found ${beneficiariesInRange.size} beneficiaries within ~15 mile radius`);
          setHighlightedBeneficiaries(beneficiariesInRange);
        } catch (error) {
          console.error('Error fetching isochrone:', error);
        } finally {
          setIsLoadingIsochrone(false);
        }
        return;
      }

      // If clicking on a beneficiary cluster, zoom in
      if (mapDisplayMode === 'directory' && feature.layer?.id === 'beneficiaries-clusters') {
        const clusterId = feature.properties.cluster_id;
        const map = mapRef.current.getMap();
        const source = map.getSource('beneficiaries');

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          map.easeTo({
            center: feature.geometry.coordinates,
            zoom: zoom
          });
        });
        return;
      }

      // If clicking on a provider cluster, zoom in
      if (mapDisplayMode === 'directory' && feature.layer?.id === 'providers-clusters') {
        const clusterId = feature.properties.cluster_id;
        const map = mapRef.current.getMap();
        const source = map.getSource('providers');

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          map.easeTo({
            center: feature.geometry.coordinates,
            zoom: zoom
          });
        });
        return;
      }

      // Normal mode - select state/county
      const props = feature.properties;
      const stateName = props.name;

      // Convert state name to code using our mapping
      const stateCode = stateNameToCode[stateName];

      if (stateCode && stateData[stateCode]) {
        setSelectedState(selectedState === stateCode ? null : stateCode);
      }
    } else {
      // Clicked on empty space - clear isochrone in directory mode
      if (mapDisplayMode === 'directory') {
        setSelectedLocation(null);
        setIsochrones(null);
        setHighlightedProviders(new Set());
        setHighlightedBeneficiaries(new Set());
        setSelectedBeneficiaryId(null);
        setSelectedProviderId(null);
      }
    }
  };

  const onMapContextMenu = (event) => {
    // Only handle right-click in directory mode
    if (mapDisplayMode !== 'directory') return;

    // Prevent default context menu
    event.preventDefault();

    // Query features at the click point
    const map = mapRef.current?.getMap();
    if (!map) return;

    const features = map.queryRenderedFeatures(event.point, {
      layers: ['providers-circle']
    });

    if (features && features.length > 0) {
      const feature = features[0];
      const provider = {
        id: feature.properties.id,
        name: feature.properties.name,
        specialty: feature.properties.specialty,
        address: feature.properties.address,
        isRemoved: removedProviders.has(feature.properties.id)
      };

      // Show context menu at mouse position
      setContextMenu({
        x: event.originalEvent.clientX,
        y: event.originalEvent.clientY,
        provider
      });
    }
  };

  // Handle context menu actions
  const handleRemoveProvider = () => {
    if (!contextMenu) return;
    const newRemovedProviders = new Set(removedProviders);
    newRemovedProviders.add(contextMenu.provider.id);
    setRemovedProviders(newRemovedProviders);
    setContextMenu(null);
  };

  const handleRestoreProvider = () => {
    if (!contextMenu) return;
    const newRemovedProviders = new Set(removedProviders);
    newRemovedProviders.delete(contextMenu.provider.id);
    setRemovedProviders(newRemovedProviders);
    setContextMenu(null);
  };

  const onMapHover = (event) => {
    // Skip hover in drive time mode
    if (isDriveTimeMode) {
      setHoveredState(null);
      setHoveredCounty(null);
      setHoveredProvider(null);
      setHoveredBeneficiary(null);
      return;
    }

    const features = event.features;
    if (features && features.length > 0) {
      const feature = features[0];
      const props = feature.properties;

      // Handle provider clusters
      if (mapDisplayMode === 'directory' && feature.layer?.id === 'providers-clusters') {
        setHoveredProvider({
          isCluster: true,
          count: props.point_count,
          count_abbreviated: props.point_count_abbreviated
        });
        setHoveredState(null);
        setHoveredCounty(null);
        setHoveredBeneficiary(null);
        return;
      }

      // Handle individual providers
      if (mapDisplayMode === 'directory' && feature.layer?.id === 'providers-circle') {
        setHoveredProvider({
          isCluster: false,
          ...props
        });
        setHoveredState(null);
        setHoveredCounty(null);
        setHoveredBeneficiary(null);
        return;
      }

      // Handle beneficiaries - clusters
      if (mapDisplayMode === 'directory' && feature.layer?.id === 'beneficiaries-clusters') {
        setHoveredBeneficiary({
          isCluster: true,
          count: props.point_count,
          count_abbreviated: props.point_count_abbreviated
        });
        setHoveredState(null);
        setHoveredCounty(null);
        setHoveredProvider(null);
        return;
      }

      // Handle beneficiaries - individual points
      if (mapDisplayMode === 'directory' && feature.layer?.id === 'beneficiaries-unclustered') {
        setHoveredBeneficiary({
          isCluster: false,
          ...props
        });
        setHoveredState(null);
        setHoveredCounty(null);
        setHoveredProvider(null);
        return;
      }

      // Handle counties
      if (viewMode === 'county' && mapDisplayMode === 'adequacy') {
        const countyId = feature.id || props.GEO_ID;
        const countyName = props.NAME || 'Unknown County';
        const stateName = props.STATE || 'Unknown';

        setHoveredState(countyId);

        const rating = getCountyRating(countyName, stateName);
        setHoveredCounty({
          name: countyName,
          state: stateName,
          ...rating
        });
        setHoveredProvider(null);
        setHoveredBeneficiary(null);
      } else if (viewMode === 'state' && mapDisplayMode === 'adequacy') {
        // Handle states
        const stateName = props.name;
        const stateCode = stateNameToCode[stateName];

        if (stateCode && stateData[stateCode]) {
          setHoveredState(stateCode);
        } else {
          setHoveredState(null);
        }
        setHoveredCounty(null);
        setHoveredProvider(null);
        setHoveredBeneficiary(null);
      }
    } else {
      setHoveredState(null);
      setHoveredCounty(null);
      setHoveredProvider(null);
      setHoveredBeneficiary(null);
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex-1 flex flex-col shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            {isSimulationMode && (
              <span className="px-2 py-1 bg-amber-500/20 text-amber-600 text-xs rounded-full border border-amber-500/40 flex items-center gap-1 mb-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                What-If Simulation
              </span>
            )}
            <p className="text-xs text-slate-600">
              {isDriveTimeMode
                ? 'Click anywhere on the map to see 15, 30, and 45-minute driving areas'
                : mapDisplayMode === 'directory'
                  ? selectedBeneficiaryId
                    ? `Showing ${highlightedProviders.size} providers within 15-min of selected beneficiary`
                    : selectedProviderId
                      ? `Showing ${highlightedBeneficiaries.size} beneficiaries within 15-min of selected provider`
                      : `${(providers.length - removedProviders.size).toLocaleString()} providers & ${visibleBeneficiaries.length.toLocaleString()} beneficiaries • Right-click provider to remove`
                  : selectedState && stateData[selectedState]
                    ? `${stateData[selectedState].name} selected`
                    : viewMode === 'county'
                      ? 'County-level view • Click county for details'
                      : 'Click state to view details • Scroll to zoom'
              }
              {removedProviders.size > 0 && mapDisplayMode === 'directory' && ` • ${removedProviders.size.toLocaleString()} providers removed`}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Clear all selections without zooming
                    setSelectedState(null);
                    setSelectedLocation(null);
                    setIsochrones(null);
                    setHighlightedProviders(new Set());
                    setHighlightedBeneficiaries(new Set());
                    setSelectedBeneficiaryId(null);
                    setSelectedProviderId(null);
                    setIsDriveTimeMode(false);
                  }}
                  className="px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200"
                  title="Clear all selections"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
                <button
                  onClick={() => {
                    setIsDriveTimeMode(!isDriveTimeMode);
                    if (!isDriveTimeMode) {
                      // Entering drive time mode - clear selections
                      setSelectedState(null);
                      setSelectedLocation(null);
                      setIsochrones(null);
                    } else {
                      // Exiting drive time mode - clear drive time data
                      setSelectedLocation(null);
                      setIsochrones(null);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isDriveTimeMode
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {isDriveTimeMode ? 'Exit Drive Time' : 'Drive Time'}
                </button>
                {!isDriveTimeMode && (
                  <div className="flex bg-slate-100 border border-slate-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setMapDisplayMode('adequacy')}
                      className={`px-3 py-1.5 text-xs transition-colors whitespace-nowrap ${mapDisplayMode === 'adequacy' ? 'bg-teal-600 text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'}`}
                    >
                      Adequacy
                    </button>
                    <button
                      onClick={() => setMapDisplayMode('directory')}
                      className={`px-3 py-1.5 text-xs transition-colors whitespace-nowrap ${mapDisplayMode === 'directory' ? 'bg-teal-600 text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'}`}
                    >
                      Directory
                    </button>
                  </div>
                )}
              </div>
              {!isDriveTimeMode && mapDisplayMode === 'adequacy' && (
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 border border-slate-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('state')}
                      className={`px-3 py-1.5 text-xs transition-colors whitespace-nowrap ${viewMode === 'state' ? 'bg-cyan-600 text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'}`}
                    >
                      States
                    </button>
                    <button
                      onClick={() => setViewMode('county')}
                      className={`px-3 py-1.5 text-xs transition-colors whitespace-nowrap ${viewMode === 'county' ? 'bg-cyan-600 text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'}`}
                    >
                      Counties
                    </button>
                  </div>
                  <select value={mapFilter} onChange={(e) => setMapFilter(e.target.value)} className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900">
                    <option value="all">All Metrics</option>
                    <option value="driveTime">Drive Time</option>
                    <option value="ratio">Provider Ratio</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        {!isDriveTimeMode ? (
          <div className="flex items-center gap-4 mb-3 text-xs text-slate-600">
            <span>Legend:</span>
            {mapDisplayMode === 'directory' ? (
              <>
                {selectedBeneficiaryId ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>Selected Beneficiary
                    </span>
                    <span className="text-slate-400 mx-2">|</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-yellow-400"></span>Providers in 15-min range
                    </span>
                    <span className="text-slate-500">• Click map to clear selection</span>
                  </>
                ) : selectedProviderId ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>Selected Provider
                    </span>
                    <span className="text-slate-400 mx-2">|</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-yellow-400"></span>Beneficiaries in 15-min range
                    </span>
                    <span className="text-slate-500">• Click map to clear selection</span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>Provider
                    </span>
                    <span className="text-slate-400 mx-2">|</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>Beneficiary
                    </span>
                    {removedProviders.size > 0 && (
                      <>
                        <span className="text-slate-400 mx-2">|</span>
                        <span className="flex items-center gap-1.5 text-rose-400">
                          <span className="w-3 h-3 rounded-full bg-rose-500"></span>{removedProviders.size} Removed
                        </span>
                      </>
                    )}
                    <span className="text-slate-500">• Click to filter • Right-click provider to remove</span>
                  </>
                )}
              </>
            ) : mapFilter === 'driveTime' ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500/50"></span>≤12 min
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500/50"></span>13-15 min
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500/50"></span>&gt;15 min
                </span>
              </>
            ) : mapFilter === 'ratio' ? (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500/50"></span>≤1300:1
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500/50"></span>1301-1600:1
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500/50"></span>&gt;1600:1
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500/50"></span>Healthy
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500/50"></span>Review
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500/50"></span>Critical
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4 mb-3 text-xs text-slate-400">
            <span>Drive Time Zones:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/50"></span>15 min
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500/50"></span>30 min
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500/50"></span>45 min
            </span>
            {isLoadingIsochrone && (
              <span className="flex items-center gap-1.5 text-purple-400">
                <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mapDisplayMode === 'directory' ? 'Calculating drive times & highlighting providers...' : 'Calculating...'}
              </span>
            )}
          </div>
        )}

        <div className="relative rounded-xl overflow-hidden flex-1 border border-slate-200">
          <ReactMapGL
            key={viewMode}
            ref={mapRef}
            {...viewState}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            interactiveLayerIds={
              mapDisplayMode === 'directory' ? ['providers-circle', 'providers-clusters', 'beneficiaries-clusters', 'beneficiaries-unclustered'] :
              viewMode === 'state' ? ['state-fills'] : ['county-fills']
            }
            onClick={onMapClick}
            onContextMenu={onMapContextMenu}
            onMouseMove={onMapHover}
            style={{ width: '100%', height: '100%' }}
            cursor={isDriveTimeMode ? 'crosshair' : 'pointer'}
          >
            {/* Isochrone layers for drive time analysis */}
            {isochrones && (
              <Source id="isochrones" type="geojson" data={isochrones}>
                {/* Show all contours in drive time mode, only 15-min in beneficiary mode */}
                {isDriveTimeMode && (
                  <>
                    <Layer
                      id="isochrone-45"
                      type="fill"
                      filter={['==', ['get', 'contour'], 45]}
                      paint={{
                        'fill-color': '#f43f5e',
                        'fill-opacity': 0.2,
                      }}
                    />
                    <Layer
                      id="isochrone-30"
                      type="fill"
                      filter={['==', ['get', 'contour'], 30]}
                      paint={{
                        'fill-color': '#f59e0b',
                        'fill-opacity': 0.25,
                      }}
                    />
                  </>
                )}
                <Layer
                  id="isochrone-15"
                  type="fill"
                  filter={['==', ['get', 'contour'], 15]}
                  paint={{
                    'fill-color': '#10b981',
                    'fill-opacity': 0.3,
                  }}
                />
                <Layer
                  id="isochrone-outline"
                  type="line"
                  paint={{
                    'line-color': '#ffffff',
                    'line-width': 2,
                    'line-opacity': 0.5,
                  }}
                />
              </Source>
            )}

            {/* Marker for selected location */}
            {selectedLocation && (
              <Marker
                longitude={selectedLocation.lng}
                latitude={selectedLocation.lat}
                anchor="bottom"
              >
                <div className="relative">
                  <div className={`absolute -top-10 -left-5 w-10 h-10 ${isDriveTimeMode ? 'bg-purple-500' : 'bg-blue-500'} rounded-full flex items-center justify-center shadow-lg ${isDriveTimeMode ? 'animate-bounce' : ''}`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  {isDriveTimeMode && (
                    <div className="absolute top-2 w-3 h-3 bg-purple-500 rounded-full opacity-20 animate-ping"></div>
                  )}
                </div>
              </Marker>
            )}

            {/* Adequacy view - states and counties */}
            {mapDisplayMode === 'adequacy' && !isDriveTimeMode && (
              <>
                {viewMode === 'state' ? (
                  <Source
                    id="us-states"
                    type="geojson"
                    data="https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
                  >
                    <Layer {...dataLayer} />
                    <Layer {...outlineLayer} />
                    <Layer {...hoverLayer} />
                    <Layer {...highlightLayer} />
                  </Source>
                ) : (
                  <Source
                    id="counties"
                    type="geojson"
                    data="https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json"
                  >
                    <Layer {...countyLayer} />
                    <Layer {...countyBorderLayer} />
                    <Layer {...countyHoverLayer} />
                  </Source>
                )}
              </>
            )}

            {/* Beneficiaries view with clustering - render first so they appear below providers */}
            {mapDisplayMode === 'directory' && !isDriveTimeMode && (
              <Source
                id="beneficiaries"
                type="geojson"
                data={beneficiariesGeoJSON}
                cluster={!selectedBeneficiaryId && !selectedProviderId} // Disable clustering when selection is active
                clusterMaxZoom={14}
                clusterRadius={50}
              >
                {/* Clustered circles - hide when beneficiary or provider is selected */}
                <Layer
                  id="beneficiaries-clusters"
                  type="circle"
                  filter={
                    selectedBeneficiaryId || selectedProviderId
                      ? ['==', ['get', 'point_count'], 0] // Never show clusters when a selection is active (always false)
                      : ['has', 'point_count']
                  }
                  paint={{
                    'circle-color': '#3b82f6', // All beneficiary clusters same blue color
                    'circle-radius': [
                      'step',
                      ['get', 'point_count'],
                      15,   // Small clusters
                      100,
                      20,   // Medium clusters
                      500,
                      25,   // Large clusters
                      1000,
                      30    // Very large clusters
                    ],
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-opacity': 0.6
                  }}
                />

                {/* Cluster count labels - hide when beneficiary or provider is selected */}
                <Layer
                  id="beneficiaries-cluster-count"
                  type="symbol"
                  filter={
                    selectedBeneficiaryId || selectedProviderId
                      ? ['==', ['get', 'point_count'], 0] // Never show cluster labels when a selection is active (always false)
                      : ['has', 'point_count']
                  }
                  layout={{
                    'text-field': [
                      'concat',
                      ['get', 'point_count_abbreviated'],
                      ''
                    ],
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                  }}
                  paint={{
                    'text-color': '#ffffff'
                  }}
                />

                {/* Individual unclustered points */}
                <Layer
                  id="beneficiaries-unclustered"
                  type="circle"
                  filter={['!', ['has', 'point_count']]} // Just show unclustered points, filtering done at source
                  paint={{
                    'circle-radius': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      10, 4,
                      15, 6,
                      20, 8
                    ],
                    'circle-color': '#3b82f6', // All beneficiaries same color
                    'circle-opacity': 0.7,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-opacity': 0.4
                  }}
                />
              </Source>
            )}

            {/* Providers view with clustering - render after beneficiaries so they appear on top */}
            {mapDisplayMode === 'directory' && !isDriveTimeMode && (
              <Source
                id="providers"
                type="geojson"
                data={providersGeoJSON}
                cluster={!selectedBeneficiaryId && !selectedProviderId} // Disable clustering when selection is active
                clusterMaxZoom={14}
                clusterRadius={50}
              >
                {/* Provider clusters */}
                <Layer
                  id="providers-clusters"
                  type="circle"
                  filter={
                    selectedBeneficiaryId || selectedProviderId
                      ? ['==', ['get', 'point_count'], 0] // Never show clusters when a selection is active (always false)
                      : ['has', 'point_count']
                  }
                  paint={{
                    'circle-color': '#10b981', // Emerald green for provider clusters
                    'circle-radius': [
                      'step',
                      ['get', 'point_count'],
                      15,   // Small clusters
                      100,
                      20,   // Medium clusters
                      500,
                      25,   // Large clusters
                      1000,
                      30    // Very large clusters
                    ],
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-opacity': 0.6
                  }}
                />

                {/* Cluster count labels */}
                <Layer
                  id="providers-cluster-count"
                  type="symbol"
                  filter={
                    selectedBeneficiaryId || selectedProviderId
                      ? ['==', ['get', 'point_count'], 0] // Never show cluster labels when a selection is active (always false)
                      : ['has', 'point_count']
                  }
                  layout={{
                    'text-field': [
                      'concat',
                      ['get', 'point_count_abbreviated'],
                      ''
                    ],
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                  }}
                  paint={{
                    'text-color': '#ffffff'
                  }}
                />

                {/* Individual unclustered provider points */}
                <Layer
                  id="providers-circle"
                  type="circle"
                  filter={['!', ['has', 'point_count']]} // Just show unclustered points, filtering done at source
                  paint={{
                    'circle-radius': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      10, 4,
                      15, 6,
                      20, 8
                    ],
                    'circle-color': '#10b981', // Emerald green
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-opacity': 0.4
                  }}
                />
              </Source>
            )}
          </ReactMapGL>

          {/* Hover tooltip for states */}
          {hoveredState && stateData[hoveredState] && !selectedState && viewMode === 'state' && (
            <div className="absolute top-4 left-4 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-xl p-3 shadow-2xl pointer-events-none z-10">
              <p className="font-semibold text-white mb-2">{stateData[hoveredState].name}</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Drive Time:</span>
                  <span className={stateData[hoveredState].driveTime > 15 ? 'text-rose-400 font-medium' : stateData[hoveredState].driveTime > 12 ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
                    {stateData[hoveredState].driveTime} min
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Ratio:</span>
                  <span className={stateData[hoveredState].ratio > 1600 ? 'text-rose-400 font-medium' : stateData[hoveredState].ratio > 1300 ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
                    1:{stateData[hoveredState].ratio}
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Providers:</span>
                  <span className="text-white font-medium">{stateData[hoveredState].providers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Score:</span>
                  <span className="text-cyan-400 font-medium">{stateData[hoveredState].score}/100</span>
                </div>
              </div>
              <p className="text-teal-400 text-xs mt-2 pt-2 border-t border-slate-700/50">Click for details →</p>
            </div>
          )}

          {/* Hover tooltip for counties */}
          {hoveredCounty && viewMode === 'county' && !selectedState && mapDisplayMode === 'adequacy' && (
            <div className="absolute top-4 left-4 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-xl p-3 shadow-2xl pointer-events-none z-10">
              <p className="font-semibold text-white mb-2">{hoveredCounty.name}</p>
              <p className="text-xs text-slate-400 mb-2">{hoveredCounty.state}</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Drive Time:</span>
                  <span className={hoveredCounty.driveTime > 20 ? 'text-rose-400 font-medium' : hoveredCounty.driveTime > 15 ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
                    {hoveredCounty.driveTime} min
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Ratio:</span>
                  <span className={hoveredCounty.ratio > 2000 ? 'text-rose-400 font-medium' : hoveredCounty.ratio > 1600 ? 'text-amber-400 font-medium' : 'text-emerald-400 font-medium'}>
                    1:{hoveredCounty.ratio}
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full ${hoveredCounty.status === 'ok' ? 'bg-emerald-500/20 text-emerald-400' : hoveredCounty.status === 'review' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {hoveredCounty.status === 'ok' ? '✓ Healthy' : hoveredCounty.status === 'review' ? '! Review' : '✗ Critical'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Hover tooltip for providers */}
          {hoveredProvider && mapDisplayMode === 'directory' && (
            <div className="absolute top-4 left-4 bg-slate-800/95 backdrop-blur-lg border border-emerald-500/30 rounded-xl p-3 shadow-2xl pointer-events-none z-10 max-w-xs">
              {hoveredProvider.isCluster ? (
                // Provider cluster tooltip
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <p className="font-semibold text-white">Provider Cluster</p>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Providers:</span>
                      <span className="text-white font-bold text-base">{hoveredProvider.count?.toLocaleString()}</span>
                    </div>
                    <p className="text-emerald-400 text-xs mt-2 pt-2 border-t border-slate-700/50">Click to zoom in →</p>
                  </div>
                </div>
              ) : (
                // Individual provider tooltip
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 bg-emerald-400"></div>
                    <div>
                      <p className="font-semibold text-white">{hoveredProvider.name}</p>
                      <p className="text-xs text-slate-400">{hoveredProvider.specialty}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs border-t border-slate-700/50 pt-2">
                    <p className="text-slate-300">{hoveredProvider.address}</p>
                    {hoveredProvider.accepting === 'true' && (
                      <div className="mt-2">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-400">
                          Accepting Patients
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hover tooltip for beneficiaries */}
          {hoveredBeneficiary && mapDisplayMode === 'directory' && (
            <div className="absolute top-4 left-4 bg-slate-800/95 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-3 shadow-2xl pointer-events-none z-10">
              {hoveredBeneficiary.isCluster ? (
                // Cluster tooltip
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"></div>
                    <p className="font-semibold text-white">Beneficiary Cluster</p>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Beneficiaries:</span>
                      <span className="text-white font-bold text-base">{hoveredBeneficiary.count?.toLocaleString()}</span>
                    </div>
                    <p className="text-cyan-400 text-xs mt-2 pt-2 border-t border-slate-700/50">Click to zoom in →</p>
                  </div>
                </div>
              ) : (
                // Individual beneficiary tooltip
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 bg-blue-400"></div>
                    <div>
                      <p className="font-semibold text-white">{hoveredBeneficiary.name}</p>
                      <p className="text-xs text-slate-400">{hoveredBeneficiary.id}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs border-t border-slate-700/50 pt-2">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Age Group:</span>
                      <span className="text-white">{hoveredBeneficiary.ageGroup}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Plan:</span>
                      <span className="text-white">{hoveredBeneficiary.planType}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Selected state detail panel */}
          {selectedState && stateData[selectedState] && (
            <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-lg border border-teal-500/30 rounded-xl p-4 w-64 shadow-2xl z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-base">{stateData[selectedState].name}</h3>
                <button
                  onClick={() => setSelectedState(null)}
                  className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700/50 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <p className="text-xs text-slate-400 mb-1">Network Score</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-cyan-400">{stateData[selectedState].score}</p>
                    <p className="text-sm text-slate-400">/100</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <p className="text-xs text-slate-400 mb-1">Avg. Drive Time</p>
                  <p className={`text-xl font-bold ${stateData[selectedState].driveTime > 15 ? 'text-rose-400' : stateData[selectedState].driveTime > 12 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {stateData[selectedState].driveTime} min
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Target: ≤15 min</p>
                </div>

                <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <p className="text-xs text-slate-400 mb-1">Provider Ratio</p>
                  <p className={`text-xl font-bold ${stateData[selectedState].ratio > 1600 ? 'text-rose-400' : stateData[selectedState].ratio > 1300 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    1:{stateData[selectedState].ratio}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Target: ≤1:2000</p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                  <span className="text-xs text-slate-400">Total Providers</span>
                  <span className="text-sm text-white font-semibold">{stateData[selectedState].providers.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Status</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    stateData[selectedState].status === 'ok' ? 'bg-emerald-500/20 text-emerald-400' :
                    stateData[selectedState].status === 'review' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {stateData[selectedState].status === 'ok' ? '✓ Healthy' :
                     stateData[selectedState].status === 'review' ? '! Review' :
                     '✗ Critical'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />

          {/* Menu */}
          <div
            className="fixed z-50 bg-white border border-slate-300 rounded-lg shadow-xl min-w-[240px]"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
          >
            {/* Provider Info Header */}
            <div className="px-4 py-3 border-b border-slate-200">
              <div className="font-medium text-slate-900 text-sm">{contextMenu.provider.name}</div>
              <div className="text-xs text-slate-600 mt-0.5">{contextMenu.provider.specialty}</div>
              <div className="text-xs text-slate-500 mt-0.5">{contextMenu.provider.address}</div>
            </div>

            {/* Actions */}
            <div className="py-1">
              {contextMenu.provider.isRemoved ? (
                <button
                  onClick={handleRestoreProvider}
                  className="w-full px-4 py-2 text-left text-sm text-emerald-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Restore Provider
                </button>
              ) : (
                <button
                  onClick={handleRemoveProvider}
                  className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Remove from Consideration
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
