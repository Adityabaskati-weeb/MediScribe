# MediScribe Unsloth Fine-Tuning

This is the real fine-tuning path for the MediScribe Medical Adapter. It turns
the curated rural-clinic cases into Gemma 4 chat SFT examples and trains a LoRA
adapter with Unsloth.

## What This Adds

- Gemma 4 chat-format dataset generation using `system`, `user`, and `assistant`
  roles.
- Dataset validation before spending GPU time.
- Unsloth LoRA SFT training with Trackio and optional Hugging Face Hub push.
- Adapter model card with Gemma attribution and safety limits.
- HF Jobs-ready command for cloud GPU training.

## Prepare The Dataset

```powershell
python model_training/prepare_data.py
python model_training/validate_dataset.py
python model_training/train.py --dry-run
```

Outputs:

- `model_training/data/training_splits/train.jsonl`
- `model_training/data/training_splits/eval.jsonl`
- `model_training/data/training_splits/all.jsonl`
- `model_training/outputs/mediscribe-medical-adapter/training_plan.json`

## Local GPU Training

Run this on a CUDA machine or WSL with NVIDIA CUDA. Unsloth training is not a CPU
workflow.

```powershell
python model_training/train.py `
  --base-model google/gemma-4-E4B-it `
  --output-dir model_training/outputs/mediscribe-medical-adapter `
  --max-steps 100 `
  --trackio-space your-hf-name/trackio
```

Use 4-bit only if your GPU memory is tight:

```powershell
python model_training/train.py `
  --base-model unsloth/gemma-4-E4B-it-unsloth-bnb-4bit `
  --load-in-4bit `
  --output-dir model_training/outputs/mediscribe-medical-adapter `
  --max-steps 100
```

## Push Adapter Weights

Do not use `gemma` in the adapter repo name. Use the description/model card to
say it is based on Gemma 4.

Good model repo name:

```text
your-hf-name/mediscribe-medical-adapter
```

Training with Hub push:

```powershell
$env:HF_TOKEN="hf_your_write_token"
python model_training/train.py `
  --base-model google/gemma-4-E4B-it `
  --hub-model-id your-hf-name/mediscribe-medical-adapter `
  --push-to-hub `
  --trackio-space your-hf-name/trackio `
  --max-steps 100
```

## Hugging Face Jobs Training

After the GitHub repo is pushed, this command trains from public raw files and
pushes the adapter to your Hugging Face account. HF Jobs require a paid-capable
Hugging Face account and an `HF_TOKEN` secret with write permission.

```powershell
hf jobs uv run `
  --flavor a10g-large `
  --timeout 2h `
  --secrets HF_TOKEN `
  "https://raw.githubusercontent.com/Adityabaskati-weeb/MediScribe/main/model_training/train.py" `
  -- `
  --train-url "https://raw.githubusercontent.com/Adityabaskati-weeb/MediScribe/main/model_training/data/training_splits/train.jsonl" `
  --eval-url "https://raw.githubusercontent.com/Adityabaskati-weeb/MediScribe/main/model_training/data/training_splits/eval.jsonl" `
  --base-model google/gemma-4-E4B-it `
  --hub-model-id your-hf-name/mediscribe-medical-adapter `
  --push-to-hub `
  --trackio-space your-hf-name/trackio `
  --max-steps 100
```

## Claim Rules

You can claim the Unsloth special technology track only after all of these are
true:

- A real GPU training run completed.
- Adapter weights are public on Hugging Face or attached to the submission.
- `training_metrics.json` or a benchmark report is published.
- The model card says the adapter is based on Gemma 4 and includes:
  `Gemma is a trademark of Google LLC.`

Until then, the project should say it includes an Unsloth-ready fine-tuning
pipeline, not that a fine-tuned adapter has already been published.

## Sources

- Unsloth Gemma 4 guide: https://unsloth.ai/docs/models/gemma-4
- Unsloth Gemma 4 fine-tuning guide: https://unsloth.ai/docs/models/gemma-4/train
- Hugging Face TRL SFTTrainer docs: https://huggingface.co/docs/trl/sft_trainer
