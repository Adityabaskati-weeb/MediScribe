# MediScribe Deployment

## Docker Compose

```powershell
cd docker
docker compose up --build
```

Services:

- Backend: `http://localhost:3001`
- Dashboard: `http://localhost:3000`
- PostgreSQL: `localhost:5432`
- Ollama: `http://localhost:11434`

## Manual Backend

```powershell
cd backend
npm install
npm run build
npm start
```

## Manual Dashboard

```powershell
cd dashboard
npm install
npm run build
npm run preview
```

## Model Assets

The `model_training/` folder contains the Gemma 4 Unsloth LoRA fine-tuning
pipeline and evaluation outputs. Run the dry check before spending GPU time:

```powershell
python model_training/prepare_data.py
python model_training/validate_dataset.py
python model_training/train.py --dry-run
```

Real GPU fine-tuning writes adapter artifacts into
`model_training/outputs/mediscribe-medical-adapter/`. See
`docs/UNSLOTH_FINE_TUNING.md` for local CUDA and Hugging Face Jobs commands.
