# Uses MCP

## INPUTS
- `topic` (string): Subject

## STEP 1: Fetch
@tool(github, get_issue)
Fetch issue info for {{topic}}.
