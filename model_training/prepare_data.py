from __future__ import annotations

import csv
import json
from pathlib import Path


def main() -> None:
    source = Path("model_training/data/medical_dataset.csv")
    output = Path("model_training/data/training_splits/train.jsonl")
    output.parent.mkdir(parents=True, exist_ok=True)
    with source.open(newline="", encoding="utf-8") as handle, output.open("w", encoding="utf-8") as out:
      for row in csv.DictReader(handle):
          prompt = {
              "instruction": "Analyze this rural clinic case and return safe triage guidance.",
              "input": {
                  "patient_info": row["patient_info"],
                  "symptoms": row["symptoms"],
                  "vitals": row["vitals"],
                  "medical_history": row["medical_history"],
              },
              "output": {
                  "primary_diagnosis": row["primary_diagnosis"],
                  "alternative_diagnoses": row["alternative_diagnoses"],
                  "clinical_reasoning": row["clinical_reasoning"],
                  "treatment": row["treatment"],
              },
          }
          out.write(json.dumps(prompt) + "\n")
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
