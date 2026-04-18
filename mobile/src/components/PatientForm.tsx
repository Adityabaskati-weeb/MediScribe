import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { ActionButton } from './ActionButton';
import { Card } from './Card';
import { colors } from '../styles/theme';
import { t } from '../utils/i18n';

export function PatientForm({ language, onSubmit }: { language: string; onSubmit: (patient: any) => void }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('unknown');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [pregnancyWeeks, setPregnancyWeeks] = useState('');
  const [postpartumDays, setPostpartumDays] = useState('');

  const canSubmit = name.trim().length > 1 && Number(age) > 0;

  return (
    <Card>
      <Text style={styles.eyebrow}>{t(language, 'patientProfile')}</Text>
      <Text style={styles.heading}>{t(language, 'registerPatient')}</Text>
      <TextInput style={styles.input} placeholder={t(language, 'patientName')} value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder={t(language, 'age')} keyboardType="number-pad" value={age} onChangeText={setAge} />
      <TextInput style={styles.input} placeholder={t(language, 'gender')} value={gender} onChangeText={setGender} />
      <TextInput style={styles.input} placeholder={t(language, 'phone')} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder={t(language, 'address')} value={address} onChangeText={setAddress} />
      <TextInput style={styles.input} placeholder={t(language, 'emergencyContact')} value={emergencyContact} onChangeText={setEmergencyContact} />
      <TextInput style={styles.input} placeholder={t(language, 'conditions')} value={conditions} onChangeText={setConditions} />
      <TextInput style={styles.input} placeholder={t(language, 'allergies')} value={allergies} onChangeText={setAllergies} />
      <TextInput style={styles.input} placeholder={t(language, 'medications')} value={medications} onChangeText={setMedications} />
      <TextInput style={styles.input} placeholder={t(language, 'pregnancyWeeks')} keyboardType="number-pad" value={pregnancyWeeks} onChangeText={setPregnancyWeeks} />
      <TextInput style={styles.input} placeholder={t(language, 'postpartumDays')} keyboardType="number-pad" value={postpartumDays} onChangeText={setPostpartumDays} />
      <ActionButton
        title={t(language, 'registerContinue')}
        disabled={!canSubmit}
        onPress={() => onSubmit({
          name,
          age_years: Number(age),
          gender,
          phone,
          address,
          emergencyContact,
          known_conditions: splitList(conditions),
          allergies: splitList(allergies),
          medications: splitList(medications),
          pregnancy_weeks: pregnancyWeeks ? Number(pregnancyWeeks) : undefined,
          postpartum_days: postpartumDays ? Number(postpartumDays) : undefined
        })}
      />
    </Card>
  );
}

function splitList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  heading: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700'
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  }
});
