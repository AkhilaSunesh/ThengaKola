# Thenga Kola

## Concept
A software project for a "Useless Projects" competition. It takes an image of a coconut bunch on a tree and detects which individual coconuts are capable of killing a person, framed as a mock public safety initiative (Kerala coconut-fall hazard humor).

## Core Idea
- Input: image of a coconut bunch on a tree
- Output: bounding boxes on each coconut with a "danger score" combining estimated size, drop height, and ripeness
- Presented with deadpan bureaucratic seriousness, like an official hazard report

## Technical Approach
- Object detection model (YOLO-based) to locate individual coconuts within a bunch image
- Existing dataset found: "coconut-bunch-detection" on Roboflow Universe (716 images, YOLOv11, pretrained model available via inference API) — usable directly instead of training from scratch given limited time
- Size/mass estimated from bounding box scale
- Ripeness estimated from color/texture as a proxy for danger (dry coconuts fall harder)
- Heuristic "lethality score" combining size, height, ripeness — invented for comedic effect since no real dataset for this exists

## Undo Universe (subdomain feature)
"Undo" (Malayalam, roughly "is it there / do you have") is planned as a subdomain/section of the site where users self-report their own coconut counts rather than uploading an image for detection. Users manually enter how many coconuts they have on a tree, split by category (e.g. how many tender coconuts, how many dried coconuts). This feeds a self-reported version of the danger stats/records alongside the image-detection based flow, without requiring a photo.

## Feature List

### Core Detection Features
- Live coconut danger scanner (upload/capture tree image, get per-coconut lethality scores)
- Threat Level badge system (Low / Moderate / Lethal / Code Red)
- Estimated drop height and mass per coconut
- Ripeness indicator

### Coconut Crime Records (headline feature)
- Historical Kills Database — mock incident log with case numbers, timestamps, locations
- Status of coconut after incident (e.g. "Retired," "In Police Custody," "Escaped, Still at Large," "Consumed as Evidence")
- Mock autopsy-style cause-of-death report per incident
- "Most Wanted Coconuts" leaderboard with wanted-poster style cards

### Interactive/Engagement Features
- "Report a Suspicious Coconut" upload button
- Public complaint form (Loitering, Attempted Assault, Premeditated Fall, etc.)
- Danger heatmap of Kerala (mock hotspot zones)
- Live homepage counters ("Coconuts under surveillance," "Confirmed threats neutralized")

### Institutional/Comedy Layer
- "Thenga Kola Department" branding — fake govt seal, mission statement, silly org chart titles
- Deadpan FAQ page
- Downloadable "Safety Certificate" for low-risk trees
- Absurd Terms & Conditions about coconut liability

### Nice-to-have Polish
- Alert sound/animation on lethal coconut detection
- Shareable result card
- User-submitted "most dangerous tree" leaderboard

### Formulas:
lethality_score = (size_factor * 0.4) + (maturity_factor * 0.4) + (height_factor * 0.2)
size_factor = min(100, (bounding_box_area / reference_area) * 100)
height_factor = (1 - (y_position / image_height)) * 100
Mapping score to Threat Level:

0–29   → Low
30–54  → Moderate
55–79  → Lethal
80–100 → Code Red

## Branding / Mascot
- Anthropomorphic coconut mascot: round brown husk body, twig arms/legs, big expressive eyes, mischievous grin, tiny yellow hard hat
- Action variants drafted: detective pose, falling/action pose, danger alert pose, innocent/safe pose, wanted poster pose, celebration pose, scanning/tech pose
- Logo/favicon lockup: simplified head-and-shoulders icon in circular badge, bold outlines, transparent background
- Wordmark lockup: icon + "THENGA KOLA" bold rounded sans-serif text

## Screen Flow
1. Home screen — mascot, single "Scan a tree" button, small link to Past scans
2. Capture screen — upload from gallery or open device camera, then auto-proceeds
3. Analyzing screen — brief loading animation (1.5-2.5 sec), real or mock detection runs underneath, auto-transitions
4. Results screen — annotated image with bounding boxes, list of coconuts with threat level/height/mass, auto-saves to history, link back to Home
5. Past scans screen — list of saved scans (thumbnail, date, highest threat level), reached from Home

Navigation summary: Home leads to Capture (main flow) or Past Scans (side flow). Capture leads to Analyzing, which leads to Results. Results saves to history and can navigate back to Home.

## Mascot Placement Map
- Home screen: Celebration/Victory Pose — welcoming, invites user to scan
- Capture screen: Scanning/Tech Pose — signals active analysis about to happen
- Analyzing screen: Detective/Investigator Pose — fits the "investigating" loading moment
- Results screen (high threat found): Danger Alert/Warning Pose
- Results screen (low threat found): Innocent/Safe Coconut Pose
- Past scans screen: Wanted Poster Pose — fits a "records/history" screen
- Logo/Favicon: simplified head-and-shoulders icon version

## Detection Models (Roboflow)
Two-stage pipeline using two separate Roboflow hosted models:

1. **Coconut localization** — coconut-bunch-detection by Ranugi
   - Source: https://universe.roboflow.com/ranugi/coconut-bunch-detection
   - 716 images, YOLOv11, model ID: coconut-bunch-detection/11
   - Used to detect and draw bounding boxes around individual coconuts within a bunch image

2. **Ripeness/maturity classification** — Coconut Maturity Detection
   - Source: https://universe.roboflow.com/coconut-maturity-detection/coconut-maturity-detection
   - 3,053 images, model ID: coconut-maturity-detection/6
   - Classes: Mature, Potential, Premature
   - Used to classify the ripeness of each individually detected coconut, feeding into the danger/lethality score (Mature = higher danger, Premature = lower danger)

Pipeline: uploaded image -> Model 1 detects and localizes each coconut (bounding boxes) -> each detected coconut region is cropped -> Model 2 classifies maturity per cropped coconut -> bounding box size + maturity class combined into the lethality score.


- Frontend: plain HTML, CSS, JavaScript (no framework)
- Bundling: Capacitor JS, targeting Android/iOS after web version works
- Build environment: Google Antigravity (AI coding agent), used as a "vibe code" build tool
- Detection: two-model pipeline planned (see Detection Models section above)
  1. Real version — Roboflow Hosted Inference API using coconut-bunch-detection/11 for localization, then coconut-maturity-detection/6 for ripeness classification per detected coconut
  2. Demo-safe fallback version — fully offline, mock detection logic generating plausible bounding boxes and maturity labels locally, isolated behind a single swappable function so it can later be replaced with the real API calls
- Local history storage: browser local storage / Capacitor Preferences
- Core priority: get main functions (upload/capture, detection, scoring, results display, history log) fully working even if not all stretch features are built

## Open Items / Next Steps
- Prioritize feature list into must-build vs stretch goals given competition timeline
- Generate and test mascot images across variants for consistency
- Build one-page style guide (color palette, spacing, sizes) for team consistency
- Wire up coconut-bunch-detection model via Roboflow inference API (or use mock fallback for demo safety)
- Design and implement heuristic lethality scoring formula
- Set up Capacitor Camera plugin permissions (Info.plist / AndroidManifest) when running npx cap add
