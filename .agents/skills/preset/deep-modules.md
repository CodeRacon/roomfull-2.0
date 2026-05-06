---
name: deep-modules
description: >
  Favor deep modules with minimal APIs by grouping related logic behind clear boundaries and hiding internal complexity.
---

# deep-modules.md

Prefer few strong modules over many shallow helpers.

A deep module has:

- simple public interface
- hidden internal complexity
- clear responsibility

When improving structure:

1. find logic that belongs together
2. group behind boundary
3. expose minimal API
4. hide implementation details
5. add tests at boundary

Avoid utility-file sprawl.
