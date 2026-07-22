# Demo Authoring Checklist / Demo 编写清单

Use this checklist when turning a placeholder folder into a runnable demo.

## Files

Recommended static demo layout:

```text
samples/<category>/<demo>/
  README.md
  index.html
  src/
    app.js
    styles.css
  assets/
```

For framework-based demos, add the minimal framework files in the same demo folder and document the commands clearly.

## README Template

```markdown
# Demo Title

Online demo: <source-url>

## What It Shows

Short description.

## Files

- `index.html`
- `src/app.js`
- `src/styles.css`

## Run

Open `index.html` or run the documented local server command.

## Implementation Notes

Mention important SpreadJS APIs and edge cases.
```

## Quality Bar

- The demo should run independently.
- All required local assets should live inside the demo folder.
- Private license keys must not be committed.
- The README should explain anything users must configure themselves.
