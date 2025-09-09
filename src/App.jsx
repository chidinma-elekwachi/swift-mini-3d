import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './App.css';

const MiniEditor = () => {
  const canvasRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [hotspots, setHotspots] = useState([]);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [sceneInfo, setSceneInfo] = useState('No model loaded');
  
  // Three.js references
  const sceneRef = useRef(new THREE.Scene());
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const hotspotGroupRef = useRef(new THREE.Group());
  
  useEffect(() => {
    // Initialize Three.js scene
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    
    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    
    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      canvas.clientWidth / canvas.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(2, 2, 5);
    cameraRef.current = camera;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add coordinate helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);
    
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    // Add hotspot group to scene
    scene.add(hotspotGroupRef.current);
    
    // Set up orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;
    
    // Handle window resize
    const handleResize = () => {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer) renderer.dispose();
    };
  }, []);
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith('.glb')) {
      alert('Please select a valid GLB file');
      return;
    }
    
    // Clear previous model and hotspots
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }
    
    // Clear hotspots
    while(hotspotGroupRef.current.children.length > 0) {
      hotspotGroupRef.current.remove(hotspotGroupRef.current.children[0]);
    }
    setHotspots([]);
    setSelectedHotspot(null);
    
    // Load new model
    const loader = new GLTFLoader();
    const objectURL = URL.createObjectURL(file);
    
    setSceneInfo('Loading model...');
    
    loader.load(
      objectURL,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;
        sceneRef.current.add(model);
        
        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;
        
        // Adjust camera to fit model
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = cameraRef.current.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));
        
        cameraRef.current.position.z = cameraZ * 1.5;
        controlsRef.current.update();
        
        setModelLoaded(true);
        setSceneInfo(`Model: ${file.name}`);
        
        URL.revokeObjectURL(objectURL);
      },
      (xhr) => {
        // Progress callback
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('Error loading model', error);
        setSceneInfo('Error loading model');
        URL.revokeObjectURL(objectURL);
      }
    );
  };
  
  const addHotspot = () => {
    if (!modelRef.current) {
      alert('Please load a model first');
      return;
    }
    
    const hotspotName = prompt('Enter a name for this hotspot:');
    if (!hotspotName) return;
    
    // In a real implementation, you would use a raycast from the camera
    // to determine the position on the model. For simplicity, we'll place
    // it at a fixed position relative to the model.
    const position = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 + 1,
      Math.random() * 2 - 1
    );
    
    // Create a visual marker for the hotspot
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const marker = new THREE.Mesh(geometry, material);
    marker.position.copy(position);
    
    // Add the marker to the hotspot group
    hotspotGroupRef.current.add(marker);
    
    // Add hotspot to state
    const newHotspot = {
      id: Date.now(),
      name: hotspotName,
      position: position,
      marker: marker
    };
    
    setHotspots([...hotspots, newHotspot]);
  };
  
  const deleteHotspot = (id) => {
    const hotspot = hotspots.find(h => h.id === id);
    if (hotspot) {
      hotspotGroupRef.current.remove(hotspot.marker);
      setHotspots(hotspots.filter(h => h.id !== id));
      
      if (selectedHotspot === id) {
        setSelectedHotspot(null);
      }
    }
  };
  
  const focusHotspot = (id) => {
    const hotspot = hotspots.find(h => h.id === id);
    if (hotspot && cameraRef.current && controlsRef.current) {
      // Move camera to look at hotspot
      cameraRef.current.position.copy(hotspot.position.clone().add(new THREE.Vector3(2, 2, 2)));
      controlsRef.current.target.copy(hotspot.position);
      controlsRef.current.update();
      
      setSelectedHotspot(id);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>SwiftXR Mini 3D Editor</h1>
        <p className="subtitle">
          Import, view, and annotate 3D models with interactive hotspots
        </p>
      </header>
      
      <div className="editor-container">
        <div className="canvas-container">
          <canvas ref={canvasRef} id="three-canvas"></canvas>
          <div className="status-bar">{sceneInfo}</div>
          {!modelLoaded && <div className="loading">Load a model to begin</div>}
        </div>
        
        <div className="controls-panel">
          <h2 className="panel-title">Controls</h2>
          
          <input
            type="file"
            id="model-upload"
            accept=".glb"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <label htmlFor="model-upload" className="button">
            Import GLB Model
          </label>
          
          <button className="button button-secondary" onClick={addHotspot}>
            Add Hotspot
          </button>
          
          <div className="hotspot-list">
            <h3 style={{ marginBottom: '10px', fontSize: '1rem' }}>Hotspots</h3>
            {hotspots.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: '#a0a0b8' }}>No hotspots added</p>
            ) : (
              hotspots.map(hotspot => (
                <div key={hotspot.id} className="hotspot-item">
                  <span className="hotspot-name">{hotspot.name}</span>
                  <div className="hotspot-actions">
                    <button onClick={() => focusHotspot(hotspot.id)}>View</button>
                    <button onClick={() => deleteHotspot(hotspot.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="instructions">
        <h2>How to Use This Editor</h2>
        <ul>
          <li>Click "Import GLB Model" to load a 3D model</li>
          <li>Use your mouse to rotate (click and drag), pan (right-click and drag), and zoom (scroll)</li>
          <li>Click "Add Hotspot" to place markers on your model with labels</li>
          <li>Use the "View" button to focus the camera on a specific hotspot</li>
          <li>Use the "Delete" button to remove unwanted hotspots</li>
        </ul>
      </div>
    </div>
  );
};

// Styles would be implemented using CSS modules or styled-components in a real React app
// For this example, we'll include them in a style tag

const App = () => {
  return (
    <>
      <MiniEditor />
    </>
  );
};

export default App;