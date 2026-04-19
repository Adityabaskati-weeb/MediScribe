from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Iterable


REQUIRED_COLUMNS = {
    "patient_info",
    "symptoms",
    "vitals",
    "medical_history",
    "primary_diagnosis",
    "alternative_diagnoses",
    "clinical_reasoning",
    "treatment",
}

SYSTEM_PROMPT = (
    "You are MediScribe, an offline clinical decision-support assistant for "
    "rural health workers. Return conservative, safety-first JSON only. "
    "Escalate red flags, avoid unsupported certainty, and use plain language."
)


def normalize_list(value: str) -> list[str]:
    return [item.strip() for item in value.split(";") if item.strip()]


def risk_level(treatment: str, symptoms: str, vitals: str) -> str:
    text = f"{treatment} {symptoms} {vitals}".lower()
    emergency_terms = [
        "urgent",
        "immediate",
        "referral",
        "chest pain",
        "spo2 88",
        "bp 84",
        "stroke",
        "bleeding gums",
        "postpartum",
    ]
    if any(term in text for term in emergency_terms):
        return "red"
    if any(term in text for term in ["same-day", "monitor", "warning"]):
        return "yellow"
    return "green"


def referral_required(treatment: str, level: str) -> bool:
    return level == "red" or any(
        term in treatment.lower() for term in ["urgent", "immediate", "referral"]
    )


def build_user_prompt(row: dict[str, str]) -> str:
    return "\n".join(
        [
            "Analyze this rural clinic case.",
            f"Patient: {row['patient_info']}",
            f"Symptoms: {row['symptoms']}",
            f"Vitals: {row['vitals']}",
            f"Medical history: {row['medical_history']}",
            "Return JSON with diagnosis, reasoning, treatment, risk level, and referral guidance.",
        ]
    )


def build_record(row: dict[str, str], case_id: int) -> dict[str, object]:
    level = risk_level(row["treatment"], row["symptoms"], row["vitals"])
    assistant_payload = {
        "primary_diagnosis": row["primary_diagnosis"],
        "alternative_diagnoses": normalize_list(row["alternative_diagnoses"]),
        "clinical_reasoning": row["clinical_reasoning"],
        "treatment": row["treatment"],
        "risk_level": level,
        "referral_required": referral_required(row["treatment"], level),
        "safety_note": (
            "Refer or escalate before relying on AI output when red flags are present."
            if level == "red"
            else "Continue monitoring and reassess if symptoms worsen."
        ),
    }
    return {
        "id": f"mediscribe-case-{case_id:04d}",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(row)},
            {"role": "assistant", "content": json.dumps(assistant_payload, sort_keys=True)},
        ],
        "metadata": {
            "source": "curated-rural-clinic-cases",
            "risk_level": level,
            "primary_diagnosis": row["primary_diagnosis"],
        },
    }


def validate_columns(fieldnames: Iterable[str] | None) -> None:
    columns = set(fieldnames or [])
    missing = sorted(REQUIRED_COLUMNS - columns)
    if missing:
        raise ValueError(f"medical_dataset.csv is missing required columns: {', '.join(missing)}")


def write_jsonl(path: Path, rows: list[dict[str, object]]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=True) + "\n")


def main() -> None:
    source = Path("model_training/data/medical_dataset.csv")
    output_dir = Path("model_training/data/training_splits")
    output_dir.mkdir(parents=True, exist_ok=True)

    with source.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        validate_columns(reader.fieldnames)
        records = [build_record(row, index + 1) for index, row in enumerate(reader)]

    if not records:
        raise ValueError("medical_dataset.csv does not contain any training rows.")

    eval_count = 1 if len(records) > 4 else 0
    train_rows = records[:-eval_count] if eval_count else records
    eval_rows = records[-eval_count:] if eval_count else []

    write_jsonl(output_dir / "train.jsonl", train_rows)
    write_jsonl(output_dir / "eval.jsonl", eval_rows)
    write_jsonl(output_dir / "all.jsonl", records)

    print(f"Wrote {len(train_rows)} train rows to {output_dir / 'train.jsonl'}")
    print(f"Wrote {len(eval_rows)} eval rows to {output_dir / 'eval.jsonl'}")
    print(f"Wrote {len(records)} total rows to {output_dir / 'all.jsonl'}")


if __name__ == "__main__":
    main()
