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

The `model_training/` folder contains the Gemma fine-tuning scaffold and evaluation
outputs. Real GPU fine-tuning should write artifacts into:

```text
model_training/outputs/finetuned_model/
```
