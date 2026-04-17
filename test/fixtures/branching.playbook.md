# Branching Test

## INPUTS
- `kind` (string): The kind

## STEP 1: Classify
Emit the word "bug" or "feature".
@output(classification)

## STEP 2: Act

```if classification == "bug"```
Handle as bug.
```endif```

```elif classification == "feature"```
Handle as feature.
```endif```
