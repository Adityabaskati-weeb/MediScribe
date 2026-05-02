from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        return rows
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            stripped = line.strip()
            if stripped:
                rows.append(json.loads(stripped))
    return rows


def main() -> None:
    train_rows = read_jsonl(Path("model_training/data/training_splits/train.jsonl"))
    eval_rows = read_jsonl(Path("model_training/data/training_splits/eval.jsonl"))
    benchmark_results_path = Path("model_training/outputs/mediscribe-medical-adapter/benchmarks/benchmark_results.json")
    output_dir = Path("model_training/outputs")
    output_dir.mkdir(parents=True, exist_ok=True)

    metrics: dict[str, Any] = {
        "benchmark_type": "dataset_and_adapter_summary",
        "train_rows": len(train_rows),
        "eval_rows": len(eval_rows),
        "total_rows": len(train_rows) + len(eval_rows),
        "red_risk_rows": sum(
            1
            for row in [*train_rows, *eval_rows]
            if json.loads(row["messages"][-1]["content"]).get("risk_level") == "red"
        ),
    }

    lines = [
        "# MediScribe Fine-Tuning Evaluation Summary",
        "",
        f"- Train rows: {metrics['train_rows']}",
        f"- Eval rows: {metrics['eval_rows']}",
        f"- Total rows: {metrics['total_rows']}",
        f"- Red-risk rows: {metrics['red_risk_rows']}",
    ]

    if benchmark_results_path.exists():
        benchmark = json.loads(benchmark_results_path.read_text(encoding="utf-8"))
        summary = benchmark.get("summary", {})
        metrics.update(
            {
                "benchmark_cases": summary.get("benchmark_cases", 0),
                "primary_hit_rate": summary.get("primary_hit_rate", 0),
                "top3_hit_rate": summary.get("top3_hit_rate", 0),
                "red_flag_recall": summary.get("red_flag_recall", 0),
                "risk_match_rate": summary.get("risk_match_rate", 0),
                "average_inference_seconds": summary.get("average_inference_seconds", 0),
                "benchmark_failures": summary.get("benchmark_failures", 0),
            }
        )
        lines.extend(
            [
                "",
                "## Adapter Benchmark",
                "",
                f"- Benchmark cases: {metrics['benchmark_cases']}",
                f"- Primary diagnosis hit rate: {metrics['primary_hit_rate']:.0%}",
                f"- Top-3 diagnosis hit rate: {metrics['top3_hit_rate']:.0%}",
                f"- Red-flag recall: {metrics['red_flag_recall']:.0%}",
                f"- Risk match rate: {metrics['risk_match_rate']:.0%}",
                f"- Average inference seconds: {metrics['average_inference_seconds']}",
                f"- Benchmark failures: {metrics['benchmark_failures']}",
            ]
        )
    else:
        lines.extend(
            [
                "",
                "## Adapter Benchmark",
                "",
                "No adapter benchmark artifacts were found yet. Run `model_training/train.py`",
                "without `--skip-benchmark` after a real GPU fine-tuning job to publish",
                "adapter-level metrics.",
            ]
        )

    (output_dir / "metrics.json").write_text(json.dumps(metrics, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    (output_dir / "evaluation_report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(metrics, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
