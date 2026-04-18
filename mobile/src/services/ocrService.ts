import * as ImagePicker from 'expo-image-picker';

export interface OCRResult {
  extractedText: string;
  confidence: number;
  imageUri?: string;
  blocks: Array<{ text: string; bounds: { top: number; left: number; width: number; height: number } }>;
}

export async function captureMedicalChartImage(source: 'camera' | 'library' = 'camera'): Promise<OCRResult> {
  const permission = source === 'camera'
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error(source === 'camera' ? 'Camera permission is required to scan charts.' : 'Photo permission is required to import charts.');
  }

  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false })
    : await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: false, mediaTypes: ['images'] });

  if (result.canceled || !result.assets?.[0]?.uri) {
    throw new Error('Chart scan cancelled.');
  }

  return {
    imageUri: result.assets[0].uri,
    extractedText: '',
    confidence: 0,
    blocks: []
  };
}

export async function captureAndOCRMedicalChart(): Promise<string> {
  const result = await captureMedicalChartImage('camera');
  return result.extractedText || `Chart image captured: ${result.imageUri}. Enter or confirm extracted text below.`;
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

  const spo2 = extractedText.match(/\b(?:spo2|oxygen|o2 sat|saturation)\D{0,12}(\d{2,3})\s*%?\b/i);
  if (spo2) vitals.oxygen_saturation = Number(spo2[1]);

  const rr = extractedText.match(/\b(?:rr|respiratory rate|resp rate)\D{0,12}(\d{1,2})\b/i);
  if (rr) vitals.respiratory_rate = Number(rr[1]);

  const glucose = extractedText.match(/\b(?:glucose|sugar|rbs)\D{0,12}(\d{2,4})\b/i);
  if (glucose) vitals.glucose_mg_dl = Number(glucose[1]);

  const complaint = extractedText.match(/\b(?:complaint|symptoms?)\s*:\s*([^.;]+)/i)?.[1];
  if (complaint) {
    symptoms.push(...complaint.split(/,|\band\b/i).map((item) => item.trim()).filter(Boolean));
  } else {
    const commonSymptoms = ['fever', 'cough', 'chest pain', 'shortness of breath', 'vomiting', 'rash', 'abdominal pain', 'confusion'];
    symptoms.push(...commonSymptoms.filter((symptom) => extractedText.toLowerCase().includes(symptom)));
  }

  const diagnosis = extractedText.match(/\bdiagnosis\s*:\s*([^.;]+)/i)?.[1]?.trim() || null;
  const meds = extractedText.match(/\b(?:meds|medications?)\s*:\s*([^.;]+)/i)?.[1];
  if (meds) medications.push(...meds.split(/,|\band\b/i).map((item) => item.trim()).filter(Boolean));

  return { vitals, symptoms, diagnosis, medications };
}
