# MediScribe Live Demo Guide

This guide gives judges a direct path to experience the app.

## Public Demo Link

Add the hosted URL here before Kaggle submission:

```text
https://<your-public-demo-url>
```

Recommended public demo options:

- Docker deployment on a small VM with ports exposed through HTTPS.
- Hugging Face Space using the Docker setup.
- Local judge package with Docker Compose instructions if a hosted demo is not possible.

## Local Demo

Start the backend, dashboard, PostgreSQL, Ollama, Prometheus, and Grafana:

```powershell
cd docker
docker compose up --build
```

Pull the edge-friendly Gemma 4 model if it is not already present:

```powershell
ollama pull gemma4:e4b
```

Open:

- Backend health: `http://localhost:3001/health`
- Dashboard: `http://localhost:3000`
- API gateway: `http://localhost:8080`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3003`

Start the mobile app:

```powershell
cd mobile
npm install
npx expo start --lan --clear --port 8130
```

Open the Expo app in Expo Go or a dev client.

## Judge Demo Case

Use this case to show the full value:

```powershell
curl -X POST http://localhost:3001/api/diagnoses/agentic `
  -H "Content-Type: application/json" `
  -d "{\"patient\":{\"age_years\":58,\"gender\":\"female\",\"known_conditions\":[\"hypertension\"]},\"chief_complaint\":\"Crushing chest pain with sweating\",\"symptoms\":[\"shortness of breath\",\"left arm pain\"],\"vitals\":{\"systolic_bp\":84,\"diastolic_bp\":56,\"oxygen_saturation\":89,\"respiratory_rate\":32},\"offline_captured\":true}"
```

Expected result:

- Emergency or immediate urgency.
- Red-flag referral guidance.
- Diagnosis, reasoning, treatment, and safety agent outputs.
- Audit log entry.
- Metrics update.

## Demo Endpoints

```powershell
curl http://localhost:3001/api/system/demo-pack
curl http://localhost:3001/api/system/architecture
curl http://localhost:3001/api/diagnoses/evaluation
curl http://localhost:3001/api/diagnoses/performance
curl http://localhost:3001/metrics
```

## Offline Moment For The Video

1. Open the mobile app.
2. Show "Offline ready" on the home screen.
3. Enter a high-risk patient.
4. Turn off the network or stop the backend.
5. Run diagnosis.
6. Show that the mobile fallback still gives safe referral guidance and saves the visit locally.

