# Thenga Undo

## Concept
Thenga Undo is a subdomain/section within the Thenga Kola project. "Undo" (Malayalam, roughly "is it there / do you have") is where users self-report their own coconut counts rather than uploading a photo for detection. It also acts as the guided next step whenever the main Thenga Kola scanner detects a coconut in danger of falling.

## Trigger / Entry Point
- When the main Thenga Kola scanner detects a coconut with a high threat level (Lethal / Code Red), the Results screen guides the user to Thenga Undo as the recommended next action.
- Thenga Undo can also be accessed directly/independently from the main site navigation, without needing to run a scan first.

## Core Idea
- Instead of image detection, the user manually self-reports coconut counts for a tree
- User enters how many coconuts are on the tree, split by category (e.g. tender coconuts, dried coconuts)
- This self-reported data feeds into the same danger stats/records system used by the image-detection flow

## Features
- Manual entry form: number of tender coconuts, number of dried coconuts (dried treated as higher risk)
- Guided handoff from Results screen: when a dangerous coconut is detected via image scan, show a prompt/button directing the user to Thenga Undo to log/report it
- Self-reported entries contribute to the same "Historical Kills Database" / records system as image-detected coconuts
- Mock status tracking for reported coconuts (e.g. "Reported," "Marked for removal," "Resolved")
- Tie-in with Most Wanted Coconuts leaderboard — self-reported dangerous coconuts can appear alongside image-detected ones

## Open Items / Next Steps
- Decide the specific danger threshold that triggers the guided handoff from the main scanner (e.g. Lethal and Code Red only, or Moderate and above)
- Design the manual entry form UI (fields, validation, category options)
- Decide how self-reported entries are visually distinguished from image-detected entries in shared records/leaderboards
- Define the mock status lifecycle for reported coconuts
