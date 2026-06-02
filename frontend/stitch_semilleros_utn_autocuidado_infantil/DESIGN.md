---
name: Kimma Education System
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#42474e'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#73777f'
  outline-variant: '#c2c7cf'
  surface-tint: '#3b618a'
  primary: '#3b618a'
  on-primary: '#ffffff'
  primary-container: '#84a9d6'
  on-primary-container: '#123e65'
  inverse-primary: '#a4c9f8'
  secondary: '#4a6545'
  on-secondary: '#ffffff'
  secondary-container: '#c9e8bf'
  on-secondary-container: '#4f6a49'
  tertiary: '#7d5718'
  on-tertiary: '#ffffff'
  tertiary-container: '#ce9e59'
  on-tertiary-container: '#543600'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#a4c9f8'
  on-primary-fixed: '#001d36'
  on-primary-fixed-variant: '#204970'
  secondary-fixed: '#ccebc2'
  secondary-fixed-dim: '#b1cfa7'
  on-secondary-fixed: '#082007'
  on-secondary-fixed-variant: '#334d2f'
  tertiary-fixed: '#ffddb2'
  tertiary-fixed-dim: '#f1be75'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#624000'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
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
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The visual identity of this design system is rooted in the concept of "nurturing growth." It targets educators, parents, and developmental specialists, necessitating a balance between professional academic rigor and the warmth required for pediatric care.

The design style is **Modern Corporate with Soft Humanist influences**. It leverages generous whitespace and a calming color palette to reduce cognitive load, while using rounded UI elements to evoke a sense of safety and approachability. The aesthetic avoids the "clinical" coldness of traditional institutional platforms, opting instead for a tactile, friendly environment that feels like a modern classroom or a supportive community space.

**Key Brand Pillars:**
- **Nurturing:** Soft edges and warm tones that feel welcoming.
- **Trustworthy:** Clear, structured layouts that convey academic authority.
- **Clear:** High legibility and focused content areas to prioritize child development insights.

## Colors

The color palette is directly derived from the Kimma visual identity, emphasizing a "nature-meets-nurture" theme.

- **Primary (Kimma Blue - #84A9D6):** Used for primary actions, navigation headers, and core branding. It represents stability and professional care.
- **Secondary (Leaf Green - #A8C69F):** Used for growth-related indicators, success states, and educational progress modules.
- **Tertiary (Soft Sun - #F7C37A):** Used sparingly for highlights, warm alerts, and secondary call-to-actions to draw attention without causing alarm.
- **Neutral (Slate Gray - #4A4A4A):** Provides high-contrast legibility for body text while remaining softer than pure black.
- **Backgrounds:** Utilize a "Paper White" (#FCFCFA) to maintain a warm, non-stark reading environment.

## Typography

This design system utilizes **Plus Jakarta Sans** for all levels to maintain a cohesive, friendly, and modern appearance. The font's geometric yet soft curves mirror the "Kimma" wordmark, providing an approachable feel that remains highly readable in dense educational content.

**Usage Guidelines:**
- **Headlines:** Use Bold weights for section titles to establish a clear hierarchy.
- **Body Text:** Use Medium or Regular weights. The `body-lg` (18px) is the preferred size for long-form pedagogical articles to ensure accessibility for all users.
- **Labels:** Caps should be avoided for labels to maintain a gentle tone; use sentence case or title case instead.

## Layout & Spacing

The design system employs a **12-column Fluid Grid** for desktop and a **4-column Fluid Grid** for mobile. The layout philosophy emphasizes "Breathable Information," using wide margins and generous vertical rhythm to prevent the interface from feeling cluttered or overwhelming.

- **Desktop:** 12 columns with 24px gutters. Content is usually contained within a max-width of 1280px.
- **Tablet:** 8 columns with 24px gutters.
- **Mobile:** 4 columns with 16px margins. 

Vertical spacing follows an 8px base unit. Component-to-component spacing should lean towards the larger `lg` (48px) and `xl` (80px) units to create distinct "educational zones" on the page.

## Elevation & Depth

To maintain a soft and friendly atmosphere, this design system avoids heavy, dark shadows. Instead, it utilizes **Tonal Layers** and **Soft Ambient Glows**.

- **Surface Levels:** The base background is slightly off-white. Cards and containers use pure white to "lift" off the page.
- **Shadows:** When necessary for interactivity (like on a hovered button or a modal), use an ultra-diffused shadow tinted with the primary blue color: `rgba(132, 169, 214, 0.15)` with a 20px blur and 0px spread.
- **Outlines:** Low-contrast 1px borders in a lighter shade of the primary color (#D6E2F0) are preferred over shadows for defining input fields and card boundaries.

## Shapes

The shape language is consistently **Rounded**, reinforcing the pedagogical and child-friendly focus. 

- **Standard Elements:** Buttons, input fields, and small cards use a 0.5rem (8px) corner radius.
- **Large Containers:** Educational modules and feature cards use a 1rem (16px) radius.
- **Tags/Chips:** Always use a "Pill" shape (fully rounded) to differentiate them from actionable buttons.

## Components

### Buttons
- **Primary:** Solid Primary Blue with white text. High-contrast, rounded-lg.
- **Secondary:** Outlined Primary Blue with a subtle light-blue background fill.
- **Tertiary:** Solid Tertiary Orange/Yellow for high-priority pedagogical "Call to Actions" like "Enroll Now" or "Emergency Guide."

### Cards
- White background with a 1px #D6E2F0 border.
- Cards used for "Student Profiles" or "Lesson Plans" should include a soft-green top-border to signify growth.

### Input Fields
- Labels are always positioned above the field in `label-md`.
- Borders are soft gray, turning Primary Blue on focus with a 4px soft outer glow.

### Informative Sections (Callouts)
- Use "Leaf Green" background at 10% opacity for tips and growth insights.
- Use "Soft Sun" background at 10% opacity for safety alerts and critical self-care information.

### Lists
- Use custom iconography (small leaf or circular dots) instead of standard bullets to maintain the brand's unique character.