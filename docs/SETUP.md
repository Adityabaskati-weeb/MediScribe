# MediScribe Setup

This setup follows the uploaded MediScribe architecture: Node/Express backend,
React Native mobile app, React dashboard, PostgreSQL, Ollama/Gemma, and model
training scripts.

## Backend

```powershell
cd backend
npm install
copy .env.example .env
npm run dev
```

Backend URL:

```text
http://127.0.0.1:3001/health
```

## Mobile

```powershell
cd mobile
npm install
npm start
```

## Dashboard

```powershell
cd dashboard
npm install
npm run dev
```

Dashboard URL:

```text
http://127.0.0.1:3000
```

## Ollama and Gemma

```powershell
ollama pull gemma2:2b
ollama serve
```

Backend environment:

```text
OLLAMA_API=http://localhost:11434
OLLAMA_MODEL=gemma2:2b
```

## Model Training Scaffold

```powershell
python model_training\prepare_data.py
python model_training\train.py
python model_training\evaluate.py
```
