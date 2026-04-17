# playbook-native

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Execute `.playbook.md` files as GitHub Action steps with a standalone Node runtime. No dependency on `anthropics/claude-code-action`; calls the Anthropic SDK directly, step by step.

Pairs with **[`PLAYBOOK-MD/playbook-run`](https://github.com/PLAYBOOK-MD/playbook-run)** (composite variant). Inputs and outputs are identical; swap `uses:` to switch runtimes.

## When to choose `playbook-native`

- You want pinned wire behavior and deterministic post-step job-summary logs.
- Your playbook does not use MCP-dependent directives (`@tool(mcp:...)`, `@prompt(mcp:...)`, `@prompt(library:...)`). If it does, use `playbook-run` instead.
- You can't or don't want to use `anthropics/claude-code-action`.

## Quick start

```yaml
name: Run playbook
on: [workflow_dispatch]
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: PLAYBOOK-MD/playbook-native@v1
        with:
          playbook: playbooks/greet.playbook.md
          inputs: |
            greeting: Hello
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `playbook` | yes | — | Path to the `.playbook.md` file |
| `inputs` | no | `` | YAML block of input values |
| `elicit` | no | `` | YAML block of `@elicit` overrides keyed by step number |
| `output-path` | no | `out/<run-id>.md` | Destination for the final artifact |
| `model` | no | `claude-opus-4-7` | Anthropic model ID |
| `strict` | no | `false` | Fail on validation warnings |

## Outputs

| Output | Description |
|---|---|
| `artifact-path` | Path to the written artifact |
| `status` | `ok`, `failed`, or `skipped` |
| `step-count` | Number of steps executed |
| `warnings` | Number of warnings emitted |

## Capability split vs `playbook-run`

See the [ecosystem guide](https://docs.playbook.style/guides/github-actions/) for the full compatibility matrix. Short version: native supports everything except MCP directives.

## Examples

See `examples/` for PR-review, scheduled, and `workflow_dispatch` workflows.
