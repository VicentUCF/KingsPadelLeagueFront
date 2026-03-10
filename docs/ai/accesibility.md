This document defines the accessibility standards for the frontend.

Accessibility is **not optional**.  
All UI must meet **WCAG 2.1 AA minimum standards** and pass **AXE accessibility checks**.

Accessibility must be considered **during design, development, and testing**, not as a later fix.

The goal is to ensure the application is usable by:

- keyboard users
- screen reader users
- users with visual impairments
- users with motor impairments
- users with cognitive differences

---

# Accessibility Principles

Accessibility implementation follows the **POUR principles**:

1. **Perceivable** — information must be visible or audible
2. **Operable** — UI must be usable with keyboard and assistive tech
3. **Understandable** — behavior must be predictable
4. **Robust** — compatible with assistive technologies

All UI must respect these principles.

---

# WCAG Compliance Level

Minimum requirement:

WCAG 2.1 AA

This includes requirements such as:

- sufficient color contrast
- keyboard navigation
- accessible forms
- accessible navigation
- proper focus management
- semantic HTML structure

Accessibility violations must be treated as bugs.

---

# AXE Compliance

All pages must pass **AXE accessibility checks**.

Rules:

- no critical AXE violations
- no serious AXE violations
- moderate violations must be reviewed

AXE checks should be included in development and testing workflows.

---

# Semantic HTML

Always use **semantic HTML elements** before ARIA.

Prefer:

- button
- nav
- header
- main
- section
- article
- form
- table
- label
- fieldset
- legend

Avoid replacing semantic elements with generic containers.

Bad:

```html
<div (click)="submitForm()">Submit</div>
```

Good:

```html
<button type="submit">Submit</button>
```

Semantic HTML improves accessibility automatically.

---

# ARIA Usage

ARIA should be used only when semantic HTML cannot provide the required meaning.

Rules:

- do not use ARIA to replace native semantics
- avoid unnecessary ARIA roles
- do not duplicate implicit semantics

Example:

Bad:

```html
<button role="button">
```

Correct:

```html
<button>
```

Use ARIA carefully for:

- dialogs
- complex widgets
- live regions
- dynamic updates

---

# Keyboard Accessibility

All interactive elements must be usable via keyboard.

Required behaviors:

- interactive elements must be focusable
- navigation must work with Tab / Shift+Tab
- activation must work with Enter and Space
- no keyboard traps

Users must be able to navigate the entire interface without a mouse.

---

# Focus Management

Focus must be visible and logical.

Rules:

- never remove focus outlines without replacing them
- focus order must follow visual order
- dialogs must trap focus while open
- focus must return to the triggering element when dialogs close

Example focus styles must remain visible.

Bad:

```css
outline: none;
```

Good:

```css
:focus-visible {
  outline: 2px solid var(--color-focus);
}
```

---

# Buttons and Links

Buttons and links must have clear semantics.

Use:

```html
<button>
```

for actions.

Use:

```html
<a>
```

for navigation.

Bad:

```html
<div class="button" (click)="save()">
```

Correct:

```html
<button (click)="save()">
```

Rules:

- clickable elements must be buttons or links
- interactive elements must be focusable
- clickable elements must have accessible text

---

# Images

Images must provide accessible descriptions.

Rules:

- meaningful images must have descriptive alt text
- decorative images must use empty alt attributes

Examples:

Meaningful image:

```html
<img src="player-avatar.jpg" alt="Player avatar" />
```

Decorative image:

```html
<img src="divider.svg" alt="" />
```

Rules:

- avoid redundant alt text like "image of"
- describe purpose rather than visual details when appropriate

Use NgOptimizedImage for static images.

---

# Forms Accessibility

Forms must be fully accessible.

Requirements:

- every input must have a label
- labels must be programmatically associated
- validation errors must be announced
- instructions must be visible

Example:

```html
<label for="player-name">Player name</label>
<input id="player-name" type="text" />
```

Error handling must be clear and accessible.

Example:

```html
<p role="alert">Player name is required</p>
```

Rules:

- never rely on placeholder text as the only label
- associate error messages with fields
- ensure form navigation works with keyboard

---

# Tables Accessibility

Tables must remain understandable for screen readers.

Rules:

- use `<table>` for tabular data
- include table headers
- use `<th>` with scope attributes

Example:

```html
<table>
  <thead>
    <tr>
      <th scope="col">Player</th>
      <th scope="col">Wins</th>
    </tr>
  </thead>
</table>
```

Avoid using tables for layout.

---

# Dialogs and Modals

Dialogs must follow accessibility rules.

Requirements:

- focus must move into the dialog when opened
- focus must remain trapped inside
- closing must return focus to the triggering element
- dialogs must have accessible titles

Example:

```html
<div role="dialog" aria-labelledby="dialog-title">
```

Rules:

- Escape key should close dialogs when appropriate
- background content must not be focusable while dialog is open

---

# Dynamic Content

Dynamic updates must be communicated to assistive technologies.

Use ARIA live regions when necessary.

Example:

```html
<div aria-live="polite">Match result updated</div>
```

Use sparingly to avoid overwhelming screen readers.

---

# Color and Contrast

Text must meet contrast requirements.

Minimum ratios:

- Normal text: 4.5:1
- Large text: 3:1

Rules:

- color must never be the only way to convey information
- important UI states must be visible beyond color changes

Example:

Bad:

- red text only for errors

Better:

- icon + color + text message

---

# Touch Target Size

Interactive elements must be large enough.

Recommended minimum:

- 44px × 44px

This ensures usability on touch devices.

---

# Animations and Motion

Animations must not harm accessibility.

Rules:

- avoid excessive motion
- respect prefers-reduced-motion
- avoid auto-playing animations that cannot be stopped

Example:

```css
@media (prefers-reduced-motion: reduce) {
  animation: none;
}
```

---

# Testing Accessibility

Accessibility must be verified during development.

Testing methods:

- AXE checks
- keyboard-only navigation
- screen reader testing when possible

Component tests should prefer accessible queries:

Good:

- getByRole
- getByLabelText
- getByText

Avoid:

- `querySelector('.some-class')`

---

# Accessibility Anti-Patterns

Avoid:

- clickable divs
- removing focus outlines
- missing labels on form inputs
- using color alone to convey meaning
- inaccessible dialogs
- improper ARIA usage
- keyboard traps
- non-semantic markup

---

# Accessibility Responsibility

Accessibility is the responsibility of:

- developers
- designers
- reviewers

Accessibility issues must be treated with the same seriousness as functional bugs.

---

# Output Expectations

When generating UI code:

- prefer semantic HTML
- ensure keyboard accessibility
- provide labels and roles where necessary
- maintain visible focus states
- meet color contrast requirements
- avoid unnecessary ARIA usage
- ensure interactive elements are accessible
- pass AXE accessibility checks
