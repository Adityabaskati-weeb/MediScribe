import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { ActionButton } from './ActionButton';
import { Card } from './Card';
import { colors } from '../styles/theme';

export function PatientForm({ onSubmit }: { onSubmit: (patient: any) => void }) {
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
      <Text style={styles.eyebrow}>Patient profile</Text>
      <Text style={styles.heading}>Patient registration</Text>
      <TextInput style={styles.input} placeholder="Patient name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Age" keyboardType="number-pad" value={age} onChangeText={setAge} />
      <TextInput style={styles.input} placeholder="Gender: female, male, other, unknown" value={gender} onChangeText={setGender} />
      <TextInput style={styles.input} placeholder="Phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Village / address" value={address} onChangeText={setAddress} />
      <TextInput style={styles.input} placeholder="Emergency contact" value={emergencyContact} onChangeText={setEmergencyContact} />
      <TextInput style={styles.input} placeholder="Known conditions, comma separated" value={conditions} onChangeText={setConditions} />
      <TextInput style={styles.input} placeholder="Allergies, comma separated" value={allergies} onChangeText={setAllergies} />
      <TextInput style={styles.input} placeholder="Current medications, comma separated" value={medications} onChangeText={setMedications} />
      <TextInput style={styles.input} placeholder="Pregnancy weeks, if applicable" keyboardType="number-pad" value={pregnancyWeeks} onChangeText={setPregnancyWeeks} />
      <TextInput style={styles.input} placeholder="Postpartum days, if applicable" keyboardType="number-pad" value={postpartumDays} onChangeText={setPostpartumDays} />
      <ActionButton
        title="Register and Continue"
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
