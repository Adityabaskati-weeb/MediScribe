import { Specialty, now, stableId } from './scalabilityShared';
import crypto from 'crypto';

interface FederatedUpdate {
  updateId: string;
  clinicId: string;
  modelId: string;
  weights: number[];
  dataSize: number;
  metrics: { accuracy: number; loss: number };
  timestamp: string;
  signature: string;
}

class FederatedLearningManager {
  private updateQueue: FederatedUpdate[] = [];
  private globalWeights: number[] = [];
  private secret = process.env.FEDERATED_SECRET || 'mediscribe-local-federated-secret';

  signUpdate(clinicId: string, weights: number[]) {
    return crypto.createHmac('sha256', this.secret).update(clinicId).update(weights.join(',')).digest('hex');
  }

  submitLocalUpdate(input: { clinicId: string; modelId?: string; weights: number[]; dataSize: number; metrics: { accuracy: number; loss: number }; signature?: string }) {
    if (!input.clinicId.trim()) throw new Error('clinicId is required');
    if (!input.weights.length) throw new Error('weights must not be empty');
    if (input.dataSize <= 0) throw new Error('dataSize must be positive');
    const signature = input.signature || this.signUpdate(input.clinicId, input.weights);
    const expected = this.signUpdate(input.clinicId, input.weights);
    if (signature !== expected) throw new Error('Invalid federated update signature');
    const update: FederatedUpdate = {
      updateId: stableId('fl', { clinicId: input.clinicId, weights: input.weights, timestamp: now() }),
      clinicId: input.clinicId,
      modelId: input.modelId || 'mediscribe-general-e4b',
      weights: input.weights.map((weight) => Number(weight.toFixed(6))),
      dataSize: input.dataSize,
      metrics: input.metrics,
      timestamp: now(),
      signature
    };
    this.updateQueue.push(update);
    return update;
  }

  aggregateWeights() {
    if (!this.updateQueue.length) {
      return { aggregated: this.globalWeights, participatingClinics: 0, message: 'No pending updates; returning current global weights.' };
    }
    const length = this.updateQueue[0].weights.length;
    if (!this.updateQueue.every((update) => update.weights.length === length)) {
      throw new Error('All federated updates must have the same weight length');
    }
    const totalDataSize = this.updateQueue.reduce((sum, update) => sum + update.dataSize, 0);
    const aggregated = new Array(length).fill(0);
    for (const update of this.updateQueue) {
      const updateWeight = update.dataSize / totalDataSize;
      update.weights.forEach((weight, index) => {
        aggregated[index] += weight * updateWeight;
      });
    }
    const clinics = new Set(this.updateQueue.map((update) => update.clinicId)).size;
    this.globalWeights = aggregated.map((weight) => Number(weight.toFixed(6)));
    this.updateQueue = [];
    return { aggregated: this.globalWeights, participatingClinics: clinics, message: 'FedAvg aggregation completed.' };
  }

  broadcastGlobalModel(clinicIds: string[]) {
    const weights = this.globalWeights.length ? this.globalWeights : [0.12, 0.22, 0.32, 0.42];
    return clinicIds.map((clinicId) => ({
      clinicId,
      modelId: 'mediscribe-general-e4b',
      packageId: stableId('model-broadcast', { clinicId, weights }),
      encryptedPayloadHash: crypto.createHash('sha256').update(`${clinicId}:${weights.join(',')}`).digest('hex'),
      status: 'ready_for_secure_download',
      createdAt: now()
    }));
  }

  status() {
    return {
      queuedUpdates: this.updateQueue.length,
      globalWeightsReady: this.globalWeights.length > 0,
      globalWeights: this.globalWeights
    };
  }
}

interface PatientOutcome {
  diagnosisId: string;
  predictedDiagnosis: string;
  actualDiagnosis: string;
  confidence: number;
  correctness: boolean;
  clinicId: string;
  specialty?: Specialty;
  timestamp: string;
}

class ContinuousLearningEngine {
  private outcomes: PatientOutcome[] = [];
  private retrainingEvents: Array<{ eventId: string; createdAt: string; sampleCount: number; accuracy: number; focusAreas: string[] }> = [];
  private minBufferSize = 5;

  recordOutcome(input: Omit<PatientOutcome, 'timestamp'> & { timestamp?: string }) {
    const outcome = { ...input, timestamp: input.timestamp || now() };
    this.outcomes.push(outcome);
    const metrics = this.getPerformanceMetrics();
    let retrainingEvent;
    if (this.outcomes.length >= this.minBufferSize && metrics.accuracy < 0.8) {
      retrainingEvent = this.triggerRetraining();
    }
    return { outcome, metrics, retrainingEvent };
  }

  triggerRetraining() {
    const incorrect = this.outcomes.filter((outcome) => !outcome.correctness);
    const event = {
      eventId: stableId('retrain', { incorrect, createdAt: now() }),
      createdAt: now(),
      sampleCount: this.outcomes.length,
      accuracy: this.getPerformanceMetrics().accuracy,
      focusAreas: Array.from(new Set(incorrect.map((outcome) => outcome.specialty || 'general'))).sort()
    };
    this.retrainingEvents.push(event);
    return event;
  }

  getPerformanceMetrics(filters?: { clinicId?: string; specialty?: Specialty }) {
    const filtered = this.outcomes.filter((outcome) => (!filters?.clinicId || outcome.clinicId === filters.clinicId) && (!filters?.specialty || outcome.specialty === filters.specialty));
    const total = filtered.length;
    const correct = filtered.filter((outcome) => outcome.correctness).length;
    const highConfidence = filtered.filter((outcome) => outcome.confidence >= 0.7).length;
    const truePositive = filtered.filter((outcome) => outcome.correctness && outcome.confidence >= 0.7).length;
    const falsePositive = filtered.filter((outcome) => !outcome.correctness && outcome.confidence >= 0.7).length;
    const falseNegative = filtered.filter((outcome) => outcome.correctness && outcome.confidence < 0.7).length;
    const precision = truePositive + falsePositive ? truePositive / (truePositive + falsePositive) : 1;
    const recall = truePositive + falseNegative ? truePositive / (truePositive + falseNegative) : 1;
    const f1Score = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    return {
      total,
      accuracy: total ? Number((correct / total).toFixed(3)) : 1,
      precision: Number(precision.toFixed(3)),
      recall: Number(recall.toFixed(3)),
      f1Score: Number(f1Score.toFixed(3)),
      highConfidenceRate: total ? Number((highConfidence / total).toFixed(3)) : 0,
      retrainingEvents: this.retrainingEvents
    };
  }
}

export const federatedLearning = new FederatedLearningManager();
export const continuousLearning = new ContinuousLearningEngine();

