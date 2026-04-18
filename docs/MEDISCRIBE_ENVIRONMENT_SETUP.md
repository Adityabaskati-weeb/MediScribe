# MediScribe Environment Setup

This setup guide mirrors the uploaded `MEDISCRIBE_ENVIRONMENT_SETUP.md` and is tailored to this repository.

## System Requirements

| Component | Minimum | Recommended |
| --- | --- | --- |
| OS | Windows 10, Ubuntu 20.04, macOS 10.14 | Current Windows, Ubuntu LTS, or macOS |
| RAM | 8 GB | 16 GB for model work |
| Storage | 50 GB | 80 GB with Ollama models |
| Internet | Initial setup | Runtime can be offline-first |

## Ollama And Gemma

Windows:

1. Install Ollama from `https://ollama.ai`.
2. Start Ollama.
3. Pull Gemma:

```powershell
ollama pull gemma4:e4b
ollama list
```

macOS:

```bash
brew install ollama
ollama pull gemma4:e4b
```

Linux:

```bash
curl https://ollama.ai/install.sh | sh
sudo systemctl start ollama
ollama pull gemma4:e4b
```

Verify:

```bash
curl http://localhost:11434/api/tags
```

## Node.js And npm

Use Node 18+.

```bash
node --version
npm --version
```

Install project packages:

```bash
npm install --prefix backend
npm install --prefix dashboard
npm install --prefix mobile
```

## React Native / Expo

The mobile app uses Expo SDK 54 for current Expo Go.

```bash
cd mobile
npx expo install --check
npx tsc --noEmit
npx expo start --lan --clear --max-workers 1 --port 8130
```

Open in Expo Go:

```text
exp://192.168.31.138:8130
```

## Python And ML Tools

Python is used only for `model_training/`.

```bash
python --version
python -m venv .venv
.venv\Scripts\activate
pip install -r model_training/requirements.txt
```

Run the training scaffold:

```bash
python model_training/prepare_data.py
python model_training/train.py
python model_training/evaluate.py
```

## PostgreSQL And SQLite

Backend PostgreSQL is provided through Docker Compose:

```bash
cd docker
docker compose up --build postgres backend
```

Mobile SQLite is managed by `expo-sqlite` and initialized in `mobile/src/services/databaseService.ts`.

## Git

```bash
git --version
git status
git log --oneline -5
```

## Docker

```bash
docker --version
cd docker
docker compose up --build
docker compose ps
```

Services:

- Backend: `http://localhost:3001`
- Dashboard: `http://localhost:3000`
- Ollama: `http://localhost:11434`
- PostgreSQL: `localhost:5432`

## VS Code

Recommended workspace settings and extensions are included in `.vscode/`.

Recommended extensions:

- TypeScript
- ESLint
- Prettier
- Python
- Docker
- PostgreSQL

## Environment Variables

Backend `.env`:

```text
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://mediscribe:password@localhost:5432/mediscribe
OLLAMA_API=http://localhost:11434
OLLAMA_MODEL=gemma4:e4b
API_KEY=
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=120
```

Mobile:

```text
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Verification Script

Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\verify_environment.ps1
```

This checks Node, npm, Git, Python, Docker, Ollama, roadmap tests, backend build, dashboard build, mobile TypeScript, and Expo dependency compatibility.

## Troubleshooting

### Expo SDK mismatch

```bash
cd mobile
npx expo install --check
npx expo start --lan --clear --max-workers 1 --port 8130
```

### Ollama not responding

```bash
ollama serve
curl http://localhost:11434/api/tags
```

### PostgreSQL connection failed

```bash
cd docker
docker compose down -v
docker compose up --build postgres backend
```

### Missing Node modules

```bash
npm install --prefix backend
npm install --prefix dashboard
npm install --prefix mobile
```
