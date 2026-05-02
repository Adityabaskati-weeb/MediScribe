from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any, Iterable


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

SCENARIO_DIAGNOSES: dict[str, dict[str, Any]] = {
    "acute coronary": {
        "primary_diagnosis": "Acute coronary syndrome",
        "alternative_diagnoses": ["Pulmonary embolism", "Aortic syndrome"],
        "treatment": "Immediate referral, ECG, aspirin if safe, repeat vitals, and do not delay transport.",
    },
    "stroke": {
        "primary_diagnosis": "Acute stroke or TIA",
        "alternative_diagnoses": ["Seizure postictal state", "Intracranial event"],
        "treatment": "Record last-known-well time, check glucose, urgent referral, and protect airway during transport.",
    },
    "postpartum": {
        "primary_diagnosis": "Postpartum emergency",
        "alternative_diagnoses": ["Postpartum preeclampsia", "Postpartum hemorrhage"],
        "treatment": "Urgent obstetric referral, repeat blood pressure, monitor bleeding, and prepare emergency transfer.",
    },
    "pregnancy": {
        "primary_diagnosis": "Pregnancy emergency warning signs",
        "alternative_diagnoses": ["Placental complication", "Maternal hemorrhage"],
        "treatment": "Urgent maternal referral, monitor bleeding, avoid delay, and keep transport ready.",
    },
    "pneumonia": {
        "primary_diagnosis": "Pneumonia or acute respiratory infection",
        "alternative_diagnoses": ["Sepsis", "Asthma exacerbation"],
        "treatment": "Check oxygen, urgent referral if saturation remains low, repeat respiratory vitals, and give supportive care per protocol.",
    },
    "respiratory": {
        "primary_diagnosis": "Respiratory infection",
        "alternative_diagnoses": ["Pneumonia", "Viral upper respiratory illness"],
        "treatment": "Same-day review, repeat vitals, hydration advice, and escalate if breathing worsens.",
    },
    "infant": {
        "primary_diagnosis": "Infant danger sign illness",
        "alternative_diagnoses": ["Sepsis", "Severe pneumonia"],
        "treatment": "Immediate referral, keep infant warm, support feeding if safe, and do not delay transport.",
    },
    "pediatric": {
        "primary_diagnosis": "Pediatric danger-sign illness",
        "alternative_diagnoses": ["Pneumonia", "Dehydration"],
        "treatment": "Same-day pediatric review, hydration assessment, repeat vitals, and escalate if feeding or breathing worsens.",
    },
    "dengue": {
        "primary_diagnosis": "Dengue with warning signs",
        "alternative_diagnoses": ["Malaria", "Leptospirosis"],
        "treatment": "Avoid NSAIDs, assess hydration, same-day review, and refer if bleeding or shock signs increase.",
    },
    "sepsis": {
        "primary_diagnosis": "Sepsis or serious infection",
        "alternative_diagnoses": ["Pneumonia", "Undifferentiated infection"],
        "treatment": "Immediate referral, repeat vitals, treat as possible sepsis, and do not wait for confirmatory tests before escalation.",
    },
    "asthma": {
        "primary_diagnosis": "Asthma or obstructive airway exacerbation",
        "alternative_diagnoses": ["Respiratory infection", "Allergic reaction"],
        "treatment": "Bronchodilator per local protocol, reassess oxygen and breathing effort, and escalate if symptoms persist.",
    },
    "obstructive": {
        "primary_diagnosis": "Asthma or obstructive airway exacerbation",
        "alternative_diagnoses": ["Respiratory infection", "Allergic reaction"],
        "treatment": "Bronchodilator per local protocol, reassess oxygen and breathing effort, and escalate if symptoms persist.",
    },
    "anaphylaxis": {
        "primary_diagnosis": "Anaphylaxis or severe allergic reaction",
        "alternative_diagnoses": ["Asthma exacerbation", "Shock"],
        "treatment": "Urgent referral, support airway, use emergency allergy protocol if available, and monitor circulation closely.",
    },
    "allergic": {
        "primary_diagnosis": "Anaphylaxis or severe allergic reaction",
        "alternative_diagnoses": ["Asthma exacerbation", "Shock"],
        "treatment": "Urgent referral, support airway, use emergency allergy protocol if available, and monitor circulation closely.",
    },
    "diabetic ketoacidosis": {
        "primary_diagnosis": "Diabetic ketoacidosis risk",
        "alternative_diagnoses": ["Severe hyperglycemia", "Gastroenteritis with dehydration"],
        "treatment": "Urgent clinician review, monitor glucose and hydration, and refer if vomiting or weakness progresses.",
    },
    "snake bite": {
        "primary_diagnosis": "Snake bite envenomation risk",
        "alternative_diagnoses": ["Shock", "Soft tissue injury"],
        "treatment": "Immediate referral, immobilize the limb, avoid harmful first-aid measures, and monitor shock signs.",
    },
    "envenomation": {
        "primary_diagnosis": "Snake bite envenomation risk",
        "alternative_diagnoses": ["Shock", "Soft tissue injury"],
        "treatment": "Immediate referral, immobilize the limb, avoid harmful first-aid measures, and monitor shock signs.",
    },
    "undifferentiated": {
        "primary_diagnosis": "Undifferentiated primary-care presentation",
        "alternative_diagnoses": ["Needs focused history", "Needs repeat vitals"],
        "treatment": "Repeat vitals, gather more history, give safety-net advice, and refer sooner if red flags appear.",
    },
}


def normalize_list(value: str) -> list[str]:
    return [item.strip() for item in value.split(";") if item.strip()]


def normalize_text_list(value: Iterable[str] | None) -> list[str]:
    return [str(item).strip() for item in (value or []) if str(item).strip()]


def validate_columns(fieldnames: Iterable[str] | None) -> None:
    columns = set(fieldnames or [])
    missing = sorted(REQUIRED_COLUMNS - columns)
    if missing:
        raise ValueError(f"medical_dataset.csv is missing required columns: {', '.join(missing)}")


def build_user_prompt(
    patient: str,
    symptoms: str,
    vitals: str,
    medical_history: str,
    notes: str | None = None,
) -> str:
    lines = [
        "Analyze this rural clinic case.",
        f"Patient: {patient}",
        f"Symptoms: {symptoms}",
        f"Vitals: {vitals}",
        f"Medical history: {medical_history}",
    ]
    if notes:
        lines.append(f"Notes: {notes}")
    lines.append("Return JSON with diagnosis, reasoning, treatment, risk level, and referral guidance.")
    return "\n".join(lines)


def build_assistant_payload(
    primary_diagnosis: str,
    alternative_diagnoses: list[str],
    clinical_reasoning: str,
    treatment: str,
    risk: str,
) -> dict[str, Any]:
    return {
        "primary_diagnosis": primary_diagnosis,
        "alternative_diagnoses": alternative_diagnoses,
        "clinical_reasoning": clinical_reasoning,
        "treatment": treatment,
        "risk_level": risk,
        "referral_required": risk == "red" or "refer" in treatment.lower() or "urgent" in treatment.lower() or "immediate" in treatment.lower(),
        "safety_note": (
            "Refer or escalate before relying on AI output when red flags are present."
            if risk == "red"
            else "Continue monitoring and reassess if symptoms worsen."
        ),
    }


def csv_risk_level(treatment: str, symptoms: str, vitals: str) -> str:
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


def build_csv_record(row: dict[str, str], case_id: int) -> dict[str, object]:
    risk = csv_risk_level(row["treatment"], row["symptoms"], row["vitals"])
    assistant_payload = build_assistant_payload(
        primary_diagnosis=row["primary_diagnosis"],
        alternative_diagnoses=normalize_list(row["alternative_diagnoses"]),
        clinical_reasoning=row["clinical_reasoning"],
        treatment=row["treatment"],
        risk=risk,
    )
    return {
        "id": f"mediscribe-case-{case_id:04d}",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": build_user_prompt(
                    patient=row["patient_info"],
                    symptoms=row["symptoms"],
                    vitals=row["vitals"],
                    medical_history=row["medical_history"],
                ),
            },
            {"role": "assistant", "content": json.dumps(assistant_payload, sort_keys=True)},
        ],
        "metadata": {
            "source": "curated-rural-clinic-cases",
            "risk_level": risk,
            "primary_diagnosis": row["primary_diagnosis"],
        },
    }


def summarize_patient(patient: dict[str, Any]) -> str:
    bits = [f"{patient.get('age_years', 'unknown')} year old", patient.get("gender", "unknown")]
    if patient.get("pregnancy_weeks") is not None:
        bits.append(f"{patient['pregnancy_weeks']} weeks pregnant")
    if patient.get("postpartum_days") is not None:
        bits.append(f"postpartum day {patient['postpartum_days']}")
    known_conditions = normalize_text_list(patient.get("known_conditions"))
    if known_conditions:
        bits.append(f"known conditions: {', '.join(known_conditions)}")
    allergies = normalize_text_list(patient.get("allergies"))
    if allergies:
        bits.append(f"allergies: {', '.join(allergies)}")
    return ", ".join(bits)


def summarize_vitals(vitals: dict[str, Any]) -> str:
    labels = {
        "systolic_bp": "SBP",
        "diastolic_bp": "DBP",
        "heart_rate": "HR",
        "oxygen_saturation": "SpO2",
        "respiratory_rate": "RR",
        "temperature_c": "Temp C",
        "glucose_mg_dl": "Glucose",
    }
    pairs: list[str] = []
    if vitals.get("systolic_bp") is not None or vitals.get("diastolic_bp") is not None:
        pairs.append(f"BP {vitals.get('systolic_bp', '--')}/{vitals.get('diastolic_bp', '--')}")
    for key, label in labels.items():
        if key in {"systolic_bp", "diastolic_bp"}:
            continue
        value = vitals.get(key)
        if value is not None:
            suffix = "%" if key == "oxygen_saturation" else ""
            pairs.append(f"{label} {value}{suffix}")
    return ", ".join(pairs) if pairs else "No vitals recorded"


def pick_template(expected_keywords: Iterable[str]) -> dict[str, Any]:
    lowered = [keyword.lower() for keyword in expected_keywords]
    for keyword in lowered:
        if keyword in SCENARIO_DIAGNOSES:
            return SCENARIO_DIAGNOSES[keyword]
    return SCENARIO_DIAGNOSES["undifferentiated"]


def scenario_risk(expected_urgency: str, expected_red_flag: bool) -> str:
    if expected_red_flag or expected_urgency in {"immediate", "emergent"}:
        return "red"
    if expected_urgency == "urgent":
        return "yellow"
    return "green"


def scenario_reasoning(
    complaint: str,
    symptoms: list[str],
    vitals: dict[str, Any],
    category: str,
    expected_urgency: str,
) -> str:
    symptom_text = ", ".join(symptoms[:3]) if symptoms else "limited symptoms"
    vital_text = summarize_vitals(vitals)
    return (
        f"{complaint} with {symptom_text} fits a {category} presentation. "
        f"Key vitals: {vital_text}. This case needs {expected_urgency} attention."
    )


def scenario_notes(scenario: dict[str, Any]) -> str | None:
    intake = scenario.get("intake", {})
    notes = normalize_text_list(intake.get("notes"))
    parts = [f"Category: {scenario.get('category', 'general')}"]
    if intake.get("language"):
        parts.append(f"Language: {intake['language']}")
    if intake.get("offline_captured"):
        parts.append("Captured offline")
    parts.extend(notes)
    return "; ".join(parts)


def build_scenario_record(scenario: dict[str, Any]) -> dict[str, object]:
    intake = scenario["intake"]
    patient = intake.get("patient", {})
    symptoms = normalize_text_list(intake.get("symptoms"))
    vitals = intake.get("vitals", {})
    template = pick_template(scenario.get("expectedDiagnosisKeywords", []))
    risk = scenario_risk(scenario.get("expectedUrgency", "routine"), bool(scenario.get("expectedRedFlag")))
    reasoning = scenario_reasoning(
        complaint=intake.get("chief_complaint", "Needs assessment"),
        symptoms=symptoms,
        vitals=vitals,
        category=scenario.get("category", "general"),
        expected_urgency=scenario.get("expectedUrgency", "routine"),
    )
    treatment = template["treatment"]
    if risk == "yellow" and "same-day review" not in treatment.lower():
        treatment = f"{treatment} Same-day review is recommended."
    assistant_payload = build_assistant_payload(
        primary_diagnosis=template["primary_diagnosis"],
        alternative_diagnoses=list(template["alternative_diagnoses"]),
        clinical_reasoning=reasoning,
        treatment=treatment,
        risk=risk,
    )
    return {
        "id": scenario.get("id"),
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": build_user_prompt(
                    patient=summarize_patient(patient),
                    symptoms=", ".join([intake.get("chief_complaint", ""), *symptoms]).strip(", "),
                    vitals=summarize_vitals(vitals),
                    medical_history=", ".join(normalize_text_list(patient.get("known_conditions"))) or "none reported",
                    notes=scenario_notes(scenario),
                ),
            },
            {"role": "assistant", "content": json.dumps(assistant_payload, sort_keys=True)},
        ],
        "metadata": {
            "source": "evaluation-scenarios",
            "scenario_name": scenario.get("name"),
            "category": scenario.get("category"),
            "risk_level": risk,
            "primary_diagnosis": assistant_payload["primary_diagnosis"],
        },
    }


def read_json(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8-sig"))


def dedupe_records(records: list[dict[str, object]]) -> list[dict[str, object]]:
    deduped: list[dict[str, object]] = []
    seen_ids: set[str] = set()
    for record in records:
        record_id = str(record["id"])
        if record_id in seen_ids:
            continue
        seen_ids.add(record_id)
        deduped.append(record)
    return deduped


def split_records(records: list[dict[str, object]]) -> tuple[list[dict[str, object]], list[dict[str, object]]]:
    eval_count = max(4, round(len(records) * 0.2)) if len(records) > 8 else 1
    if eval_count >= len(records):
        eval_count = max(1, len(records) // 4)
    return records[:-eval_count], records[-eval_count:]


def write_jsonl(path: Path, rows: list[dict[str, object]]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=True) + "\n")


def main() -> None:
    source = Path("model_training/data/medical_dataset.csv")
    scenarios_path = Path("model_training/data/evaluation_scenarios.json")
    output_dir = Path("model_training/data/training_splits")
    output_dir.mkdir(parents=True, exist_ok=True)

    with source.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        validate_columns(reader.fieldnames)
        csv_records = [build_csv_record(row, index + 1) for index, row in enumerate(reader)]

    scenario_records = [build_scenario_record(row) for row in read_json(scenarios_path)]
    records = dedupe_records([*csv_records, *scenario_records])

    if not records:
        raise ValueError("No training rows were generated.")

    train_rows, eval_rows = split_records(records)

    write_jsonl(output_dir / "train.jsonl", train_rows)
    write_jsonl(output_dir / "eval.jsonl", eval_rows)
    write_jsonl(output_dir / "all.jsonl", records)

    print(f"Wrote {len(train_rows)} train rows to {output_dir / 'train.jsonl'}")
    print(f"Wrote {len(eval_rows)} eval rows to {output_dir / 'eval.jsonl'}")
    print(f"Wrote {len(records)} total rows to {output_dir / 'all.jsonl'}")


if __name__ == "__main__":
    main()
