---
name: Find It
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393938'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1b1c1b'
  surface-container: '#1f201f'
  surface-container-high: '#2a2a29'
  surface-container-highest: '#353534'
  on-surface: '#e4e2e0'
  on-surface-variant: '#ccc4c9'
  inverse-surface: '#e4e2e0'
  inverse-on-surface: '#303030'
  outline: '#958f93'
  outline-variant: '#4a4549'
  surface-tint: '#c7c6c6'
  primary: '#ffffff'
  on-primary: '#2f3031'
  primary-container: '#e3e2e2'
  on-primary-container: '#646464'
  inverse-primary: '#5e5e5e'
  secondary: '#c8c6c6'
  on-secondary: '#303030'
  secondary-container: '#474747'
  on-secondary-container: '#b6b5b4'
  tertiary: '#ffffff'
  on-tertiary: '#33302e'
  tertiary-container: '#e9e1de'
  on-tertiary-container: '#686361'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e3e2e2'
  primary-fixed-dim: '#c7c6c6'
  on-primary-fixed: '#1b1c1c'
  on-primary-fixed-variant: '#464747'
  secondary-fixed: '#e4e2e2'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#e9e1de'
  tertiary-fixed-dim: '#ccc5c3'
  on-tertiary-fixed: '#1e1b1a'
  on-tertiary-fixed-variant: '#4a4644'
  background: '#131313'
  on-background: '#e4e2e0'
  surface-variant: '#353534'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
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
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 24px
---

## Brand & Style
The design system is centered on a minimalist, premium aesthetic that prioritizes clarity and photographic content. It draws inspiration from modern photo-sharing platforms to create a familiar, high-end social experience for reporting and finding lost items. 

The personality is helpful, reliable, and unobtrusive. By utilizing generous whitespace and a restrained, monochromatic color palette, the interface recedes to let the "found" objects—the primary content—take center stage. The emotional response should be one of calm efficiency and trust, ensuring users feel supported during the stressful experience of losing a personal item.

## Colors
The palette is built on a high-contrast foundation optimized for **dark environments** using a sophisticated grayscale and muted metallic range.

- **Primary (Accent):** A refined medium gray used for functional accents and active states, providing a neutral yet distinct focal point against the dark background.
- **Surface Tiers:** 
  - The system is natively **Dark Mode**. Deep charcoal and near-black surfaces provide the foundation, while tiered surface containers define card regions to create subtle separation and depth hierarchy.
- **Typography:** Text colors are strictly tiered to establish a clear information hierarchy, using soft whites and light grays to maintain a premium, editorial feel without the harshness of pure white text on black.

## Typography
This design system utilizes **Inter** exclusively to leverage its systematic, utilitarian, and highly legible qualities. 

- **Headlines:** Use a bold weight (700) and negative letter-spacing for large displays to create a sophisticated, editorial impact.
- **Body:** Set primarily at 14px or 16px to maintain a high information density without sacrificing readability. Use the 500 weight for emphasized body text or usernames.
- **Labels:** Small, uppercase labels are used for metadata (e.g., timestamps, categories) to differentiate them from actionable text.

## Layout & Spacing
The system follows a strict **8px grid** to ensure mathematical harmony across all components.

- **Grid:** A 12-column fluid grid is used for desktop, scaling down to a single-column layout for mobile devices. 
- **Margins:** Mobile screens utilize a 16px side margin, while desktop views expand to 24px or a centered max-width container (935px) to mimic standard social gallery layouts.
- **Rhythm:** Use `md` (16px) for standard padding within cards and `lg` (24px) for vertical spacing between feed items.

## Elevation & Depth
Depth is communicated through a combination of subtle tonal layering and soft, diffused shadows, adapted for a dark interface.

- **Level 0 (Base):** The main background using the primary dark surface color.
- **Level 1 (Cards/Navigation):** In Dark Mode, elevation is communicated through slightly lighter surface-container values rather than heavy shadows, creating a "lifted" appearance against the dark base.
- **Level 2 (Modals/Overlays):** These use the highest surface contrast and a backdrop blur (12px) to focus attention on the active element while maintaining a sense of layered transparency.

## Shapes
The shape language is "Rounded," emphasizing a friendly and approachable feel. 

- **Containers:** All cards, input fields, and image containers must use a 16px (`rounded-lg`) corner radius.
- **Buttons:** Action buttons use a pill-shape for high contrast against square-ish image content, while secondary buttons may follow the 16px radius.
- **Icons:** Use Lucide React icons in "Outline" style with a 2px stroke width to match the clean, systematic weight of the Inter typeface.

## Components
- **Buttons:** Primary buttons are solid medium gray with light text. Secondary buttons use a transparent background with a 1px border.
- **Cards:** The central component of the app. It features a top-aligned user header, the item image (aspect ratio 1:1 or 4:5), followed by a description and metadata. Uses Level 1 tonal elevation for subtle depth.
- **Inputs:** Clean, 16px rounded rectangles with a 1px border. Labels should sit above the field in `label-sm` style. Focus states must use a 2px primary gray ring.
- **Chips:** Used for "Category" (e.g., Electronics, Pets) or "Status" (Lost, Found). These are small, 12px rounded elements with a muted gray fill and medium-weight text.
- **Lists:** Clean, borderless rows with 16px vertical padding, separated by a thin 1px hairline divider.
- **Lost/Found Indicators:** Use a high-visibility badge in the top corner of images to instantly communicate the post type, utilizing tonal shifts to indicate urgency.