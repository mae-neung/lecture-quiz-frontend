# Visual Quality Rubric

Use this rubric only for visual review of an implemented interface.

## Evidence

- Inspect the rendered page at representative desktop and mobile widths and record the browser and viewport.
- Exercise the states affected by the change, including hover, focus, disabled, loading, empty, and error states when they exist.
- Use realistic short, long, and missing content when layout stability depends on content length.
- If rendering is unavailable, report the review as `not-run`; do not infer a visual pass from source code.

## Review dimensions

1. **Composition and hierarchy:** the first focal point, primary action, grouping, scan path, and density match the user's task.
2. **Typography:** role, size, weight, line height, measure, and Korean/Latin pairing create a legible and deliberate hierarchy.
3. **Spacing and alignment:** spacing follows a coherent rhythm, related elements group together, and alignment does not drift across components.
4. **Color, surfaces, and depth:** semantic colors, contrast, borders, radius, and elevation distinguish importance and state without visual noise.
5. **Component coherence:** repeated components share anatomy and behavior while primary and secondary content do not become mechanically identical boxes.
6. **Interaction and motion:** affordances, feedback, focus, and transitions are clear, restrained, and compatible with reduced-motion preferences.
7. **Responsive behavior:** information priority survives reflow, touch targets remain usable, and content does not clip, overflow, or create accidental horizontal scrolling.
8. **Direction fidelity:** the implementation follows the approved preview and foundation rather than drifting toward framework defaults or unrelated trends.

Repeated borders around every section, uniform cards, excessive bold text, arbitrary gradients, indiscriminate pills, decorative glass effects, and motion without feedback value are review signals, not automatic failures. Judge them by hierarchy, consistency, readability, and task impact.

## Findings

For each finding, provide:

- severity: `blocking` or `improvement`
- rendered evidence and location
- the violated approved decision or review dimension
- user or product impact
- a concrete correction

Use `blocking` only for a clear task failure, approved-foundation violation, material visual inconsistency, responsive breakage, or accessibility problem. End with an overall `pass`, `pass-with-improvements`, or `blocked` decision and list any untested states.
