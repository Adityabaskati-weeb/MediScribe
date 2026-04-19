import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton } from './ActionButton';
import { Card } from './Card';
import { colors } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
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
  const { theme } = useAppTheme();
  const c = theme.colors;

  const canSubmit = name.trim().length > 1 && Number(age) > 0;
  const genderOptions = ['female', 'male', 'other'];

  const field = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    placeholder: string,
    options?: { keyboardType?: 'default' | 'number-pad' | 'phone-pad'; multiline?: boolean }
  ) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: c.muted }]}>{label}</Text>
      <TextInput
        multiline={options?.multiline}
        numberOfLines={options?.multiline ? 3 : 1}
        keyboardType={options?.keyboardType || 'default'}
        placeholder={placeholder}
        placeholderTextColor={c.quiet}
        style={[
          styles.input,
          { backgroundColor: c.surfaceSoft, borderColor: c.border, color: c.ink },
          options?.multiline && styles.multilineInput
        ]}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );

  return (
    <Card>
      <View style={[styles.formHeader, { backgroundColor: c.infoSoft, borderColor: c.border }]}>
        <Text style={[styles.eyebrow, { color: c.primary }]}>{t(language, 'patientProfile')}</Text>
        <Text style={[styles.heading, { color: c.ink }]}>Fast registration for clinic queues</Text>
        <Text style={[styles.helper, { color: c.muted }]}>Name and age are required. Everything else improves safety checks.</Text>
      </View>
      <Text style={[styles.heading, { color: c.ink }]}>Required details</Text>
      {field(t(language, 'patientName'), name, setName, 'Full name')}
      <View style={styles.row}>
        <View style={styles.rowItem}>{field(t(language, 'age'), age, setAge, 'Years', { keyboardType: 'number-pad' })}</View>
        <View style={styles.rowItem}>
          <Text style={[styles.label, { color: c.muted }]}>{t(language, 'gender')}</Text>
          <View style={styles.genderRow}>
            {genderOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => setGender(option)}
                style={[
                  styles.genderChip,
                  { backgroundColor: c.surfaceSoft, borderColor: c.border },
                  gender === option && { backgroundColor: c.primaryDark, borderColor: c.primaryDark }
                ]}
              >
                <Text style={[styles.genderText, { color: gender === option ? '#ffffff' : c.ink }]}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={[styles.sectionDivider, { backgroundColor: c.border }]} />
      <Text style={[styles.heading, { color: c.ink }]}>Contact and location</Text>
      {field(t(language, 'phone'), phone, setPhone, 'Mobile number', { keyboardType: 'phone-pad' })}
      {field(t(language, 'address'), address, setAddress, 'Village / clinic / block', { multiline: true })}
      {field(t(language, 'emergencyContact'), emergencyContact, setEmergencyContact, 'Family contact or ASHA worker', { keyboardType: 'phone-pad' })}

      <View style={[styles.sectionDivider, { backgroundColor: c.border }]} />
      <Text style={[styles.heading, { color: c.ink }]}>Clinical risk notes</Text>
      {field(t(language, 'conditions'), conditions, setConditions, 'Diabetes, asthma, hypertension', { multiline: true })}
      {field(t(language, 'allergies'), allergies, setAllergies, 'Medicine or food allergies', { multiline: true })}
      {field(t(language, 'medications'), medications, setMedications, 'Current medicines, comma separated', { multiline: true })}
      <View style={styles.row}>
        <View style={styles.rowItem}>{field(t(language, 'pregnancyWeeks'), pregnancyWeeks, setPregnancyWeeks, 'Weeks', { keyboardType: 'number-pad' })}</View>
        <View style={styles.rowItem}>{field(t(language, 'postpartumDays'), postpartumDays, setPostpartumDays, 'Days', { keyboardType: 'number-pad' })}</View>
      </View>
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
  formHeader: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    padding: 12
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  heading: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900'
  },
  helper: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19
  },
  field: {
    gap: 7
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 11
  },
  multilineInput: {
    minHeight: 84,
    textAlignVertical: 'top'
  },
  row: {
    flexDirection: 'row',
    gap: 10
  },
  rowItem: {
    flex: 1
  },
  genderRow: {
    flexDirection: 'row',
    gap: 6
  },
  genderChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  genderChipActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark
  },
  genderText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'capitalize'
  },
  sectionDivider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 2
  }
});
