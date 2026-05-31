---
name: Lumina Learning Design System
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#42474e'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#72787f'
  outline-variant: '#c1c7cf'
  surface-tint: '#346286'
  primary: '#346286'
  on-primary: '#ffffff'
  primary-container: '#84b1d9'
  on-primary-container: '#0b4466'
  inverse-primary: '#9ecbf4'
  secondary: '#446273'
  on-secondary: '#ffffff'
  secondary-container: '#c5e4f8'
  on-secondary-container: '#496677'
  tertiary: '#4f6350'
  on-tertiary: '#ffffff'
  tertiary-container: '#9cb29b'
  on-tertiary-container: '#324533'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#9ecbf4'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#164a6d'
  secondary-fixed: '#c8e7fb'
  secondary-fixed-dim: '#accbde'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#2c4a5a'
  tertiary-fixed: '#d2e9d0'
  tertiary-fixed-dim: '#b6ccb5'
  on-tertiary-fixed: '#0d1f10'
  on-tertiary-fixed-variant: '#384b3a'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-xl:
    fontFamily: Work Sans
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Work Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Work Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Work Sans
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max-width: 1280px
---

## Brand & Style
The design system focuses on creating a calm, encouraging, and highly accessible environment for education. The brand personality is supportive and clear, aiming to reduce the cognitive load often associated with digital learning. 

The visual style is **Modern Corporate** with a soft, approachable edge. It utilizes a muted, nature-inspired palette to evoke a sense of stability and growth. The interface prioritizes clarity through generous whitespace and a structured typographic hierarchy, ensuring that the educational content remains the primary focus while the UI provides a dependable and aesthetically pleasing frame.

## Colors
The color palette is derived from soft, cool tones paired with warm highlights to guide user attention.

- **Primary (#84B1D9):** Used for main actions, active states, and primary branding elements.
- **Secondary (#A7C6D9):** Utilized for container backgrounds, subtle borders, and secondary UI elements to provide depth without high contrast.
- **Success/Growth (#A9BFA8):** Dedicated to progress indicators, completed states, and achievement-related feedback.
- **Highlight/CTA (#F2B885):** Reserved for high-priority calls to action, notifications, and "Aha!" moments in the learning journey.

The design system supports both **Light** and **Dark** modes. In Dark mode, the primary and accent colors are slightly desaturated to maintain readability against dark backgrounds, while the secondary blue is used sparingly as a tonal layer.

## Typography
The typography system uses a pairing of **Work Sans** for headlines and **Manrope** for body and functional text.

- **Work Sans** provides a sturdy, professional, and highly legible foundation for titles and headers, ensuring clear information architecture.
- **Manrope** is used for all reading experiences and interface labels due to its modern, balanced proportions and exceptional readability at smaller sizes.

Line heights are intentionally generous to improve focus and accessibility, particularly during long reading sessions or complex lessons.

## Layout & Spacing
The layout follows a **Fluid Grid** model with an 8px base unit. 

- **Desktop:** A 12-column grid with 24px gutters and 64px side margins. Content is typically contained within a maximum width of 1280px to prevent excessive line lengths.
- **Tablet:** An 8-column grid with 24px gutters and 32px margins.
- **Mobile:** A 4-column grid with 16px gutters and 16px margins.

Vertical rhythm is maintained through the 8px spacing system, using `16px`, `24px`, and `48px` increments to separate distinct content blocks and sections.

## Elevation & Depth
Visual hierarchy is established primarily through **Tonal Layers** and extremely soft **Ambient Shadows**.

- **Level 0 (Background):** The base canvas (Light: #F2F2F2; Dark: #1A2026).
- **Level 1 (Cards/Containers):** Uses the Secondary Blue (#A7C6D9) at low opacity in light mode, or a slightly lighter surface color in dark mode.
- **Level 2 (Modals/Overlays):** Raised using a soft, diffused shadow (0px 8px 24px rgba(0, 0, 0, 0.08)) to indicate interactivity and focus.

Outlines are preferred over heavy shadows for form fields and buttons to maintain a clean, flat aesthetic that feels contemporary and lightweight.

## Shapes
The design system employs a **Rounded** shape language to reinforce its friendly and approachable brand personality.

- **Standard Elements:** 0.5rem (8px) for buttons, inputs, and small chips.
- **Large Elements:** 1rem (16px) for cards, content sections, and modals.
- **Extra Large:** 1.5rem (24px) for hero containers or featured educational modules.

This consistent rounding softens the technical nature of the platform and makes the interface feel more tactile and human.

## Components

### Buttons
- **Primary:** Filled with Primary Blue (#84B1D9), white text, 8px corner radius.
- **Secondary:** Outlined with Primary Blue or filled with Secondary Blue (#A7C6D9) at 20% opacity.
- **CTA:** Filled with Highlight Orange (#F2B885) for enrollment or final task submission.

### Input Fields
- Use a 1px border of Secondary Blue. On focus, the border thickens to 2px Primary Blue with a soft 4px outer glow.

### Cards
- White background (light mode) or Surface Grey (dark mode) with an 8px border-radius and a subtle 1px border (#A7C6D9).

### Progress Elements
- All progress bars and success icons utilize Growth Green (#A9BFA8) to provide positive reinforcement and visualize student advancement.

### Chips & Tags
- Used for categories and difficulty levels. These use the Secondary Blue (#A7C6D9) with a 50% opacity background and dark-text for high legibility.