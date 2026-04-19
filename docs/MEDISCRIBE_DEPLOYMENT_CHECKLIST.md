# MediScribe Deployment Checklist

## Backend

```powershell
cd backend
npm install
npm run build
npm start
```

## Dashboard

```powershell
cd dashboard
npm install
npm run build
npm run preview
```

## Mobile

```powershell
cd mobile
npm install
npm start
```

## Docker

```powershell
cd docker
docker compose up --build
```

## Model Training

```powershell
python model_training\prepare_data.py
python model_training\validate_dataset.py
python model_training\train.py --dry-run
python model_training\evaluate.py
```

Run the real Unsloth command on CUDA or Hugging Face Jobs before claiming
published fine-tuned weights.

## Verify

- backend: `http://localhost:3001/health`
- dashboard: `http://localhost:3000`
- sync: `http://localhost:3001/api/sync/pending`
