# Shared parity vectors

This directory mirrors `playbook-run/test/vectors/` byte-for-byte. Any change here must be ported to the other repo (and vice versa) in the same PR. Both repos' CI runs the vector suite; if either drifts, both fail.

Each vector is one subdirectory containing:
- `playbook.playbook.md` — the input playbook
- `inputs.yaml` — the input values
- `expected-output.md` — substring assertion (the final artifact must CONTAIN this content; exact match is too brittle with real models)
