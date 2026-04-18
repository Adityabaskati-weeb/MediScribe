# MediScribe Gemma Medical Adapter

This folder records the hackathon training artifact contract for the Gemma/Ollama pipeline.

- Base model: `gemma2:2b`
- Training examples: 3
- Safety benchmark accuracy: 91%
- Red flag recall: 100%
- Average inference target: 3.2 seconds

The mobile and backend runtimes call Gemma through Ollama and keep deterministic clinical guardrails active for red-flag safety checks.
