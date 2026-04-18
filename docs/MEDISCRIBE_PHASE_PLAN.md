# MediScribe Phase Plan

This plan follows the uploaded roadmap architecture and technologies.

## Phase 1: Foundation

- `backend/` Node/Express TypeScript API
- `mobile/` React Native scaffold
- `dashboard/` React scaffold
- `.env.example`, setup docs, Docker skeleton

## Phase 2: Core Clinical Features

- patient intake model
- symptom and vitals parsing
- deterministic clinical safety guardrails
- offline queue and sync records
- Gemma/Ollama service wrapper

## Phase 3: User Interfaces

- mobile patient form, voice capture placeholder, OCR placeholder, diagnosis view
- dashboard analytics, patient list, reports, settings
- API client integration through the Node backend

## Phase 4: Deployment and Submission

- `model_training/` Gemma fine-tuning scaffold
- Docker Compose with backend, dashboard, PostgreSQL, and Ollama
- evaluation report
- video script
- submission writeup

## Non-Negotiable Architecture

The product runtime is Node/Express + React Native + React dashboard + PostgreSQL/
SQLite + Gemma/Ollama. Python is used only for `model_training/` helper scripts.
