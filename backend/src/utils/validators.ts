export interface ValidationError {
  field: string;
  message: string;
}

export function validatePatientInput(data: any): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.firstName?.trim() && !data.name?.trim()) errors.push({ field: 'name', message: 'Patient name is required' });
  if (typeof data.age !== 'number' && typeof data.age_years !== 'number') errors.push({ field: 'age', message: 'Valid age is required' });
  return errors;
}

export function validateDiagnosisInput(data: any): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!data.patient && typeof data.patientAge !== 'number') errors.push({ field: 'patient', message: 'Patient data is required' });
  const age = data.patient?.age_years ?? data.patientAge;
  if (typeof age === 'number' && (age < 0 || age > 120)) errors.push({ field: 'age_years', message: 'Age must be between 0 and 120' });
  if (!data.chief_complaint && (!Array.isArray(data.symptoms) || data.symptoms.length === 0)) {
    errors.push({ field: 'symptoms', message: 'Symptoms or chief complaint are required' });
  }
  if (data.vitals) {
    const vitals = data.vitals;
    if (vitals.oxygen_saturation !== undefined && (vitals.oxygen_saturation < 40 || vitals.oxygen_saturation > 100)) {
      errors.push({ field: 'vitals.oxygen_saturation', message: 'SpO2 must be between 40 and 100' });
    }
    if (vitals.systolic_bp !== undefined && (vitals.systolic_bp < 40 || vitals.systolic_bp > 260)) {
      errors.push({ field: 'vitals.systolic_bp', message: 'Systolic BP must be between 40 and 260' });
    }
    if (vitals.diastolic_bp !== undefined && (vitals.diastolic_bp < 20 || vitals.diastolic_bp > 160)) {
      errors.push({ field: 'vitals.diastolic_bp', message: 'Diastolic BP must be between 20 and 160' });
    }
    if (vitals.temperature_c !== undefined && (vitals.temperature_c < 30 || vitals.temperature_c > 45)) {
      errors.push({ field: 'vitals.temperature_c', message: 'Temperature must be between 30C and 45C' });
    }
  }
  return errors;
}

export function validateRequest(validationFn: (data: any) => ValidationError[]) {
  return (req: any, res: any, next: any) => {
    const errors = validationFn(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }
    return next();
  };
}
