# styling.md

This document defines the styling architecture of the frontend.

The project uses:

- **SCSS**
- **ITCSS (Inverted Triangle CSS Architecture)**
- **BEM (Block Element Modifier)**

The goal is to ensure styles remain:

- scalable
- predictable
- maintainable
- low-specificity
- easy to override
- easy to refactor

---

# Styling Philosophy

The styling system must prioritize:

- predictable cascade
- low selector specificity
- reusable abstractions
- component isolation
- clear naming conventions

Avoid styling patterns that cause:

- specificity wars
- deep selector chains
- component coupling
- style duplication

---

# Architecture: ITCSS

Styles are organized following **ITCSS** from low specificity to high specificity.

Structure:

- Settings
- Tools
- Generic
- Elements
- Objects
- Components
- Utilities

Each layer must only depend on layers above it.

---

# Folder Structure

Example structure:

```txt
src/styles/

settings/
_colors.scss
_spacing.scss
_typography.scss

tools/
_mixins.scss
_functions.scss

generic/
_reset.scss
_normalize.scss
_box-sizing.scss

elements/
_body.scss
_typography.scss
_links.scss
_forms.scss

objects/
_container.scss
_stack.scss
_grid.scss
_cluster.scss

components/
_button.scss
_card.scss
_modal.scss

utilities/
_spacing.scss
_visibility.scss
_text.scss
```

These layers must be imported in this order.

---

# Settings Layer

Contains **global variables and design tokens**.

Examples:

- colors
- spacing scale
- typography scale
- breakpoints
- z-index layers

Example:

```scss
$color-primary: #2563eb;
$color-neutral-900: #111827;

$space-xs: 4px;
$space-sm: 8px;
$space-md: 16px;
$space-lg: 24px;
```

Rules:

- No CSS output allowed.
- Only variables and configuration.

# Tools Layer

Contains mixins and functions.

Examples:

- responsive mixins
- spacing helpers
- color functions

Example:

```scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

Rules:

- No direct CSS output.
- Only tools used by other layers.

# Generic Layer

Global reset and normalization.

Examples:

- reset styles
- box-sizing rules
- global defaults

Example:

```scss
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

Rules:

- Only global normalization rules.
- Avoid opinionated visual styling.

# Elements Layer

Styles for raw HTML elements.

Examples:

- body
- headings
- paragraphs
- links
- form elements

Example:

```scss
h1 {
  font-size: 2rem;
  font-weight: 600;
}
```

Rules:

- Do not apply layout rules here.
- Keep styles minimal and predictable.

# Objects Layer

Objects are layout abstractions.

They are reusable structural patterns.

Examples:

- container
- grid
- stack
- cluster
- media object

Example:

```scss
.o-container {
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: var(--space-md);
}
```

Naming convention:

- `.o-object-name`

Rules:

- Objects must remain visual-style neutral.
- They define layout, not appearance.

# Components Layer

Components represent specific UI pieces.

Examples:

- buttons
- cards
- modals
- navigation
- player-card
- team-list

Naming convention:

- `.c-component-name`

Example:

```scss
.c-player-card {
  background: white;
  border-radius: 8px;
  padding: 16px;

  &__header {
    display: flex;
    align-items: center;
  }

  &__name {
    font-weight: 600;
  }

  &--highlighted {
    border: 2px solid $color-primary;
  }
}
```

Rules:

- Components must follow BEM naming.
- Avoid deep nesting.
- Keep styles scoped.

# Utilities Layer

Utilities are single-purpose helper classes.

Examples:

- spacing helpers
- display utilities
- text alignment
- visibility helpers

Example:

```scss
.u-text-center {
  text-align: center;
}

.u-hidden {
  display: none !important;
}
```

Naming convention:

- `.u-utility-name`

Rules:

- Utilities may use !important only if necessary.
- Utilities must remain extremely small and predictable.

# BEM Naming Convention

All component styles must follow BEM.

Structure:

- `block`
- `block__element`
- `block--modifier`

Example:

```scss
.c-player-card {
  &__avatar {
  }

  &__name {
  }

  &__stats {
  }

  &--highlighted {
  }
}
```

Rules:

- Blocks represent independent components.
- Elements belong to blocks.
- Modifiers change appearance or behavior.

# Nesting Rules

SCSS nesting must remain shallow.

Allowed nesting:

- `block`
- `block__element`
- `block--modifier`

Avoid:

- nesting more than 3 levels
- long chained selectors
- parent overrides

Bad example:

```scss
.player-card .header .avatar img span {
}
```

Good example:

```scss
.c-player-card {
  &__avatar {
  }
}
```

# Angular Component Styling

Each Angular component should have its own stylesheet.

Example:

- `player-card.component.scss`

Rules:

- Component styles should remain scoped.
- Use BEM inside component styles.
- Avoid styling based on DOM hierarchy.
- Prefer class selectors over element selectors.

Example:

```scss
.player-card {
  &__name {
  }
  &__stats {
  }
}
```

# Responsive Design

Use responsive mixins instead of manual media queries scattered everywhere.

Example:

```scss
@include breakpoint(md) {
  .c-player-card {
    padding: 24px;
  }
}
```

Rules:

- Centralize breakpoints in the settings layer.
- Avoid magic breakpoint values.

# Specificity Rules

Maintain low specificity.

Guidelines:

- Avoid IDs in CSS.
- Avoid deep nesting.
- Avoid chained selectors.
- Prefer class-based styling.
- Avoid !important.
- Use !important only in utilities when necessary.

# Reusability Rules

Before creating new styles:

Ask:

- Can an object solve this layout problem?
- Can an existing component be reused?
- Can a utility solve this?

Avoid duplicating styles.

# Styling Anti-Patterns

Do not introduce:

- deep nested selectors
- global overrides for component styles
- styling based on DOM structure
- random utility classes without naming standards
- large SCSS files containing unrelated styles
- component styles depending on global styles implicitly

# File Size Limits

Recommended limits:

- Component SCSS: < 200 lines
- Global style files: < 300 lines

If exceeded:

- extract objects
- extract utilities
- split components

# Refactoring Guidelines

Refactor styles when:

- duplication appears
- specificity grows
- selectors become hard to read
- component styles grow too large

Possible actions:

- extract object
- extract utility
- simplify BEM structure
- reduce nesting

# Accessibility and Styling

Styles must support accessibility.

Ensure:

- sufficient color contrast
- visible focus states
- readable typography
- accessible spacing for touch targets

Never remove focus outlines without replacing them with an accessible alternative.

# Styling Output Expectations

When generating styles:

- follow ITCSS structure
- use BEM naming
- keep selectors shallow
- avoid specificity escalation
- keep styles modular
- prefer reusable layout objects
- keep component styles scoped
