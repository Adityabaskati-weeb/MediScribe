from __future__ import annotations

from pathlib import Path


def main() -> None:
    output = Path("model_training/outputs/finetuned_model/README.md")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        "# MediScribe Fine-Tuned Model Placeholder\n\n"
        "Run a real Gemma fine-tuning job here once GPU infrastructure is available.\n"
        "The application already supports Ollama/Gemma inference with deterministic guardrail fallback.\n",
        encoding="utf-8",
    )
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
