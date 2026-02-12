# Components

This folder will contain shared UI components used across the app.

Planned components:

- `Layout` - global layout, TopBar, nav
- `NeonBackground` - subtle animated background
- `Card` - rounded card wrapper
- `NeonButton` - primary action with neon glow
- `ProgressBar` - animated neon progress
- `StreakCounter` - small streak display
- `DayLogForm` - form to add daily log
- `Timeline` - view logs timeline
- `RoadmapPhaseCard` - phase card with progress
- `TaskItem` / `TasksList` - planner
- `EmergencyModal` - calming flow
- `BadgeCard` - rewards view

Naming conventions:
- Use `PascalCase` for components
- Keep simple, focused components with strong props

Notes:
- We'll use Tailwind utility classes + small CSS modules for glow tokens.
- Add stories/tests later as components stabilize.
