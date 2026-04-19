import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import { RedFlagGuardian } from '../components/RedFlagGuardian';
import { ReferralLetter } from '../components/ReferralLetter';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusPill } from '../components/StatusPill';
import { colors, spacing } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import { medicineSafetyMessages } from '../utils/clinicalDecisionSupport';

export function TreatmentScreen({ draft, onNavigate }: { draft: ConsultationDraft; onNavigate: (screen: ScreenName) => void }) {
  const assessment = draft.assessment;
  const treatment = assessment?.treatment || {};
  const urgent = ['immediate', 'emergent'].includes(assessment?.urgency);
  const { theme } = useAppTheme();

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActionButton compact title="Back" onPress={() => onNavigate('diagnosis')} variant="secondary" />
      <ScreenHeader
        eyebrow="Step 5 of 5"
        title="Treatment and guidelines"
        subtitle="WHO-style safety checks, local medicine reminders, and referral guidance."
        right={<StatusPill label={urgent ? 'Refer now' : 'Guided care'} tone={urgent ? 'danger' : 'success'} />}
      />
      <RedFlagGuardian text={draft.transcript || assessment?.clinical_summary || ''} patient={draft.patient} />

      {urgent && (
        <View style={styles.emergency}>
          <Text style={styles.emergencyTitle}>Refer to hospital now</Text>
          <Text style={styles.emergencyCopy}>Keep airway, breathing, circulation under observation until transfer.</Text>
        </View>
      )}

      <Card>
        <Text style={styles.sectionTitle}>Immediate actions</Text>
        {(treatment.immediate_actions || ['Record vitals', 'Use local protocol', 'Give safety-net instructions']).map((item: string) => (
          <Text style={styles.item} key={item}>- {item}</Text>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>WHO-style offline guidance</Text>
        <Text style={styles.item}>- Check danger signs before medicine advice.</Text>
        <Text style={styles.item}>- Repeat abnormal vitals and document trend.</Text>
        <Text style={styles.item}>- Refer immediately for red flags, pregnancy danger signs, low oxygen, altered consciousness, or severe dehydration.</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Local medicines to consider</Text>
        {(treatment.medications_to_consider?.length ? treatment.medications_to_consider : ['Oral rehydration salts if dehydrated', 'Paracetamol per local age/weight protocol', 'Antibiotics only when local guideline criteria are met']).map((item: string) => (
          <Text style={styles.item} key={item}>- {item}</Text>
        ))}
        <Text style={styles.disclaimer}>Dosage must follow local protocol, weight, allergies, pregnancy status, and clinician approval.</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Medicine safety guard</Text>
        {medicineSafetyMessages(draft.patient).map((item) => (
          <Text style={styles.safetyItem} key={item}>{item}</Text>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Follow up</Text>
        <Text style={styles.item}>{treatment.follow_up || 'Review if symptoms worsen, fever persists, or new danger signs appear.'}</Text>
        <Text style={styles.referral}>Referral: {treatment.referral || 'Routine unless red flags develop'}</Text>
      </Card>

      <ReferralLetter patient={draft.patient} transcript={draft.transcript} assessment={assessment} />

      <ActionButton title="Save and Return Home" onPress={() => onNavigate('home')} variant="success" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: 14,
    padding: spacing.lg
  },
  emergency: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#ef9a9a',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16
  },
  emergencyTitle: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '900'
  },
  emergencyCopy: {
    color: '#7f1d1d',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900'
  },
  item: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 23
  },
  referral: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 24
  },
  disclaimer: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18
  },
  safetyItem: {
    backgroundColor: colors.warningSoft,
    borderColor: '#f0cf8f',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    padding: 10
  }
});
