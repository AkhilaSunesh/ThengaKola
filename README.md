<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />

# ThengaKola - Thenga Undo (തേങ്ങാ കൊല) 🎯
> *"തേങ്ങ വീഴും മുമ്പേ, കൊല അറിയാം"* (Know the murder before the coconut falls!)

## Basic Details
### Team Name: WannaBeInUndoUniverse

### Team Members
- Team Lead: Akhila Sunesh

### Project Description
ThengaKola is an AI-powered, mock Kerala government public safety hazard portal that detects individual coconuts on palm trees and calculates whether they possess enough ballistic kinetic energy to fracture a human skull. Complete with real YOLOv11 computer vision, Kerala district hazard radars, historical coconut crime registries, and the citizen self-reporting portal **"Thenga Undo?" (തേങ്ങാ ഉണ്ടോ?)**.

### The Problem (that doesn't exist)
**God’s Own Country has a very special problem.**

Kerala, the *“land of coconuts,”* is facing a coconut shortage. And the few that remain? **Avaru oru rakshayum illa.** 🥥

While people enjoy their **chaaya** or **uchayurakkam**, there’s always one question:
> **“Innu thenga thalayil veezhumo?”**

Cars, rooftops, and unsuspecting humans are constantly under attack from these **high-altitude husked missiles**. Because in Kerala, you never know **eppo thenga veezhum!**

### The Solution (that nobody asked for)
A state-of-the-art Two-Stage Neural Threat Detector & Public Grievance Matrix! 
Users simply take a photo of any suspicious tree bunch. Our system localizes every coconut, crops and classifies ripeness, computes terminal drop velocity ($v = \sqrt{2gh}$) and cranial impact Joules ($KE = \frac{1}{2}mv^2$), assigns a Threat Level (*Low*, *Moderate*, *Lethal*, or *Code Red*), and pre-fills an official police FIR or downloadable **Tree Safety Clearance Certificate**. And for citizens without a camera, the **"Thenga Undo?"** census lets them self-report their backyard coconut headcount directly into the Kerala Hazard Radar!

---

## Technical Details

### Technologies/Components Used
For Software:
- **Languages**: HTML5, Vanilla CSS3 (Strict 4-Color Kerala Palette), JavaScript (ES6+), Node.js, Python 3
- **Frameworks / APIs**: 
  - Roboflow Hosted Inference REST API (Server-side proxy)
  - YOLOv11 Bunch Localization (`coconut-bunch-detection/11`)
  - Coconut Maturity Classification (`coconut-maturity-detection/6`)
- **Libraries**:
  - Web Audio API (procedural alert sirens & shutter sound synthesis)
  - HTML5 Canvas API (tactical HUD bounding boxes, crosshairs & image cropping)
  - Python `roboflow` & `Pillow` (offline data validation & asset pipeline)
- **Tools**:
  - Google Antigravity IDE (Agentic AI Pair Programmer)
  - Node.js `http` & `fs` custom backend with `.env` secret management

---

## Implementation

### Installation
```bash
# Clone repository
git clone https://github.com/your-username/tengakola.git
cd tengakola

# Optional: Install Roboflow python SDK if running offline validation scripts
pip install roboflow pillow
```

### Environment Configuration (.env)
Create a `.env` file in the root directory (protected by `.gitignore`):
```env
ROBOFLOW_API_KEY=your_roboflow_api_key_here
ROBOFLOW_LOCALIZATION_MODEL=coconut-bunch-detection/11
ROBOFLOW_MATURITY_MODEL=coconut-maturity-detection/6
PORT=3000
```

### Run
```bash
# Start the secure backend server with Roboflow proxy & live static frontend
node server.js
```
Open your browser and navigate to: **`http://localhost:3000`**

---

## Technical Workflow Architecture

```
[ User Uploads/Captures Tree Photo ]
                │
                ▼
[ Node.js Backend Proxy (/api/detect) ] ──▶ Protected .env API Key
                │
                ▼
[ Stage 1: Roboflow YOLOv11 Bunch Detection ] ──▶ Bounding Box Localization
                │
                ▼
[ Stage 2: Crop Bounding Box & Classify Ripeness ] ──▶ Mature / Potential / Premature
                │
                ▼
[ Ballistic Physics & Lethality Scoring Engine ]
  • Lethality = (Size × 0.4) + (Maturity × 0.4) + (Height × 0.2)
  • Impact Energy (Joules) = 0.5 × Mass × (2 × g × Height)
  • Threat Tier: Low (0-29), Moderate (30-54), Lethal (55-79), Code Red (80-100)
                │
                ├───▶ [ High Hazard Trigger ] ──▶ Procedural Siren + Audio FX
                ├───▶ [ Interactive Canvas ] ──▶ Tactical HUD Bounding Brackets
                ├───▶ [ Thenga Undo Guided Handoff ] ──▶ Citizen Palm Census
                ├───▶ [ Incident Registry ] ──▶ Log to Coconut Crime Cold Cases
                └───▶ [ Safety Certificate ] ──▶ Printable Single-Page PDF Clearance
```

---

## Project Documentation

### Screenshots
*(Add your screenshots here)*

![Screenshot 1 - Home Screen](Add screenshot 1 here)
*Homepage with 100vh layout, live surveillance counters, and official department mascot.*

![Screenshot 2 - Optical Scanner & Canvas HUD](Add screenshot 2 here)
*Tactical bunch scanner displaying annotated bounding brackets, lethality scores, and cranial impact Joules.*

![Screenshot 3 - Thenga Undo & Kerala Radar](Add screenshot 3 here)
*Thenga Undo self-reporting portal with district hazard telemetry.*

![Screenshot 4 - Most Wanted & Crime Case Files](Add screenshot 4 here)
*Kerala's Most Wanted Coconut mugshots and historical incident registry.*

![Screenshot 5 - Official Safety Clearance Certificate](Add screenshot 5 here)
*Single-page official safety clearance certificate signed by the Chief Coconut Commissioner.*

---

## Team Contributions
- **Akhila Sunesh**: Ideator, creator, innovator (so desperately dont want to be in Undo Universe), full-stack developer, UX designer, and prompt engineer.

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)
