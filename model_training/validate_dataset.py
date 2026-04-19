from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


REQUIRED_ASSISTANT_KEYS = {
    "primary_diagnosis",
    "alternative_diagnoses",
    "clinical_reasoning",
    "treatment",
    "risk_level",
    "referral_required",
    "safety_note",
}

VALID_ROLES = {"system", "user", "assistant"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate MediScribe SFT JSONL files.")
    parser.add_argument(
        "paths",
        nargs="*",
        default=[
            "model_training/data/training_splits/train.jsonl",
            "model_training/data/training_splits/eval.jsonl",
        ],
        help="JSONL files to validate.",
    )
    return parser.parse_args()


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        raise FileNotFoundError(f"Missing dataset file: {path}")

    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            stripped = line.strip()
            if not stripped:
                continue
            try:
                rows.append(json.loads(stripped))
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path}:{line_number} is not valid JSON: {exc}") from exc
    return rows


def validate_record(record: dict[str, Any], path: Path, index: int) -> None:
    messages = record.get("messages")
    if not isinstance(messages, list) or len(messages) < 3:
        raise ValueError(f"{path}:{index} must contain at least system, user, assistant messages.")

    roles = [message.get("role") for message in messages if isinstance(message, dict)]
    if len(roles) != len(messages) or any(role not in VALID_ROLES for role in roles):
        raise ValueError(f"{path}:{index} has invalid chat roles: {roles}")

    if roles[0] != "system" or roles[-1] != "assistant":
        raise ValueError(f"{path}:{index} must start with system and end with assistant.")

    for message in messages:
        content = message.get("content") if isinstance(message, dict) else None
        if not isinstance(content, str) or not content.strip():
            raise ValueError(f"{path}:{index} contains an empty message.")

    assistant_content = messages[-1]["content"]
    try:
        assistant_payload = json.loads(assistant_content)
    except json.JSONDecodeError as exc:
        raise ValueError(f"{path}:{index} assistant content must be JSON: {exc}") from exc

    missing = sorted(REQUIRED_ASSISTANT_KEYS - set(assistant_payload))
    if missing:
        raise ValueError(f"{path}:{index} assistant payload missing keys: {', '.join(missing)}")

    if assistant_payload["risk_level"] not in {"green", "yellow", "red"}:
        raise ValueError(f"{path}:{index} risk_level must be green, yellow, or red.")

    if not isinstance(assistant_payload["alternative_diagnoses"], list):
        raise ValueError(f"{path}:{index} alternative_diagnoses must be a list.")


def main() -> None:
    args = parse_args()
    total_rows = 0
    red_rows = 0

    for raw_path in args.paths:
        path = Path(raw_path)
        rows = read_jsonl(path)
        for index, record in enumerate(rows, start=1):
            validate_record(record, path, index)
            total_rows += 1
            if record.get("metadata", {}).get("risk_level") == "red":
                red_rows += 1
        print(f"Validated {len(rows)} rows in {path}")

    if total_rows == 0:
        raise ValueError("No dataset rows were found.")

    print(f"Dataset validation passed: {total_rows} rows, {red_rows} red-risk rows.")


if __name__ == "__main__":
    main()
