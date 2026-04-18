import assert from 'assert';
import { validateDiagnosisInput, validatePatientInput } from '../utils/validators';

assert.deepEqual(validatePatientInput({ name: 'Asha', age_years: 58 }), []);
assert.ok(validatePatientInput({ age_years: 58 }).some((error) => error.field === 'name'));
assert.deepEqual(validateDiagnosisInput({
  patient: { age_years: 58, gender: 'female' },
  chief_complaint: 'Chest pain'
}), []);
assert.ok(validateDiagnosisInput({ patient: { age_years: 58 } }).some((error) => error.field === 'symptoms'));

console.log('Validator unit tests passed');
