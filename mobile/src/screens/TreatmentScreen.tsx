import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ConsultationDraft, ScreenName } from '../App';
import { ActionButton } from '../components/ActionButton';
import { Card } from '../components/Card';
import { ConsultationProgress } from '../components/ConsultationProgress';
import { RedFlagGuardian } from '../components/RedFlagGuardian';
import { ReferralLetter } from '../components/ReferralLetter';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusPill } from '../components/StatusPill';
import { updateClinicOutcome } from '../services/databaseService';
import { colors, spacing } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import type { ClinicOutcome } from '../types/clinical';
import { medicineSafetyMessages } from '../utils/clinicalDecisionSupport';

export function TreatmentScreen({
  draft,
  onDraftChange,
  onNavigate
}: {
  draft: ConsultationDraft;
  onDraftChange: (draft: ConsultationDraft) => void;
  onNavigate: (screen: ScreenName) => void;
}) {
  const assessment = draft.assessment;
  const treatment = assessment?.treatment;
  const urgent = assessment ? ['immediate', 'emergent'].includes(assessment.urgency) : false;
  const { theme } = useAppTheme();
  const c = theme.colors;
  const selectedOutcome = assessment?.clinic_outcome?.status;

  const setOutcome = (status: ClinicOutcome['status'], note: string) => {
    if (!assessment) return;
    const clinicOutcome: ClinicOutcome = {
      status,
      updated_at: new Date().toISOString(),
      note
    };
    onDraftChange({
      ...draft,
      assessment: {
        ...assessment,
        clinic_outcome: clinicOutcome
      }
    });
    updateClinicOutcome(assessment.assessment_id, clinicOutcome);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActionButton compact title="Back" onPress={() => onNavigate('diagnosis')} variant="secondary" />
      <ScreenHeader
        eyebrow="Step 5 of 5"
        title="Treatment and guidelines"
        subtitle="WHO-style safety checks, local medicine reminders, and referral guidance."
        right={<StatusPill label={urgent ? 'Refer now' : 'Guided care'} tone={urgent ? 'danger' : 'success'} />}
      />
      <ConsultationProgress current={5} />
      <RedFlagGuardian text={draft.transcript || assessment?.clinical_summary || ''} patient={draft.patient} />

      {urgent && (
        <View style={[styles.emergency, { backgroundColor: c.dangerSoft, borderColor: c.accent }]}>
          <Text style={[styles.emergencyTitle, { color: c.accent }]}>Refer now</Text>
          <Text style={[styles.emergencyCopy, { color: theme.mode === 'dark' ? '#ffd7d2' : '#7f1d1d' }]}>Do not wait for sync. Repeat vitals, monitor ABCs, and arrange transfer.</Text>
        </View>
      )}

      <Card>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>Immediate actions</Text>
        {(treatment?.immediate_actions || ['Record vitals', 'Use local protocol', 'Give safety-net instructions']).map((item: string) => (
          <Text style={[styles.item, { color: c.ink }]} key={item}>- {item}</Text>
        ))}
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>Guideline grounding</Text>
        <Text style={[styles.item, { color: c.ink }]}>
          {assessment?.evidence_summary || 'Check danger signs before medicine advice, repeat abnormal vitals, and use local protocol before referral.'}
        </Text>
        {(assessment?.citations || []).map((citation) => (
          <View key={citation.id} style={[styles.citationCard, { backgroundColor: c.surfaceSoft, borderColor: c.border }]}>
            <Text style={[styles.citationTitle, { color: c.ink }]}>{citation.title}</Text>
            <Text style={[styles.citationMeta, { color: c.muted }]}>
              {citation.organization}{citation.updated_at ? ` | ${citation.updated_at}` : ''}
            </Text>
            <Text style={[styles.citationReason, { color: c.ink }]}>{citation.why_it_applies}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>Local medicines to consider</Text>
        {(treatment?.medications_to_consider?.length ? treatment.medications_to_consider : ['Oral rehydration salts if dehydrated', 'Paracetamol per local age/weight protocol', 'Antibiotics only when local guideline criteria are met']).map((item: string) => (
          <Text style={[styles.item, { color: c.ink }]} key={item}>- {item}</Text>
        ))}
        <Text style={[styles.disclaimer, { color: c.muted }]}>Dosage must follow local protocol, weight, allergies, pregnancy status, and clinician approval.</Text>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>Medicine safety guard</Text>
        {medicineSafetyMessages(draft.patient).map((item) => (
          <Text style={[styles.safetyItem, { backgroundColor: c.warningSoft, borderColor: c.warning, color: c.ink }]} key={item}>{item}</Text>
        ))}
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>Clinic outcome</Text>
        <Text style={[styles.item, { color: c.ink }]}>
          Capture what happened next so the demo shows resolution, not just a diagnosis.
        </Text>
        <View style={styles.outcomeGrid}>
          {[
            {
              status: 'stabilized_before_transfer' as const,
              label: 'Stabilized before transfer',
              note: 'ABCs stabilized and repeat vitals captured before transfer.'
            },
            {
              status: 'transfer_completed' as const,
              label: 'Transfer completed',
              note: 'Patient handed off to the receiving facility.'
            },
            {
              status: 'follow_up_due' as const,
              label: 'Follow-up due',
              note: 'Needs clinician review or check-in at the next visit.'
            }
          ].map((option) => {
            const active = selectedOutcome === option.status;
            return (
              <Pressable
                key={option.status}
                style={[
                  styles.outcomeTile,
                  {
                    backgroundColor: active ? (option.status === 'transfer_completed' ? c.successSoft : option.status === 'stabilized_before_transfer' ? c.infoSoft : c.warningSoft) : c.surfaceSoft,
                    borderColor: active ? (option.status === 'transfer_completed' ? c.success : option.status === 'stabilized_before_transfer' ? c.primary : c.warning) : c.border
                  }
                ]}
                onPress={() => setOutcome(option.status, option.note)}
              >
                <Text style={[styles.outcomeTitle, { color: c.ink }]}>{option.label}</Text>
                <Text style={[styles.outcomeNote, { color: c.muted }]}>{option.note}</Text>
              </Pressable>
            );
          })}
        </View>
        {assessment?.clinic_outcome ? (
          <Text style={[styles.disclaimer, { color: c.muted }]}>
            Current status: {formatOutcomeLabel(assessment.clinic_outcome.status)} | updated {assessment.clinic_outcome.updated_at}
          </Text>
        ) : null}
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: c.ink }]}>Follow up</Text>
        <Text style={[styles.item, { color: c.ink }]}>{treatment?.follow_up || 'Review if symptoms worsen, fever persists, or new danger signs appear.'}</Text>
        <Text style={[styles.referral, { color: urgent ? c.accent : c.primaryDark }]}>Referral plan: {cleanReferralText(treatment?.referral, urgent)}</Text>
        {assessment?.referral_handoff?.destination ? (
          <Text style={[styles.item, { color: c.ink }]}>Receiving facility: {assessment.referral_handoff.destination}</Text>
        ) : null}
      </Card>

      <ReferralLetter patient={draft.patient} transcript={draft.transcript} assessment={assessment} />

      <ActionButton title="Save and Return Home" onPress={() => onNavigate('home')} variant="success" />
    </ScrollView>
  );
}

function cleanReferralText(referral?: string, urgent = false) {
  if (urgent) return 'Emergency transfer now';
  if (!referral) return 'Routine follow-up unless red flags develop';
  return referral
    .replace(/^Immediate emergency referral$/i, 'Emergency transfer now')
    .replace(/^Urgent clinician review$/i, 'Urgent clinician review today')
    .replace(/^Same-day review$/i, 'Same-day clinical review')
    .replace(/^Routine follow-up$/i, 'Routine follow-up');
}

function formatOutcomeLabel(status: ClinicOutcome['status']) {
  return ({
    transfer_completed: 'Transfer completed',
    stabilized_before_transfer: 'Stabilized before transfer',
    follow_up_due: 'Follow-up due'
  } as Record<ClinicOutcome['status'], string>)[status];
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
  },
  citationCard: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 10
  },
  citationTitle: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19
  },
  citationMeta: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16
  },
  citationReason: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19
  },
  outcomeGrid: {
    gap: 10
  },
  outcomeTile: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12
  },
  outcomeTitle: {
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 20
  },
  outcomeNote: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18
  }
});
