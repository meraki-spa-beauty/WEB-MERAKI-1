# MERAKI engineering rules

These rules are the repository-level coding contract. They combine the anti-slop TypeScript/JavaScript discipline with the Thermos audit workflow.

## Source standards

- Anti-slop: `dmmulroy/anti-slop` (vendored-policy source: https://github.com/dmmulroy/anti-slop)
- Thermos: `cursor/plugins/thermos` (audit workflow: https://github.com/cursor/plugins/tree/main/thermos)

## Code rules

1. Prefer evidence-preserving types. Do not widen a known value and then assert it back to a narrower type.
2. Do not chain type assertions to manufacture type evidence.
3. Do not use `object` as a function parameter type. Define the actual contract.
4. Do not accept arbitrary `unknown` inputs as a substitute for a boundary contract. Parse and validate at boundaries.
5. Do not hide `unknown` behind type aliases or unsafe dictionary types.
6. Do not use ad-hoc runtime `typeof` narrowing where a real parser/validator boundary is appropriate.
7. Avoid conditional spreads whose false branch is `{}`; construct the intended shape explicitly.
8. Avoid unnecessary intermediate collection passes such as `filter(...).map(...)` when one pass communicates the intent better.
9. Avoid accumulator-copy patterns in reducers when a direct, explicit construction is clearer and cheaper.
10. Do not use module mocking as a substitute for explicit dependency boundaries.
11. Keep modules cohesive. Do not grow monolithic components or files when a named boundary makes the design clearer.
12. Prefer explicit domain types and small, composable React components over generic utility abstractions.
13. Accessibility is part of correctness: semantic HTML, keyboard access, visible focus, labels, and reduced-motion behavior are required where applicable.
14. Do not introduce dependencies unless they solve a concrete problem and their maintenance/supply-chain cost is understood.
15. Never commit secrets, Firebase service-account credentials, API keys, or generated environment files.

## UI / anti-slop rules

- Do not generate generic template sections just because they are conventional.
- Every visual section must have a reason tied to Meraki's brand, content, or user journey.
- Reuse the Meraki design tokens instead of inventing arbitrary colors, radii, shadows, or typography.
- Avoid decorative complexity that does not improve hierarchy, meaning, or interaction.
- Prefer distinctive editorial composition over a repeated hero/cards/CTA template.
- Preserve real brand assets and content; never fabricate official logos, photography, claims, prices, or business details.

## Before changing code

- Read the relevant module and its callers.
- Identify the smallest coherent change.
- Preserve public behavior unless the task explicitly changes it.
- Update tests/docs when the contract changes.

## Before shipping

Run the repository's available typecheck/build/tests. For non-trivial changes, perform a Thermos-style review focused on:

1. security and trust boundaries;
2. correctness and failure modes;
3. maintainability and unnecessary complexity;
4. component/module boundaries and file growth;
5. accessibility and responsive behavior for UI changes;
6. dependency and supply-chain impact;
7. whether the diff solves the requested problem without unrelated churn.

Do not declare a change production-ready when validation has not actually been run.
