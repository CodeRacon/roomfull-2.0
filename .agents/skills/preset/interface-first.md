---
name: interface-first
description: >
  Define module interfaces, invariants, and error behavior before implementation details to keep boundaries clear and reviewable.
---

# interface-first.md

Before implementing internals:

Define:

- responsibility
- inputs
- outputs
- error behavior
- invariants
- examples of use

Then design smallest useful API.

Only then implement internals.

Humans should review interfaces carefully.
Implementation can be delegated more aggressively.
