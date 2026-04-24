---
name: La Vin Nails Web React
description: Design System for La Vin Nails - Premium Mobile-First UI
tokens:
  colors:
    primary:
      description: "Pink (Material Design) — dominant brand color. Used for titles, gradients, primary buttons, and active borders."
      value:
        300: "#f06292"
        400: "#ec407a"
        500: "#e91e63"
        600: "#d81b60"
        700: "#c2185b" # Main gradient color for buttons
        800: "#ad1457"
    secondary:
      description: "Teal (Material Design) — used for input borders, focus rings, and secondary text highlights."
      value:
        400: "#26a69a"
        500: "#009688"
        600: "#00897b"
        700: "#00796b"
    accent:
      description: "Emerald — used for success messages and input text values."
      value:
        600: "#059669"
        700: "#047857"
    warning:
      description: "Amber (Material Design) — used for warnings like 'Debes seleccionar un turno'."
      value:
        500: "#ffc107"
        600: "#ffb300"
    error:
      description: "Red (Material Design) — used for error states and destructive actions."
      value:
        500: "#f44336"
        600: "#e53935"
        700: "#d32f2f"
    background:
      description: "Application background color."
      value: "#ffffff"
    text:
      description: "Primary text color."
      value: "#1A1A1A"
  typography:
    sans:
      description: "Primary sans-serif font family used throughout the application."
      value: ["Poppins", "sans-serif"]
    baseSize:
      description: "Minimum base font size for inputs to prevent iOS auto-zoom."
      value: "16px"
  animations:
    fadeInDown:
      description: "Smooth fade in and down entry animation used for modals and page headers."
      value: "fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) both"
components:
  inputs:
    fontSize: "{typography.baseSize}"
---

# La Vin Nails - Identity & Design System

This document is the Single Source of Truth for the visual identity and UI patterns of the La Vin Nails project. **All AI agents and developers must strictly adhere to these rules when building or modifying the frontend.**

## 1. Brand Identity & Aesthetics
- **Vibe:** Premium, minimal, elegant, and warm.
- **Color Palette:** 
  - **Dominant Brand Color (Pink):** The application relies heavily on Tailwind's default `pink` palette for its core identity. `pink-700` and `pink-500` are frequently used in primary buttons (often as gradients), titles, and active borders.
  - **Secondary/Accent Color (Emerald):** The `emerald` palette is uniquely combined with pink to create contrast. It is heavily used for input text (`text-emerald-700`), success messages, secondary borders, and hover states.
- **Typography:** We use **Poppins** for a modern, geometric, and friendly yet sophisticated look.

## 2. Critical Mobile-First Rules (iOS/Safari Compliance)
La Vin Nails is heavily used on mobile devices. The following rules are **NON-NEGOTIABLE**:

- **Viewport Height:** STRICTLY FORBIDDEN to use `h-screen` or `100vh`. 
  - **Always use `h-dvh`** (Dynamic Viewport Height) to prevent layout breakages caused by Safari's dynamic navigation bars.
- **Input Zooming:** To prevent iOS Safari from automatically zooming in when a user taps an input field:
  - All text inputs (`input`, `textarea`, `select`) must have a minimum font size of **`16px`** (`text-base` in Tailwind). NEVER use `text-sm` for inputs.

## 3. Libraries & Styling Stack
- **Tailwind CSS:** Primary utility-first styling. The pink and emerald palettes from Tailwind defaults are our core colors.
- **Custom Animations:** Use `animate-fade-in-down` for smooth, premium entry transitions.

## 4. Interaction Design
- Micro-interactions are key to a premium feel. Use subtle hover states, transitions, and active states.
- Modals, toasts, and dropdowns should never appear abruptly; they must fade or slide in smoothly.
