// Initialize scene, camera, and renderer for the solar system simulation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add OrbitControls for user navigation (pan, zoom, rotate)
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(30, 30, 40); // Initial camera position
controls.update();

// Add lighting to illuminate planets, moons, and rings
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft ambient light with adjusted intensity
scene.add(ambientLight);
const sunLight = new THREE.PointLight(0xffff99, 1.5, 1000); // Increased intensity for better ring illumination
sunLight.position.set(0, 0, 0); // Ensure light is at the sun's position
scene.add(sunLight);

// Create sun as a central, glowing object
const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/sun-map.jpg') });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Define planet, moon, and ring data with properties for rendering and animation
const planetsData = [
  {
    name: "Mercury",
    radius: 0.2,
    orbitRadius: 10,
    orbitSpeed: 0.00048,
    texture: "textures/mercury-map.jpg",
    moons: [],
    rings: null
  },
  {
    name: "Venus",
    radius: 0.5,
    orbitRadius: 15,
    orbitSpeed: 0.00035,
    texture: "textures/venus-map.jpg",
    moons: [],
    rings: null
  },
  {
    name: "Earth",
    radius: 0.5,
    orbitRadius: 20,
    orbitSpeed: 0.0003,
    texture: "textures/earth-map.jpg",
    moons: [
      {
        name: "Moon",
        radius: 0.1,
        orbitRadius: 2,
        orbitSpeed: 0.001,
        texture: "textures/moon-map.jpg"
      }
    ],
    rings: null
  },
  {
    name: "Mars",
    radius: 0.3,
    orbitRadius: 25,
    orbitSpeed: 0.00028,
    texture: "textures/mars-map.jpg",
    moons: [
      { name: "Phobos", radius: 0.05, orbitRadius: 0.5, orbitSpeed: 0.002, texture: "textures/phobos-map.jpg" },
      { name: "Deimos", radius: 0.04, orbitRadius: 0.7, orbitSpeed: 0.0015, texture: "textures/deimos-map.jpg" }
    ],
    rings: null
  },
  {
    name: "Jupiter",
    radius: 1.2,
    orbitRadius: 40,
    orbitSpeed: 0.00013,
    texture: "textures/jupiter-map.jpg",
    moons: [
      { name: "Io", radius: 0.15, orbitRadius: 3, orbitSpeed: 0.002, texture: "textures/io-map.jpg" },
      { name: "Europa", radius: 0.12, orbitRadius: 4, orbitSpeed: 0.0015, texture: "textures/europa-map.jpg" },
      { name: "Ganymede", radius: 0.2, orbitRadius: 5, orbitSpeed: 0.001, texture: "textures/ganymede-map.jpg" },
      { name: "Callisto", radius: 0.18, orbitRadius: 6, orbitSpeed: 0.0008, texture: "textures/callisto-map.jpg" }
    ],
    rings: null
  },
  {
    name: "Saturn",
    radius: 1.0,
    orbitRadius: 50,
    orbitSpeed: 0.0001,
    texture: "textures/saturn-map.jpg",
    moons: [],
    rings: {
      innerRadius: 1.5,
      outerRadius: 2.5,
      texture: "textures/saturn-rings.jpg"
    }
  },
  {
    name: "Uranus",
    radius: 0.8,
    orbitRadius: 60,
    orbitSpeed: 0.00007,
    texture: "textures/uranus-map.jpg",
    moons: [],
    rings: {
      innerRadius: 1.2,
      outerRadius: 1.5,
      texture: "textures/uranus-rings.jpg"
    }
  },
  {
    name: "Neptune",
    radius: 0.8,
    orbitRadius: 70,
    orbitSpeed: 0.00005,
    texture: "textures/neptune-map.jpg",
    moons: [],
    rings: null
  }
];

// Create planets, moons, and rings, adding them to the scene
const planets = [];
planetsData.forEach(planetData => {
  // Create planet mesh
  const planetGeometry = new THREE.SphereGeometry(planetData.radius, 32, 32);
  const planetMaterial = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load(planetData.texture)
  });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  planet.name = planetData.name;
  planet.userData = {
    orbitRadius: planetData.orbitRadius,
    orbitSpeed: planetData.orbitSpeed,
    angle: 0,
    moons: [],
    rings: null
  };
  scene.add(planet);
  planets.push(planet);

  // Create moons for the planet
  planetData.moons.forEach(moonData => {
    const moonGeometry = new THREE.SphereGeometry(moonData.radius, 32, 32);
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load(moonData.texture)
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.name = moonData.name;
    moon.userData = {
      orbitRadius: moonData.orbitRadius,
      orbitSpeed: moonData.orbitSpeed,
      angle: 0,
      parentPlanet: planet
    };
    scene.add(moon);
    planet.userData.moons.push(moon);
  });

  // Create rings for the planet, if any
  if (planetData.rings) {
    const ringGeometry = new THREE.RingGeometry(
      planetData.rings.innerRadius,
      planetData.rings.outerRadius,
      64,
      1,
      0,
      Math.PI * 2
    );
    const ringTexture = new THREE.TextureLoader().load(planetData.rings.texture, () => {
      console.log(`Loaded ring texture for ${planetData.name}: ${planetData.rings.texture}`);
    }, undefined, (err) => {
      console.error(`Error loading ring texture for ${planetData.name}: ${err}`);
    });
    const ringMaterial = new THREE.MeshStandardMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: planetData.name === "Uranus" ? 0.3 : 0.8, // Fainter rings for Uranus
      alphaTest: 0.5 // Improve transparency rendering
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2; // Orient rings flat around planet
    ring.name = `${planetData.name}-rings`;
    planet.userData.rings = ring;
    scene.add(ring);
    console.log(`Added rings for ${planetData.name}`); // Debug to confirm ring creation
  }
});

// Set up raycaster for clicking planets and moons (rings are not clickable)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableObjects = [...planets, ...planets.flatMap(p => p.userData.moons)];

// Variable to track the currently followed planet (null means sun-centered)
let followedPlanet = null;

// Handle click events to display information and toggle planet tracking
function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableObjects);
  if (intersects.length > 0) {
    const object = intersects[0].object;
    if (!object.userData.parentPlanet) { // Only planets, not moons
      if (followedPlanet === object) {
        // Clicking the followed planet: disengage and center on sun
        followedPlanet = null;
        controls.target.set(0, 0, 0); // Focus on sun (origin)
        controls.update();
      } else {
        // Clicking a new planet: follow it
        followedPlanet = object;
        controls.target.copy(object.position); // Set control target to planet's position
        controls.update();
      }
    }
    displayObjectInfo(object);
  }
}
document.addEventListener('click', onMouseClick);

// Load planet and moon data from JSON file
let planetInfoData = {};
fetch('data/planets.json')
  .then(response => response.json())
  .then(data => {
    planetInfoData = data;
  });

// Display information for clicked planet or moon
function displayObjectInfo(object) {
  let info;
  if (object.userData.parentPlanet) {
    // Handle moon click
    const planetName = object.userData.parentPlanet.name;
    if (planetInfoData[planetName] && planetInfoData[planetName].moons && planetInfoData[planetName].moons[object.name]) {
      info = planetInfoData[planetName].moons[object.name];
    }
  } else {
    // Handle planet click
    info = planetInfoData[object.name];
    // Check if planet has rings and append ring info
    if (info.rings) {
      info = {
        ...info,
        basicInfo: `${info.basicInfo} It is known for its ring system.`,
        interestingFact: `${info.interestingFact} ${info.rings.interestingFact}`
      };
    }
  }
  if (info) {
    const infoPanel = document.getElementById('info-panel');
    infoPanel.innerHTML = `
      <h2>${object.name}</h2>
      <p><strong>Info:</strong> ${info.basicInfo}</p>
      <p><strong>Interesting Fact:</strong> ${info.interestingFact}</p>
    `;
    infoPanel.style.display = 'block';
  }
}

// Adjust Earth's rotation for day/night cycle based on system time
function setEarthRotation() {
  const earth = planets.find(p => p.name === "Earth");
  if (!earth) return;
  const now = new Date();
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const subsolarLongitude = (180 - 15 * (utcHours - 12)) % 360 - 180;
  earth.rotation.y = THREE.MathUtils.degToRad(subsolarLongitude);
}
setEarthRotation();

// Animation loop to update planet, moon, and ring positions
function animate() {
  requestAnimationFrame(animate);
  planets.forEach(planet => {
    // Update planet orbit
    planet.userData.angle += planet.userData.orbitSpeed;
    planet.position.x = Math.cos(planet.userData.angle) * planet.userData.orbitRadius;
    planet.position.z = Math.sin(planet.userData.angle) * planet.userData.orbitRadius;
    planet.rotation.y += 0.01; // Planet rotation

    // Update moon orbits
    planet.userData.moons.forEach(moon => {
      moon.userData.angle += moon.userData.orbitSpeed;
      moon.position.x = planet.position.x + Math.cos(moon.userData.angle) * moon.userData.orbitRadius;
      moon.position.z = planet.position.z + Math.sin(moon.userData.angle) * moon.userData.orbitRadius;
      moon.rotation.y += 0.005; // Moon rotation
    });

    // Update ring position and rotation
    if (planet.userData.rings) {
      planet.userData.rings.position.copy(planet.position); // Align rings with planet
      planet.userData.rings.rotation.y += 0.002; // Subtle ring rotation for visual effect
    }
  });

  // Update camera to follow the selected planet
  if (followedPlanet) {
    controls.target.copy(followedPlanet.position); // Keep controls focused on planet
    const offset = new THREE.Vector3(0, followedPlanet.geometry.parameters.radius * 2, followedPlanet.geometry.parameters.radius * 5);
    camera.position.copy(followedPlanet.position).add(offset); // Position camera relative to planet
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle window resize to maintain aspect ratio
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});