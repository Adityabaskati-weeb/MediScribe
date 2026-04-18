import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


ROADMAP_PATHS = [
    "mobile/app.json",
    "mobile/package.json",
    "mobile/src/components/VoiceInput.tsx",
    "mobile/src/components/PatientForm.tsx",
    "mobile/src/components/SymptomChecker.tsx",
    "mobile/src/components/DiagnosisResult.tsx",
    "mobile/src/components/ChartOCR.tsx",
    "mobile/src/components/PatientHistory.tsx",
    "mobile/src/screens/HomeScreen.tsx",
    "mobile/src/screens/NewPatientScreen.tsx",
    "mobile/src/screens/DiagnosisScreen.tsx",
    "mobile/src/screens/HistoryScreen.tsx",
    "mobile/src/services/gemmaService.ts",
    "mobile/src/services/databaseService.ts",
    "mobile/src/services/speechService.ts",
    "mobile/src/services/ocrService.ts",
    "mobile/src/services/syncService.ts",
    "backend/package.json",
    "backend/src/index.ts",
    "backend/src/routes/patients.ts",
    "backend/src/routes/diagnoses.ts",
    "backend/src/routes/sync.ts",
    "backend/src/services/gemmaService.ts",
    "backend/src/services/databaseService.ts",
    "backend/src/services/analysisService.ts",
    "backend/openapi.yaml",
    "backend/src/tests/integration.test.ts",
    "backend/src/tests/gemmaService.test.ts",
    "dashboard/package.json",
    "dashboard/src/App.tsx",
    "dashboard/src/pages/Dashboard.tsx",
    "dashboard/src/pages/Patients.tsx",
    "dashboard/src/pages/Reports.tsx",
    "dashboard/src/pages/Settings.tsx",
    "model_training/requirements.txt",
    "model_training/train.py",
    "model_training/prepare_data.py",
    "model_training/evaluate.py",
    "docker/Dockerfile.mobile",
    "docker/Dockerfile.backend",
    "docker/docker-compose.yml",
    "docs/SETUP.md",
    "docs/API.md",
    "docs/DEPLOYMENT.md",
    "docs/DEMO_GUIDE.md",
    "docs/MEDISCRIBE_MASTER_GUIDE.md",
    "docs/MEDISCRIBE_IMPLEMENTATION_ROADMAP.md",
    "docs/MEDISCRIBE_QUICK_REFERENCE.md",
    "docs/MEDISCRIBE_ENVIRONMENT_SETUP.md",
    "docs/MEDISCRIBE_CODE_TEMPLATES.md",
    "ROADMAP.md",
]


def test_uploaded_roadmap_structure_exists() -> None:
    missing = [path for path in ROADMAP_PATHS if not (ROOT / path).exists()]
    assert missing == []


def test_package_json_files_are_valid() -> None:
    for path in ["backend/package.json", "mobile/package.json", "dashboard/package.json"]:
        json.loads((ROOT / path).read_text(encoding="utf-8"))


def test_alignment_report_names_uploaded_plan_files() -> None:
    report = (ROOT / "docs/STRICT_ALIGNMENT_REPORT.md").read_text(encoding="utf-8")
    for name in [
        "MEDISCRIBE_MASTER_GUIDE.md",
        "MEDISCRIBE_IMPLEMENTATION_ROADMAP.md",
        "MEDISCRIBE_QUICK_REFERENCE.md",
        "MEDISCRIBE_ENVIRONMENT_SETUP.md",
        "MEDISCRIBE_CODE_TEMPLATES.md",
    ]:
        assert name in report


def test_master_guide_task_navigation_and_timeline_exist() -> None:
    guide = (ROOT / "docs/MEDISCRIBE_MASTER_GUIDE.md").read_text(encoding="utf-8")
    for section in [
        "Quick Navigation By Task",
        "What You Have Received",
        "How To Use This Roadmap",
        "Document Navigation Map",
        "Success Criteria",
        "Key Implementation Decisions",
        "I need to start from scratch",
        "I am on Day 10 and need to implement OCR",
        "I need to build the diagnosis system",
        "I need to debug database issues",
        "I am ready to deploy",
        "I need to create the submission video",
        "I need to write the technical writeup",
        "Content Distribution",
        "File Organization",
        "Recommended Reading Order",
        "Unique Features Of This Package",
        "Implementation Timeline",
        "Week 1: Foundation",
        "Week 2: Core Features",
        "Week 3: Mobile UI",
        "Week 4: Backend And Deployment",
        "Hackathon Submission Strategy",
        "Debugging And Support",
        "Performance Targets",
        "Winning Factors",
        "Learning Resources",
        "Pre-Submission Checklist",
        "Next Steps",
        "Pro Tips",
        "Final Notes",
    ]:
        assert section in guide


def test_implementation_roadmap_weekly_breakdown_exists() -> None:
    roadmap = (ROOT / "docs/MEDISCRIBE_IMPLEMENTATION_ROADMAP.md").read_text(encoding="utf-8")
    for section in [
        "Complete File Structure",
        "Day 1-2: Environment Setup",
        "Day 3-4: Ollama And Gemma",
        "Day 5-6: Database Schema",
        "Day 8-9: Speech-To-Text",
        "Day 10-11: OCR",
        "Day 12-14: Diagnosis Engine",
        "Day 15-16: Forms",
        "Day 22-23: Backend API",
        "Day 24-25: Dashboard",
        "Day 26: Model Training",
        "Day 27: Docker",
        "Day 28: Video, Writeup, Submit",
        "Testing Strategy",
        "Video Creation Guide",
    ]:
        assert section in roadmap


def test_legacy_runtime_files_are_not_part_of_product_architecture() -> None:
    forbidden = [
        "app/mediscribe.py",
        "server/app.py",
        "openenv.yaml",
        "pyproject.toml",
        "requirements.txt",
        "inference.py",
    ]
    existing = [path for path in forbidden if (ROOT / path).exists()]
    assert existing == []


def test_backend_submission_checklist_features_exist() -> None:
    for path in [
        "backend/src/middleware/auth.ts",
        "backend/src/middleware/logger.ts",
        "backend/src/middleware/rateLimiter.ts",
    ]:
        assert (ROOT / path).exists()

    sync_route = (ROOT / "backend/src/routes/sync.ts").read_text(encoding="utf-8")
    assert "router.post('/push'" in sync_route
    assert "router.post('/ack'" in sync_route
    assert (ROOT / "backend/openapi.yaml").exists()


def test_mobile_week_two_and_three_functions_exist() -> None:
    speech = (ROOT / "mobile/src/services/speechService.ts").read_text(encoding="utf-8")
    ocr = (ROOT / "mobile/src/services/ocrService.ts").read_text(encoding="utf-8")
    database = (ROOT / "mobile/src/services/databaseService.ts").read_text(encoding="utf-8")
    app = (ROOT / "mobile/src/App.tsx").read_text(encoding="utf-8")

    assert "startSpeechRecognition" in speech
    assert "captureSymptomInMultipleLanguages" in speech
    assert "parseExtractedMedicalData" in ocr
    assert "CREATE TABLE IF NOT EXISTS patients" in database
    assert "CREATE TABLE IF NOT EXISTS consultations" in database
    assert "CREATE TABLE IF NOT EXISTS diagnoses" in database
    assert "createPatient" in database
    assert "saveDiagnosis" in database
    assert "ScreenName" in app


def test_docker_compose_uses_roadmap_services_only() -> None:
    compose = (ROOT / "docker/docker-compose.yml").read_text(encoding="utf-8")
    for service in ["postgres:", "backend:", "dashboard:", "ollama:"]:
        assert service in compose
    assert "python-api" not in compose


def test_key_roadmap_sections_have_real_implementation() -> None:
    gemma = (ROOT / "backend/src/services/gemmaService.ts").read_text(encoding="utf-8")
    mobile_db = (ROOT / "mobile/src/services/databaseService.ts").read_text(encoding="utf-8")
    backend_db = (ROOT / "backend/src/config/database.ts").read_text(encoding="utf-8")
    dashboard = (ROOT / "dashboard/src/pages/Dashboard.tsx").read_text(encoding="utf-8")
    compose = (ROOT / "docker/docker-compose.yml").read_text(encoding="utf-8")

    assert "translateSymptoms" in gemma
    assert "analyzeMedicalCase" in gemma
    for table in ["treatmentPlans", "chartImages", "syncQueue"]:
        assert table in mobile_db
    assert "CREATE TABLE IF NOT EXISTS treatments" in backend_db
    assert "LineChart" in dashboard and "BarChart" in dashboard
    assert "healthcheck" in compose


def test_quick_reference_deliverables_exist() -> None:
    quick = (ROOT / "docs/MEDISCRIBE_QUICK_REFERENCE.md").read_text(encoding="utf-8")
    for section in [
        "28-Day Progress Tracker",
        "Essential Commands",
        "Key Metrics To Track",
        "Debugging Quick Fixes",
        "Video Production Checklist",
        "Writeup Structure",
    ]:
        assert section in quick


def test_environment_setup_deliverables_exist() -> None:
    setup = (ROOT / "docs/MEDISCRIBE_ENVIRONMENT_SETUP.md").read_text(encoding="utf-8")
    assert (ROOT / "scripts/verify_environment.ps1").exists()
    assert (ROOT / ".vscode/settings.json").exists()
    assert (ROOT / ".vscode/extensions.json").exists()
    for section in ["Ollama And Gemma", "Node.js And npm", "React Native / Expo", "Python And ML Tools", "PostgreSQL And SQLite", "Docker", "VS Code", "Verification Script", "Troubleshooting"]:
        assert section in setup


def test_code_template_deliverables_exist() -> None:
    template_doc = (ROOT / "docs/MEDISCRIBE_CODE_TEMPLATES.md").read_text(encoding="utf-8")
    assert (ROOT / "mobile/src/hooks/useMedicalData.ts").exists()
    assert (ROOT / "backend/src/tests/validators.test.ts").exists()
    validators = (ROOT / "backend/src/utils/validators.ts").read_text(encoding="utf-8")
    assert "validateRequest" in validators
    for phrase in ["API response wrapper", "Error middleware", "Rate limiting", "Data synchronization", "Model inference wrapper", "Unit test example", "Integration test example"]:
        assert phrase in template_doc


def test_model_training_outputs_are_benchmark_artifacts() -> None:
    train_script = (ROOT / "model_training/train.py").read_text(encoding="utf-8")
    evaluate_script = (ROOT / "model_training/evaluate.py").read_text(encoding="utf-8")
    assert "adapter_config.json" in train_script
    assert "metrics.json" in evaluate_script
    assert "placeholder" not in train_script.lower()
