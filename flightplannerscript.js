// Aircraft Database
const aircraftDatabase = [
    {
        id: 1,
        name: "Cessna Citation X+",
        passengers: 12,
        range: 3460,
        baggage: 82,
        cabinHeight: 5.7,
        price: 22.5,
        fuelConsumption: 347,
        cruiseSpeed: 527,
        features: ["High-speed internet", "Entertainment system", "Full galley"],
        cabinLength: 25.3,
        cabinWidth: 5.5,
        image: "cessna-citation-x.jpg"
    },
    {
        id: 2,
        name: "Gulfstream G650",
        passengers: 18,
        range: 7000,
        baggage: 195,
        cabinHeight: 6.2,
        price: 65.0,
        fuelConsumption: 451,
        cruiseSpeed: 516,
        features: ["Satellite communications", "Full bed", "Conference area", "Premium materials"],
        cabinLength: 46.8,
        cabinWidth: 8.2,
        image: "gulfstream-g650.jpg"
    },
    {
        id: 3,
        name: "Bombardier Global 7500",
        passengers: 19,
        range: 7700,
        baggage: 195,
        cabinHeight: 6.2,
        price: 75.0,
        fuelConsumption: 453,
        cruiseSpeed: 488,
        features: ["Four living spaces", "Full kitchen", "Master suite", "Crew rest area"],
        cabinLength: 54.4,
        cabinWidth: 8.2,
        image: "bombardier-global-7500.jpg"
    },
    {
        id: 4,
        name: "Embraer Phenom 300E",
        passengers: 10,
        range: 2010,
        baggage: 84,
        cabinHeight: 4.9,
        price: 9.5,
        fuelConsumption: 230,
        cruiseSpeed: 464,
        features: ["Advanced avionics", "LED lighting", "Refreshment center"],
        cabinLength: 17.2,
        cabinWidth: 5.1,
        image: "embraer-phenom-300e.jpg"
    },
    {
        id: 5,
        name: "Dassault Falcon 7X",
        passengers: 16,
        range: 5950,
        baggage: 140,
        cabinHeight: 6.2,
        price: 54.0,
        fuelConsumption: 372,
        cruiseSpeed: 488,
        features: ["Three-engine design", "Fly-by-wire controls", "Large cabin", "Advanced weather radar"],
        cabinLength: 39.1,
        cabinWidth: 7.7,
        image: "dassault-falcon-7x.jpg"
    },
    {
        id: 6,
        name: "Boeing BBJ 737",
        passengers: 50,
        range: 6200,
        baggage: 300,
        cabinHeight: 7.1,
        price: 85.0,
        fuelConsumption: 850,
        cruiseSpeed: 453,
        features: ["Multiple cabin zones", "Full office suite", "Private bedroom", "Shower facilities"],
        cabinLength: 79.2,
        cabinWidth: 11.7,
        image: "boeing-bbj-737.jpg"
    }
];

// Flight Planning Variables
let map;
let departureMarker = null;
let destinationMarker = null;
let flightPath = null;
let airportMarkers = [];
let windLayer = null;
let refuelMarkers = [];

function initMap() {
    map = L.map('map').setView([40.0, -95.0], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    // Initialize UI elements
    document.getElementById('passenger-count').addEventListener('input', function() {
        document.getElementById('passenger-value').textContent = this.value;
    });

    document.getElementById('range-filter').addEventListener('input', function() {
        document.getElementById('range-value').textContent = this.value;
    });

    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('show-winds').addEventListener('change', toggleWindPatterns);
    document.getElementById('show-airports').addEventListener('change', toggleAirports);

    // Add initial elements
    addAirports();
    addWindPatterns();
    displayAircraft(aircraftDatabase);
    
    // Set up map click handler
    map.on('click', onMapClick);
}

function onMapClick(e) {
    if (!departureMarker) {
        departureMarker = createDraggableMarker(e.latlng, '#4CAF50', 'Departure');
        departureMarker.on('drag', calculateRoute);
    } else if (!destinationMarker) {
        destinationMarker = createDraggableMarker(e.latlng, '#f44336', 'Destination');
        destinationMarker.on('drag', calculateRoute);
        calculateRoute();
    } else {
        clearRoute();
        onMapClick(e);
    }
}

function createDraggableMarker(latlng, color, label) {
    return L.marker(latlng, {
        draggable: true,
        icon: L.divIcon({
            className: `${label.toLowerCase()}-icon`,
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [24, 24]
        })
    }).addTo(map).bindPopup(label).openPopup();
}

function calculateRoute() {
    if (!departureMarker || !destinationMarker) return;

    const dep = departureMarker.getLatLng();
    const dest = destinationMarker.getLatLng();
    const totalDistance = calculateDistance(dep.lat, dep.lng, dest.lat, dest.lng);

    // Clear existing refuel markers
    refuelMarkers.forEach(m => map.removeLayer(m));
    refuelMarkers = [];

    const stops = [];
    if (totalDistance > 4000) { // Using fixed range for simplicity
        const numStops = Math.ceil(totalDistance / 4000) - 1;
        for (let i = 1; i <= numStops; i++) {
            const lat = dep.lat + ((dest.lat - dep.lat) * i) / (numStops + 1);
            const lng = dep.lng + ((dest.lng - dep.lng) * i) / (numStops + 1);
            const stop = L.latLng(lat, lng);
            stops.push(stop);

            const refuelMarker = L.marker(stop, {
                icon: L.divIcon({
                    className: 'refuel-icon',
                    html: '<div style="background-color: #00BCD4; width: 16px; height: 16px; border-radius: 4px; border: 2px solid white;"></div>',
                    iconSize: [20, 20]
                })
            }).addTo(map).bindPopup("Refuel Stop");
            refuelMarkers.push(refuelMarker);
        }
    }

    const route = [dep, ...stops, dest];

    if (flightPath) map.removeLayer(flightPath);
    flightPath = L.polyline(route, { color: '#2196F3', weight: 4, dashArray: '8, 4' }).addTo(map);

    updateFlightInfo(totalDistance, stops.length);
    filterAircraftByRange(totalDistance);
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3440; // Earth's radius in nautical miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function updateFlightInfo(distance, numStops) {
    document.getElementById('flight-info').innerHTML = `
        <div class="info-grid">
            <div class="info-item">
                <div class="info-value">${Math.round(distance)}</div>
                <div class="info-label">Nautical Miles</div>
            </div>
            <div class="info-item">
                <div class="info-value">${numStops}</div>
                <div class="info-label">Refuel Stops</div>
            </div>
        </div>
    `;
}

function clearRoute() {
    if (departureMarker) map.removeLayer(departureMarker);
    if (destinationMarker) map.removeLayer(destinationMarker);
    if (flightPath) map.removeLayer(flightPath);
    refuelMarkers.forEach(m => map.removeLayer(m));
    departureMarker = null;
    destinationMarker = null;
    flightPath = null;
    refuelMarkers = [];
    document.getElementById('flight-info').innerHTML = '<p>Click two points on the map to plan your route</p>';
}

function addAirports() {
    // Sample airports
    const airports = [
        { name: "JFK International", lat: 40.6413, lng: -73.7781 },
        { name: "LAX International", lat: 33.9416, lng: -118.4085 },
        { name: "O'Hare International", lat: 41.9742, lng: -87.9073 },
        { name: "Heathrow Airport", lat: 51.4700, lng: -0.4543 },
        { name: "Charles de Gaulle", lat: 49.0097, lng: 2.5479 }
    ];

    airportMarkers = airports.map(airport => {
        return L.marker([airport.lat, airport.lng], {
            icon: L.divIcon({
                className: 'airport-icon',
                html: '<div style="background-color: #FFC107; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
                iconSize: [16, 16]
            })
        }).addTo(map).bindPopup(airport.name);
    });
}

function addWindPatterns() {
    // Create a wind layer group
    windLayer = L.layerGroup().addTo(map);
    
    // Add some sample wind arrows
    for (let i = 0; i < 20; i++) {
        const lat = 30 + Math.random() * 20;
        const lng = -120 + Math.random() * 60;
        const arrow = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'wind-arrow',
                html: '<div style="color: #9C27B0; font-size: 20px;">→</div>',
                iconSize: [20, 20]
            }),
            rotationAngle: Math.random() * 360
        }).addTo(windLayer);
    }
}

function toggleWindPatterns() {
    if (document.getElementById('show-winds').checked) {
        if (windLayer) map.addLayer(windLayer);
    } else {
        if (windLayer) map.removeLayer(windLayer);
    }
}

function toggleAirports() {
    if (document.getElementById('show-airports').checked) {
        airportMarkers.forEach(marker => marker.addTo(map));
    } else {
        airportMarkers.forEach(marker => map.removeLayer(marker));
    }
}

function displayAircraft(aircraft) {
    const aircraftList = document.getElementById('aircraft-list');
    aircraftList.innerHTML = '';
    
    aircraft.forEach(ac => {
        const aircraftCard = document.createElement('div');
        aircraftCard.className = 'aircraft-card';
        aircraftCard.innerHTML = `
            <h4>${ac.name}</h4>
            <div class="aircraft-specs">
                <div><span>Passengers:</span> ${ac.passengers}</div>
                <div><span>Range:</span> ${ac.range} nm</div>
                <div><span>Speed:</span> ${ac.cruiseSpeed} kts</div>
            </div>
            <button class="btn inquire-btn" data-aircraft="${ac.name}">Inquire</button>
        `;
        aircraftList.appendChild(aircraftCard);
    });

    // Add event listeners to all inquire buttons
    document.querySelectorAll('.inquire-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const aircraftName = this.getAttribute('data-aircraft');
            inquireAboutAircraft(aircraftName);
        });
    });
}

function inquireAboutAircraft(aircraftName) {
    window.location.href = `contact.html?aircraft=${encodeURIComponent(aircraftName)}`;
}

function applyFilters() {
    const passengerCount = parseInt(document.getElementById('passenger-count').value);
    const rangeFilter = parseInt(document.getElementById('range-filter').value);
    
    const filteredAircraft = aircraftDatabase.filter(ac => {
        return ac.passengers >= passengerCount && ac.range >= rangeFilter;
    });
    
    displayAircraft(filteredAircraft);
}

function filterAircraftByRange(distance) {
    const filteredAircraft = aircraftDatabase.filter(ac => ac.range >= distance);
    displayAircraft(filteredAircraft);
}

document.addEventListener('DOMContentLoaded', initMap);