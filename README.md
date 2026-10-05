# La Tour Mystique — 3D Interactive Web Experience

A luxury 3D interactive website celebrating the **Eiffel Tower**, built strictly according to the **Product Requirement Document (PRD)**.

---

## 🌟 Quick Launch

### Option 1: Double-Click (Easiest)
Double-click **`start-server.bat`** in this folder, then open your browser to:
👉 **[http://localhost:8080/](http://localhost:8080/)**

### Option 2: PowerShell
Run the included PowerShell static web server:
```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1 8080
```
Then navigate to `http://localhost:8080/` in Chrome, Edge, Firefox, or Safari.

---

## 🎨 Implementation of the PRD Requirements

| PRD Section | Requirement | Implementation in Website |
|---|---|---|
| **O1 & O4** | 3D Object & Call to Action: "How to steal the Eiffel tower" | 3D model of the Eiffel Tower (`scene.gltf` + `scene.bin`) integrated with Three.js, glowing aura, and the complete heist masterplan narrative. |
| **O2 & I3** | Shape & Repetition | Triangular silhouette highlighted with mathematical metrics (18,038 puddle iron elements, 2.5M rivets). The tower spins in place while glowing with golden specs. |
| **O3 & I4** | Height & Summit Viewing Platform | Camera smoothly pans up 330m to the Summit Observation Deck. Interactive buttons let you view the Base, 1st Floor, 2nd Floor, and Summit. |
| **O3 & I5** | Material Realism & Puddle Iron | Macro camera zoom brings you close to the iron lattice, rivets, and metallic sheen with dynamic specular lighting. |
| **I1** | Typography & Color Scheme | Serif, elegant typography in italics (*Playfair Display*, *Cinzel*). Color palette features the **French Tricolor** (Bleu, Blanc, Rouge) with glowing gold specs. |
| **I2** | Launch View | Opens with a horizontal view of the tower, slow continuous spin, black obsidian background, and an ethereal golden glowing aura. |
| **I6** | French Flag Transition & Heist Dossier | Scrolling down transitions the ambient lighting and background to French flag colors while detailing the 4-step plan to steal the tower. |
| **I6** | Buying & Throwing the Special Orb | Interactive modal to "Acquire Special Compression Orb". Once armed, click or drag the orb to launch it at the tower; on impact, fireworks burst and the tower shrinks into pocket size (12 cm)! |
| **I6** | Miniature Glow & Monumental Re-enlargement | Continuing to scroll reveals the miniature tower glowing with gold. Triggering the restoration dynamically enlarges the monument back to its full majesty with golden rays and fanfare. |

---

## 🕹️ Interactive Features

- **Story Mode**: Scroll smoothly to travel through all narrative chapters and camera angles.
- **Free 3D Orbit Mode**: Click the **"3D Orbit"** button in the floating HUD at the bottom right to freely rotate, zoom, and inspect every angle of the tower.
- **Audio Experience**: Toggle the **Audio** button in the navigation bar to enable synthesized atmospheric chimes, whooshes, warp shrink tones, and golden fanfare chords (zero external sound files needed).
- **Scale Slider**: Use the slider in the Finale section to scale the Eiffel Tower smoothly between Pocket Size (0.1x) and Colossal Monument (1.5x).

---

## 📜 3D Model Credit & License

- **Title**: Eiffel Tower model 3D with best quality
- **Source**: [Sketchfab](https://sketchfab.com/3d-models/eiffel-tower-model-3d-with-best-quality-c3391c293e70471e9a112f7855adcf2f)
- **Author**: [shatlykxfree](https://sketchfab.com/shatlykxfree)
- **License**: CC-BY-4.0 (Creative Commons Attribution 4.0 International)
