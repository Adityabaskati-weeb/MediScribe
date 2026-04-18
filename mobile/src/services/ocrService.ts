export interface OCRResult {
  extractedText: string;
  confidence: number;
  blocks: Array<{ text: string; bounds: { top: number; left: number; width: number; height: number } }>;
}

export async function captureAndOCRMedicalChart(): Promise<string> {
  return 'Name: Demo Patient age 45. Complaint: fever and cough. BP 120/80 HR 90 temp 38.2';
}

export async function parseExtractedMedicalData(extractedText: string): Promise<{
  vitals: Record<string, number>;
  symptoms: string[];
  diagnosis: string | null;
  medications: string[];
}> {
  const vitals: Record<string, number> = {};
  const symptoms: string[] = [];
  const medications: string[] = [];

  const bp = extractedText.match(/\b(?:bp|blood pressure)?\D{0,12}(\d{2,3})\s*\/\s*(\d{2,3})\b/i);
  if (bp) {
    vitals.systolic_bp = Number(bp[1]);
    vitals.diastolic_bp = Number(bp[2]);
  }

  const heartRate = extractedText.match(/\b(?:hr|heart rate|pulse)\D{0,12}(\d{2,3})\b/i);
  if (heartRate) vitals.heart_rate = Number(heartRate[1]);

  const temp = extractedText.match(/\b(?:temp|temperature)\D{0,12}(\d{2}(?:\.\d)?)\b/i);
  if (temp) vitals.temperature_c = Number(temp[1]);

  const complaint = extractedText.match(/\b(?:complaint|symptoms?)\s*:\s*([^.;]+)/i)?.[1];
  if (complaint) {
    symptoms.push(...complaint.split(/,|\band\b/i).map((item) => item.trim()).filter(Boolean));
  }

  const diagnosis = extractedText.match(/\bdiagnosis\s*:\s*([^.;]+)/i)?.[1]?.trim() || null;
  const meds = extractedText.match(/\b(?:meds|medications?)\s*:\s*([^.;]+)/i)?.[1];
  if (meds) medications.push(...meds.split(/,|\band\b/i).map((item) => item.trim()).filter(Boolean));

  return { vitals, symptoms, diagnosis, medications };
}
