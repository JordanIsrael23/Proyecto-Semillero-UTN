---
name: Lumina Learning
colors:
  surface: '#11131c'
  surface-dim: '#11131c'
  surface-bright: '#373943'
  surface-container-lowest: '#0c0e17'
  surface-container-low: '#191b24'
  surface-container: '#1d1f29'
  surface-container-high: '#282933'
  surface-container-highest: '#32343e'
  on-surface: '#e1e1ef'
  on-surface-variant: '#c2c7d0'
  inverse-surface: '#e1e1ef'
  inverse-on-surface: '#2e303a'
  outline: '#8c919a'
  outline-variant: '#42474f'
  surface-tint: '#a0caff'
  primary: '#a0caff'
  on-primary: '#003259'
  primary-container: '#82ade2'
  on-primary-container: '#06406f'
  inverse-primary: '#336191'
  secondary: '#ffb867'
  on-secondary: '#482900'
  secondary-container: '#845000'
  on-secondary-container: '#ffcb94'
  tertiary: '#b1cfa7'
  on-tertiary: '#1d361a'
  tertiary-container: '#95b28c'
  on-tertiary-container: '#2b4527'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a0caff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#154978'
  secondary-fixed: '#ffddbb'
  secondary-fixed-dim: '#ffb867'
  on-secondary-fixed: '#2b1700'
  on-secondary-fixed-variant: '#673d00'
  tertiary-fixed: '#ccebc2'
  tertiary-fixed-dim: '#b1cfa7'
  on-tertiary-fixed: '#082007'
  on-tertiary-fixed-variant: '#334d2f'
  background: '#11131c'
  on-background: '#e1e1ef'
  surface-variant: '#32343e'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  sidebar-width: 260px
---

## Brand & Style

The design system is built on a foundation of **Modern Corporate** aesthetics, optimized specifically for the high-cognitive-load environment of educational management. The personality is a balance of "Nurturing Expertise"—where the softness of the brand's origins meets the structural rigor of a professional SaaS dashboard.

The UI avoids the "cold" feeling of traditional enterprise software by utilizing subtle organic curves and a warm color temperature within its dark mode. It aims to evoke a sense of calm, organization, and growth. Key attributes include:
- **Trustworthy:** Highly legible typography and clear information architecture.
- **Supportive:** Gentle transitions and soft elevation to guide teacher workflows.
- **Focused:** Minimalist use of color, reserved primarily for functional feedback and primary actions.

## Colors

The palette is derived from the brand logo, refined for accessibility on high-density displays. The primary **Soft Blue** (#82ADE2) serves as the anchor for navigation and primary actions. The **Orange** (#FFB866) is used as a warm highlight for progress and alerts, while the **Sage Green** (#A8C69F) is reserved for growth metrics and success states.

The background uses a deep, ink-toned neutral (#0F111A) rather than pure black to reduce eye strain during extended night-time grading sessions. Accent colors should be used sparingly (roughly 10% of the UI) to ensure the teacher's data remains the focal point.

## Typography

This design system employs a dual-font strategy. **Manrope** is used for headlines to provide a modern, friendly, and geometric feel that mirrors the brand's logo. **Inter** is utilized for all body copy and data-heavy labels because of its exceptional legibility and systematic performance in dashboard environments.

Hierarchies are established primarily through weight and size. In the dark theme, ensure text contrast remains high—using pure white (#FFFFFF) for headlines and a secondary gray (#A0AEC0) for body text to maintain a comfortable reading experience.

## Layout & Spacing

The system follows a **Fluid Grid** philosophy within a structured container. 
- **Desktop:** Uses a 12-column grid with 24px gutters. The layout features a fixed left sidebar (260px) for high-level navigation, with a flexible content area that expands to the user's viewport.
- **Tablet:** Collapses the sidebar into a drawer and moves to an 8-column grid.
- **Mobile:** Uses a single-column layout with 16px horizontal margins.

Spacing follows an 8pt linear scale (8, 16, 24, 32, 48, 64) to ensure mathematical consistency across all components.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** rather than heavy shadows. 
- **Level 0 (Base):** The dark background (#0F111A).
- **Level 1 (Surface):** Container backgrounds use a slightly lighter "Surface" color (#1A1D27).
- **Level 2 (Active):** Interaction states or cards use a subtle low-opacity border (1px white at 10% opacity) or a very soft ambient shadow (0px 4px 20px rgba(0,0,0,0.4)).

Backdrop blurs (Glassmorphism) are reserved exclusively for persistent floating elements, such as top navigation bars or modal overlays, to maintain context of the underlying data.

## Shapes

The design system uses a **Rounded** (0.5rem / 8px) corner language. This choice reflects the brand's friendly nature without appearing "juvenile" or overly casual. 

- **Cards and Modals:** Use `rounded-lg` (1rem / 16px) to create a soft, inviting container for information.
- **Buttons and Inputs:** Use the base `rounded` (8px) for a precise, professional feel.
- **Avatars/Badges:** May utilize pill-shaped (100px) rounding to distinguish them from structural UI elements.

## Components

### Buttons
- **Primary:** Solid primary color (#82ADE2) with dark text. 8px corner radius.
- **Secondary:** Outlined with a 1px border of the primary color and transparent background.
- **Ghost:** No background or border; used for low-priority actions in headers.

### Input Fields
Inputs use the Level 1 Surface color with a subtle border. On focus, the border transitions to the primary color with a 2px outer glow. Labels always sit above the field in `label-sm` style.

### Cards
Cards are the primary container for student data and planning modules. They use a 16px corner radius and a Level 1 surface. Avoid inner borders unless the card is nested.

### Chips & Status Indicators
Used for "Grade Levels" or "Status." They utilize a 20% opacity background of the state color (e.g., Green for "Complete") with high-contrast text.

### Sidebar Navigation
The active state uses a subtle vertical "pill" highlight or a background tint with the primary color to clearly indicate the user's current location.