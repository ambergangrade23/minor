# Replace Static Hero Character with Walking Boy Video

Replace the static floating student cutout with an animated walking boy video (`Boy_walking.mp4`), seamlessly blended over the campus background with soft edge feathering, continuous autoplay looping, and interactive click-to-react speech bubble dialogue.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design and interaction decisions were confirmed during the Phase 1 clarification interview:
> - **Display & Blending Mode**: Seamless vignetted and feathered character overlay positioned naturally on the campus ground level rather than an artificial floating cutout.
> - **Playback & Audio Constraints**: Autoplay enabled, muted by default for zero-friction browser playback compliance, running in a continuous seamless loop.
> - **Interactive Capabilities**: Fully interactive character click target that triggers contextual student speech bubbles (transit alerts, bus tracking tips, driver contact prompts, cheering).

- **Confirmed Decision 1**: Seamless transparent/vignetted character overlay over campus background.
- **Confirmed Decision 2**: Continuous muted autoplay loop with smooth hardware-accelerated playback.
- **Confirmed Decision 3**: Clickable interactive character that responds to taps and dashboard state with animated speech dialogue bubbles.

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades the central hero visual in the AITR Futuristic Campus Dashboard from an artificial hovering static billboard to a lifelike animated video of a student walking (`Boy_walking.mp4`).
- **Target Audience / Persona**: Acropolis Institute students tracking their daily college buses, checking route ETAs, and navigating the campus transit portal.
- **Key Value**: Provides a human, lively, and grounded campus atmosphere while retaining all transit-triggered reactive states (bus selection, alert checks, driver lookups).

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Initial Page Load**: The user opens the dashboard; the walking boy seamlessly loops in the center-stage area over the campus courtyard, grounded naturally with an atmospheric shadow and subtle radial vignette feathering.
2. **Dashboard Navigation**: As the user interacts with the sidebar, bus status panel, or alerts, the character updates dialogue speech bubbles (e.g., *"Tracking Bus G-15 in real-time!"*, *"Scanning nearby alternative stops..."*).
3. **Direct Click Interaction**: Clicking on the walking character triggers a micro-bounce effect and rotates through helpful student transit tips and friendly reactions with clean typography and speech bubbles.

### Visual Identity & Theme
- **Integration & Atmosphere**:
  - Soft radial and linear alpha-gradient masking on the video edges (`mask-image: radial-gradient(...)`) so the video frame blends into the campus courtyard without harsh rectangular video borders.
  - Realistic ground contact shadow beneath the character to anchor the walking motion.
- **Typography & Dialogue Callout**:
  - Speech bubbles styled with clean Tailwind tokens: `bg-slate-900/90 text-white backdrop-blur-md border border-white/20 shadow-xl rounded-2xl px-4 py-2 text-xs font-semibold`.
  - Unboxed, elegant typography with smooth enter/exit spring transitions.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direct Video Component with CSS Masking vs Three.js VideoTexture**
  - *Chosen Approach*: Implement a dedicated `WalkingStudentHero` component using an HTML5 `<video>` element with hardware-accelerated CSS masking (`mask-image: radial-gradient(...)`), subtle color grading (`brightness(1.02) contrast(1.04)`), and an overlaid SVG speech bubble.
  - *Why*: Provides 60fps buttery-smooth playback, minimal GPU/CPU overhead, native responsive scaling, and instant loading without Three.js texture upload latency or frame drops.
  - *Alternatives Considered*: Three.js VideoTexture on a mesh—adds unnecessary WebGL pipeline complexity and potential shader stutter on lower-end student mobile devices.

- **Decision 2: Dual-Asset Path Support (`Boy_walking.mp4` and `Boy_walk.mp4`)**
  - *Chosen Approach*: Support both filenames natively and ensure a symbolic link / fallback so references to either `@Boy_walking.mp4` or `/Boy_walk.mp4` resolve without 404 errors.
  - *Why*: Guarantees zero broken video paths whether accessed via the user's specific prompt name or existing public asset repository.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                  FuturisticCampusDashboard                   │
│                                                              │
│  ┌───────────────────────┐        ┌───────────────────────┐  │
│  │  Cinematic Campus     │        │  WalkingStudentHero   │  │
│  │  Background Photo     │        │  (Boy_walking.mp4)    │  │
│  └───────────────────────┘        └───────────┬───────────┘  │
│                                               │              │
│  ┌───────────────────────┐                    ▼              │
│  │  HUD Floating Panels  │◄─────── CharacterState Context    │
│  │  & Interactive Modals │        (idle, bus, alert, cheer)  │
│  └───────────────────────┘                                   │
└──────────────────────────────────────────────────────────────┘
```

### Component State Mapping & Handlers
- **State Source**: `characterState` in `FuturisticCampusDashboard` (`walking`, `idle`, `react_bus`, `react_alert`, `react_route`, `react_driver`, `cheer`, `wave`).
- **Video Attributes**: `autoPlay`, `loop`, `muted`, `playsInline`, `preload="auto"`.
- **Click Handler**: `onCharacterClick` rotates through playful student transit dialogue lines and fires confetti / particle micro-animations.
- **Layout Math**: Responsive max-height container (`max-h-[65vh] sm:max-h-[75vh]`) aligned towards the bottom-center third of the screen to give the illusion of walking on the campus courtyard tiles.
