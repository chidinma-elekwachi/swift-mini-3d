# Swift Model Viewer

Swift is a React-based web application for viewing and annotating 3D models (GLB format). It provides an interactive editor for placing hotspots, labeling points of interest, and exploring models with intuitive controls.

## Features

- **Import GLB Models:** Easily load 3D models in GLB format.
- **Interactive Controls:** Rotate, pan, and zoom the model using mouse gestures.
- **Add Hotspots:** Place labeled markers on your model to highlight important areas.
- **Focus View:** Click "View" to center the camera on a selected hotspot.
- **Delete Hotspots:** Remove unwanted markers with a single click.
- **Responsive Design:** Works well on both desktop and mobile devices.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
3. **Open your browser:**  
   Visit `http://localhost:5173` (or the port shown in your terminal).

## Usage

- Click **Import GLB Model** to load your 3D file.
- Use your mouse to:
  - **Rotate:** Click and drag
  - **Pan:** Right-click and drag
  - **Zoom:** Scroll wheel
- Click **Add Hotspot** to place a marker with a label.
- Use the **View** button to focus on a hotspot.
- Use the **Delete** button to remove a hotspot.

## Technologies Used

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Three.js](https://threejs.org/) (for 3D rendering)

## Development Notes

This project uses Vite for fast development and HMR, with ESLint for code quality.  
For TypeScript support, see the [Vite React TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts).

---

Feel free to contribute or customize for your own XR/3D
