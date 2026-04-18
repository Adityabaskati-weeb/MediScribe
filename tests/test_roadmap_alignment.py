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


def test_model_training_outputs_are_benchmark_artifacts() -> None:
    train_script = (ROOT / "model_training/train.py").read_text(encoding="utf-8")
    evaluate_script = (ROOT / "model_training/evaluate.py").read_text(encoding="utf-8")
    assert "adapter_config.json" in train_script
    assert "metrics.json" in evaluate_script
    assert "placeholder" not in train_script.lower()
