import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import { ConsultationProgress } from '../components/ConsultationProgress';
import { RedFlagGuardian } from '../components/RedFlagGuardian';
import { ScreenHeader } from '../components/ScreenHeader';
import { SmartFollowUpQuestions } from '../components/SmartFollowUpQuestions';
import { StatusPill } from '../components/StatusPill';
import { VitalSignsDisplay } from '../components/VitalSignsDisplay';
import { colors, spacing } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import { extractClinicalSymptoms, extractClinicalVitals } from '../utils/clinicalText';

export function PatientSummaryScreen({
  draft,
  onDraftChange,
  onNavigate
}: {
  draft: ConsultationDraft;
  onDraftChange: (draft: ConsultationDraft) => void;
  onNavigate: (screen: ScreenName) => void;
}) {
  const [notes, setNotes] = useState(draft.transcript || '');
  const { theme } = useAppTheme();
  const risk = useMemo(() => getRisk(notes), [notes]);
  const vitals = useMemo(() => extractVitals(notes), [notes]);
  const symptoms = useMemo(() => extractSymptoms(notes), [notes]);

  const continueToDiagnosis = () => {
    onDraftChange({ ...draft, transcript: notes });
    onNavigate('diagnosis');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActionButton compact title="Back" onPress={() => onNavigate('voice')} variant="secondary" />
      <ScreenHeader
        eyebrow="Step 3 of 5"
        title="Patient summary"
        subtitle="Confirm the intake before AI review. Correct anything that looks incomplete."
        right={<StatusPill label={riskLabel(risk)} tone={riskTone(risk)} />}
      />
      <ConsultationProgress current={3} />
      <RiskBanner risk={risk} />
      <RedFlagGuardian text={notes} patient={draft.patient} />

      <SmartFollowUpQuestions
        text={notes}
        patient={draft.patient}
        onAddQuestion={(question) => setNotes((current) => `${current.trim()}\nFollow-up needed: ${question}`.trim())}
      />

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.ink }]}>Patient</Text>
        <Text style={[styles.line, { color: theme.colors.muted }]}>{draft.patient?.name || 'Unnamed patient'} - {draft.patient?.age_years || '--'} yrs - {draft.patient?.gender || 'unknown'}</Text>
        <Text style={[styles.line, { color: theme.colors.muted }]}>{draft.patient?.address || 'Village not added'}</Text>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.ink }]}>Symptoms found</Text>
        <View style={styles.chips}>
          {symptoms.map((item) => <Text style={[styles.chip, { backgroundColor: theme.colors.infoSoft, color: theme.colors.primaryDark }]} key={item}>{item}</Text>)}
        </View>
      </Card>

      <VitalSignsDisplay vitals={vitals} />

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.ink }]}>Correct intake notes</Text>
        <TextInput
          multiline
          numberOfLines={7}
          value={notes}
          onChangeText={setNotes}
          placeholderTextColor={theme.colors.quiet}
          placeholder="Edit symptoms, vitals, medicine, pregnancy status, or danger signs."
          style={[
            styles.input,
            { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border, color: theme.colors.ink }
          ]}
        />
      </Card>

      <ActionButton title="Run AI Diagnosis" onPress={continueToDiagnosis} disabled={!notes.trim()} />
    </ScrollView>
  );
}

function riskLabel(risk: 'red' | 'yellow' | 'green') {
  if (risk === 'red') return 'High risk';
  if (risk === 'yellow') return 'Watch closely';
  return 'Stable';
}

function riskTone(risk: 'red' | 'yellow' | 'green') {
  if (risk === 'red') return 'danger';
  if (risk === 'yellow') return 'warning';
  return 'success';
}

function RiskBanner({ risk }: { risk: 'red' | 'yellow' | 'green' }) {
  const { theme } = useAppTheme();
  const copy = {
    red: ['Emergency risk', 'Stabilize and prepare referral now.'],
    yellow: ['Needs same-day review', 'Check vitals again and watch danger signs.'],
    green: ['Routine risk', 'Continue assessment and safety-net advice.']
  }[risk];
  const palette = {
    red: { backgroundColor: theme.colors.dangerSoft, borderColor: theme.colors.accent },
    yellow: { backgroundColor: theme.colors.warningSoft, borderColor: theme.colors.warning },
    green: { backgroundColor: theme.colors.successSoft, borderColor: theme.colors.success }
  }[risk];
  return (
    <View style={[styles.riskBanner, palette]}>
      <Text style={[styles.riskTitle, { color: theme.colors.ink }]}>{copy[0]}</Text>
      <Text style={[styles.riskCopy, { color: theme.colors.muted }]}>{copy[1]}</Text>
    </View>
  );
}

function getRisk(text: string) {
  const lower = text.toLowerCase();
  if (/chest pain|stroke|unconscious|seizure|spo2\s*(8|7|6)|bp\s*8\d|pregnan.*headache|bleeding/.test(lower)) return 'red';
  if (/fever|dengue|pneumonia|vomiting|dehydration|temp\s*3[89]|bp\s*1[4-9]\d/.test(lower)) return 'yellow';
  return 'green';
}

function extractSymptoms(text: string) {
  return extractClinicalSymptoms(text);
}

function extractVitals(text: string) {
  const extracted = extractClinicalVitals(text);
  return {
    BP: extracted.systolic_bp ? `${extracted.systolic_bp}/${extracted.diastolic_bp || '--'}` : '--',
    HR: extracted.heart_rate || '--',
    SpO2: extracted.oxygen_saturation || '--',
    Temp: extracted.temperature_c || '--'
  };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: 14,
    padding: spacing.lg
  },
  riskBanner: {
    borderRadius: 8,
    gap: 4,
    padding: 16
  },
  redRisk: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#f1b2b2',
    borderWidth: 1
  },
  yellowRisk: {
    backgroundColor: colors.warningSoft,
    borderColor: '#f5d08a',
    borderWidth: 1
  },
  greenRisk: {
    backgroundColor: colors.successSoft,
    borderColor: '#b8e7d1',
    borderWidth: 1
  },
  riskTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900'
  },
  riskCopy: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700'
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900'
  },
  line: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    backgroundColor: colors.infoSoft,
    borderRadius: 8,
    color: colors.primaryDark,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  vitalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  vital: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: '47%',
    padding: 12
  },
  vitalLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900'
  },
  vitalValue: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900'
  },
  input: {
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 150,
    padding: 12,
    textAlignVertical: 'top'
  }
});
