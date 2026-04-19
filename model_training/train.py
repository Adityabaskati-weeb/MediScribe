# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "unsloth",
#     "unsloth_zoo",
#     "torch",
#     "datasets",
#     "trl>=0.22.0",
#     "transformers>=4.57.0",
#     "accelerate",
#     "bitsandbytes",
#     "huggingface_hub[hf_transfer]",
#     "trackio",
#     "tensorboard",
# ]
# ///
from __future__ import annotations

import argparse
import inspect
import json
import os
import sys
import tempfile
import time
import urllib.request
from pathlib import Path
from typing import Any


DEFAULT_BASE_MODEL = "google/gemma-4-E4B-it"
DEFAULT_TRAIN_FILE = "model_training/data/training_splits/train.jsonl"
DEFAULT_EVAL_FILE = "model_training/data/training_splits/eval.jsonl"
DEFAULT_OUTPUT_DIR = "model_training/outputs/mediscribe-medical-adapter"
DEFAULT_TARGET_MODULES = "q_proj,k_proj,v_proj,o_proj,gate_proj,up_proj,down_proj"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fine-tune the MediScribe medical adapter with Unsloth LoRA."
    )
    parser.add_argument("--base-model", default=DEFAULT_BASE_MODEL)
    parser.add_argument("--train-file", default=DEFAULT_TRAIN_FILE)
    parser.add_argument("--eval-file", default=DEFAULT_EVAL_FILE)
    parser.add_argument("--train-url", default=None, help="Remote JSONL train file for HF Jobs.")
    parser.add_argument("--eval-url", default=None, help="Remote JSONL eval file for HF Jobs.")
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--hub-model-id", default=None, help="Example: username/mediscribe-medical-adapter")
    parser.add_argument("--push-to-hub", action="store_true")
    parser.add_argument("--trackio-space", default=None, help="Example: username/trackio")
    parser.add_argument("--run-name", default="mediscribe-unsloth-sft")
    parser.add_argument("--max-seq-length", type=int, default=2048)
    parser.add_argument("--max-steps", type=int, default=100)
    parser.add_argument("--num-train-epochs", type=float, default=None)
    parser.add_argument("--per-device-train-batch-size", type=int, default=1)
    parser.add_argument("--gradient-accumulation-steps", type=int, default=4)
    parser.add_argument("--learning-rate", type=float, default=2e-4)
    parser.add_argument("--warmup-steps", type=int, default=10)
    parser.add_argument("--lora-r", type=int, default=16)
    parser.add_argument("--lora-alpha", type=int, default=16)
    parser.add_argument("--lora-dropout", type=float, default=0.0)
    parser.add_argument("--target-modules", default=DEFAULT_TARGET_MODULES)
    parser.add_argument("--load-in-4bit", action="store_true")
    parser.add_argument("--load-in-16bit", action="store_true", default=True)
    parser.add_argument("--no-load-in-16bit", action="store_false", dest="load_in_16bit")
    parser.add_argument("--seed", type=int, default=3407)
    parser.add_argument("--save-gguf", action="store_true")
    parser.add_argument("--gguf-quantization", default="q4_k_m")
    parser.add_argument("--dry-run", action="store_true", help="Validate config without importing Unsloth.")
    parser.add_argument(
        "--train-on-responses-only",
        action="store_true",
        help="Mask user/system tokens. Disabled by default because chat markers vary by model.",
    )
    args = parser.parse_args()
    if args.load_in_4bit:
        args.load_in_16bit = False
    return args


def download_to_temp(url: str, suffix: str) -> Path:
    temp_dir = Path(tempfile.mkdtemp(prefix="mediscribe-unsloth-"))
    destination = temp_dir / suffix
    urllib.request.urlretrieve(url, destination)
    return destination


def resolve_dataset_paths(args: argparse.Namespace) -> tuple[Path, Path | None]:
    train_path = download_to_temp(args.train_url, "train.jsonl") if args.train_url else Path(args.train_file)
    eval_path = download_to_temp(args.eval_url, "eval.jsonl") if args.eval_url else Path(args.eval_file)
    if not train_path.exists():
        raise FileNotFoundError(f"Train file does not exist: {train_path}")
    if eval_path.exists() and eval_path.stat().st_size > 0:
        return train_path, eval_path
    return train_path, None


def read_jsonl(path: Path) -> list[dict[str, Any]]:
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
    if not rows:
        raise ValueError(f"{path} has no training rows.")
    return rows


def validate_messages(rows: list[dict[str, Any]], path: Path) -> None:
    for index, row in enumerate(rows, start=1):
        messages = row.get("messages")
        if not isinstance(messages, list) or len(messages) < 3:
            raise ValueError(f"{path}:{index} must contain system, user, and assistant messages.")
        roles = [message.get("role") for message in messages if isinstance(message, dict)]
        if roles[0] != "system" or roles[-1] != "assistant":
            raise ValueError(f"{path}:{index} must start with system and end with assistant.")
        assistant = messages[-1].get("content")
        if not isinstance(assistant, str):
            raise ValueError(f"{path}:{index} assistant content must be a string.")
        try:
            json.loads(assistant)
        except json.JSONDecodeError as exc:
            raise ValueError(f"{path}:{index} assistant content must be JSON: {exc}") from exc


def training_plan(args: argparse.Namespace, train_rows: int, eval_rows: int) -> dict[str, Any]:
    return {
        "base_model": args.base_model,
        "adapter_name": "MediScribe Medical Adapter",
        "train_rows": train_rows,
        "eval_rows": eval_rows,
        "method": "Unsloth LoRA SFT",
        "max_seq_length": args.max_seq_length,
        "max_steps": args.max_steps,
        "num_train_epochs": args.num_train_epochs,
        "effective_batch_size": args.per_device_train_batch_size * args.gradient_accumulation_steps,
        "learning_rate": args.learning_rate,
        "lora_r": args.lora_r,
        "lora_alpha": args.lora_alpha,
        "load_in_4bit": args.load_in_4bit,
        "load_in_16bit": args.load_in_16bit,
        "push_to_hub": args.push_to_hub,
        "hub_model_id": args.hub_model_id,
        "trackio_space": args.trackio_space,
    }


def write_training_plan(args: argparse.Namespace, plan: dict[str, Any]) -> None:
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "training_plan.json").write_text(
        json.dumps(plan, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def write_model_card(output_dir: Path, args: argparse.Namespace, metrics: dict[str, Any]) -> None:
    card = f"""# MediScribe Medical Adapter

MediScribe Medical Adapter is a LoRA adapter for rural-clinic medical triage
support. It is trained with Unsloth SFT on curated MediScribe clinical cases and
is intended for clinical decision support demos, not autonomous diagnosis.

## Base Model

- Base model: `{args.base_model}`
- Fine-tuning method: Unsloth LoRA SFT
- Adapter rank: {args.lora_r}
- Max sequence length: {args.max_seq_length}
- Training rows: {metrics.get("train_rows")}
- Evaluation rows: {metrics.get("eval_rows")}

## Safety Position

The adapter should be used only with MediScribe's deterministic safety layer:
red-flag rules, referral fallback, audit logs, and plain-language explanations.
It does not replace a licensed clinician.

## Naming And Attribution

This model artifact is named MediScribe Medical Adapter. It is based on a Gemma
4 model, but MediScribe is independent and is not endorsed by Google.

Gemma is a trademark of Google LLC.
"""
    (output_dir / "README.md").write_text(card, encoding="utf-8")


def sft_config_kwargs(SFTConfig: Any, args: argparse.Namespace, output_dir: Path, has_eval: bool) -> dict[str, Any]:
    parameters = inspect.signature(SFTConfig.__init__).parameters
    kwargs: dict[str, Any] = {
        "output_dir": str(output_dir),
        "per_device_train_batch_size": args.per_device_train_batch_size,
        "gradient_accumulation_steps": args.gradient_accumulation_steps,
        "warmup_steps": args.warmup_steps,
        "learning_rate": args.learning_rate,
        "logging_steps": 1,
        "optim": "adamw_8bit",
        "weight_decay": 0.01,
        "lr_scheduler_type": "linear",
        "seed": args.seed,
        "report_to": ["trackio", "tensorboard"] if args.trackio_space else ["tensorboard"],
        "run_name": args.run_name,
        "save_steps": max(10, args.max_steps // 4) if args.max_steps else 50,
        "save_total_limit": 2,
        "push_to_hub": args.push_to_hub,
    }
    if "dataset_text_field" in parameters:
        kwargs["dataset_text_field"] = "text"
    if "max_length" in parameters:
        kwargs["max_length"] = args.max_seq_length
    elif "max_seq_length" in parameters:
        kwargs["max_seq_length"] = args.max_seq_length
    if args.num_train_epochs is not None:
        kwargs["num_train_epochs"] = args.num_train_epochs
        kwargs["max_steps"] = -1
    else:
        kwargs["num_train_epochs"] = 1
        kwargs["max_steps"] = args.max_steps
    if args.push_to_hub and args.hub_model_id:
        kwargs["hub_model_id"] = args.hub_model_id
    if has_eval:
        if "eval_strategy" in parameters:
            kwargs["eval_strategy"] = "steps"
        elif "evaluation_strategy" in parameters:
            kwargs["evaluation_strategy"] = "steps"
        if "eval_steps" in parameters:
            kwargs["eval_steps"] = max(10, args.max_steps // 5) if args.max_steps else 50
    return kwargs


def check_gpu() -> None:
    import torch

    if not torch.cuda.is_available():
        raise RuntimeError(
            "CUDA GPU is required for this Unsloth training script. "
            "Use Hugging Face Jobs, Colab, WSL with NVIDIA CUDA, or a Linux GPU host."
        )
    print(f"CUDA available: {torch.cuda.get_device_name(0)}")


def main() -> None:
    args = parse_args()
    train_path, eval_path = resolve_dataset_paths(args)
    train_rows = read_jsonl(train_path)
    eval_rows = read_jsonl(eval_path) if eval_path else []
    validate_messages(train_rows, train_path)
    if eval_path:
        validate_messages(eval_rows, eval_path)

    plan = training_plan(args, len(train_rows), len(eval_rows))
    write_training_plan(args, plan)

    if args.dry_run:
        print(json.dumps(plan, indent=2, sort_keys=True))
        print(f"Dry run passed. Training plan written to {Path(args.output_dir) / 'training_plan.json'}")
        return

    if args.push_to_hub and not args.hub_model_id:
        raise ValueError("--push-to-hub requires --hub-model-id.")

    if args.trackio_space:
        os.environ["TRACKIO_SPACE_ID"] = args.trackio_space
    os.environ.setdefault("HF_HUB_ENABLE_HF_TRANSFER", "1")

    check_gpu()

    from datasets import load_dataset
    from huggingface_hub import login
    from trl import SFTConfig, SFTTrainer
    from unsloth import FastLanguageModel

    token = os.environ.get("HF_TOKEN")
    if token:
        login(token=token)
    elif args.push_to_hub:
        raise RuntimeError("HF_TOKEN is required when --push-to-hub is enabled.")

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print("Loading Gemma 4 base model with Unsloth...")
    start_time = time.time()
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=args.base_model,
        max_seq_length=args.max_seq_length,
        load_in_4bit=args.load_in_4bit,
        load_in_16bit=args.load_in_16bit,
        full_finetuning=False,
    )
    model = FastLanguageModel.get_peft_model(
        model,
        r=args.lora_r,
        target_modules=[module.strip() for module in args.target_modules.split(",") if module.strip()],
        lora_alpha=args.lora_alpha,
        lora_dropout=args.lora_dropout,
        bias="none",
        use_gradient_checkpointing="unsloth",
        random_state=args.seed,
        max_seq_length=args.max_seq_length,
    )
    print(f"Model ready in {time.time() - start_time:.1f}s")

    data_files: dict[str, str] = {"train": str(train_path)}
    if eval_path:
        data_files["eval"] = str(eval_path)
    dataset = load_dataset("json", data_files=data_files)

    def to_text(batch: dict[str, Any]) -> dict[str, list[str]]:
        texts: list[str] = []
        for messages in batch["messages"]:
            text = tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=False,
            )
            if tokenizer.bos_token and text.startswith(tokenizer.bos_token):
                text = text[len(tokenizer.bos_token) :]
            texts.append(text)
        return {"text": texts}

    train_data = dataset["train"].map(to_text, batched=True)
    eval_data = dataset["eval"].map(to_text, batched=True) if "eval" in dataset else None

    config = SFTConfig(
        **sft_config_kwargs(SFTConfig, args, output_dir, has_eval=eval_data is not None)
    )

    trainer_parameters = inspect.signature(SFTTrainer.__init__).parameters
    trainer_kwargs: dict[str, Any] = {
        "model": model,
        "train_dataset": train_data,
        "eval_dataset": eval_data,
        "args": config,
    }
    if "processing_class" in trainer_parameters:
        trainer_kwargs["processing_class"] = tokenizer
    else:
        trainer_kwargs["tokenizer"] = tokenizer

    trainer = SFTTrainer(**trainer_kwargs)

    if args.train_on_responses_only:
        from unsloth.chat_templates import train_on_responses_only

        trainer = train_on_responses_only(
            trainer,
            instruction_part="user",
            response_part="assistant",
        )

    print("Starting Unsloth SFT...")
    train_result = trainer.train()
    metrics = dict(train_result.metrics)
    metrics.update(
        {
            "base_model": args.base_model,
            "train_rows": len(train_rows),
            "eval_rows": len(eval_rows),
            "method": "Unsloth LoRA SFT",
            "adapter_name": "MediScribe Medical Adapter",
        }
    )

    if eval_data is not None:
        eval_metrics = trainer.evaluate()
        metrics.update({f"eval_{key}": value for key, value in eval_metrics.items()})

    model.save_pretrained(str(output_dir))
    tokenizer.save_pretrained(str(output_dir))
    (output_dir / "training_metrics.json").write_text(
        json.dumps(metrics, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    write_model_card(output_dir, args, metrics)

    if args.save_gguf:
        gguf_dir = output_dir / "gguf"
        model.save_pretrained_gguf(
            str(gguf_dir),
            tokenizer,
            quantization_method=args.gguf_quantization,
        )

    if args.push_to_hub and args.hub_model_id:
        model.push_to_hub(args.hub_model_id, tokenizer=tokenizer)
        tokenizer.push_to_hub(args.hub_model_id)
        print(f"Pushed adapter to https://huggingface.co/{args.hub_model_id}")

    print(f"Training complete. Adapter saved to {output_dir}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Training failed: {exc}", file=sys.stderr)
        raise
