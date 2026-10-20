---
name: visual-design
description: Explore or review a frontend visual direction when a new look is requested or an implemented UI feels generic, rigid, or visually inconsistent.
---

# Visual Design

Use this skill for visual direction and visual-quality review. Keep product structure, interaction design, implementation, and ordinary code review with their existing roles.

## Choose the mode

### Direction exploration

Use when the visual direction is new or unclear.

1. Inspect the product purpose, target users, representative content, existing UI, and approved constraints.
2. Choose one representative page that best exposes the core task and visual character.
3. For a new or unclear direction, research current patterns from comparable products while separating evidence from assumptions and avoiding imitation.
4. Create exactly three materially different previews using the same content, information, and core flow. A preview must make composition, typography, spacing, surface treatment, and responsive intent judgeable; labels or mood-board prose alone are insufficient.
5. Explain each direction's concept, representative patterns, UX tradeoffs, provisional color and typography character, accessibility and responsive considerations, and mark one recommendation.
6. Stop with `needs-decision`. Do not expand beyond the representative page or finalize design tokens before the user chooses a direction.

### Design foundation

Use only after a direction is selected. Read `docs/orchestration/gates.md` and specify only the selected direction's semantic light/dark colors, typography roles, and any necessary spacing, radius, shadow, icon, and motion principles. Stop with `needs-decision` for approval before treating the preview as final implementation.

### Visual review

Use after a visual direction, design foundation, shared UI base, or substantial screen styling is implemented. Read [the visual-quality rubric](references/visual-quality-rubric.md). Inspect the actual rendered UI at representative desktop and mobile widths; source inspection alone cannot produce a visual pass. Report concrete regressions and improvement opportunities with evidence, user impact, and a specific correction.

## Boundaries

- Preserve the user's approved direction and existing design system unless the user requests a new direction.
- The visual designer is the domain Designer for the visual-direction and Design Foundation gates. A UX designer may supply information architecture, flow, state, and copy inputs but must not duplicate the three previews or foundation.
- A visual designer may write only preview artifacts or design documents explicitly assigned to it. It must not edit production application code.
- Prefer hierarchy, rhythm, and content clarity over decoration. Treat gradients, glass effects, pills, shadows, and animation as tools rather than default styling.
- Do not convert subjective taste into a blocking issue without a task, usability, consistency, responsive, or accessibility basis.
