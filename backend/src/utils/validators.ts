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
  if (!data.chief_complaint && (!Array.isArray(data.symptoms) || data.symptoms.length === 0)) {
    errors.push({ field: 'symptoms', message: 'Symptoms or chief complaint are required' });
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
