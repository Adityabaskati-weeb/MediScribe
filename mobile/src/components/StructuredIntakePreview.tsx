import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../styles/ThemeContext';
import { extractClinicalSymptoms, extractClinicalVitals } from '../utils/clinicalText';

export function StructuredIntakePreview({ transcript }: { transcript: string }) {
  const { theme } = useAppTheme();
  const c = theme.colors;
  const parsed = useMemo(() => buildStructuredIntake(transcript), [transcript]);

  if (!transcript.trim()) {
    return (
      <View style={[styles.empty, { backgroundColor: c.surfaceSoft, borderColor: c.border }]}>
        <Text style={[styles.emptyTitle, { color: c.ink }]}>Voice becomes structured care</Text>
        <Text style={[styles.emptyCopy, { color: c.muted }]}>
          Speak or type symptoms. MediScribe will pull out danger signs, vitals, and next-step risk before AI review.
        </Text>
      </View>
    );
  }

  const riskPalette = {
    red: { bg: c.dangerSoft, fg: c.accent, label: 'Emergency risk' },
    amber: { bg: c.warningSoft, fg: c.warning, label: 'Watch closely' },
    green: { bg: c.successSoft, fg: c.success, label: 'Routine risk' }
  }[parsed.risk];

  return (
    <View style={[styles.wrap, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.kicker, { color: c.primaryDark }]}>Voice to medical structure</Text>
          <Text style={[styles.title, { color: c.ink }]}>Extracted from intake</Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: riskPalette.bg }]}>
          <Text style={[styles.riskText, { color: riskPalette.fg }]}>{riskPalette.label}</Text>
        </View>
      </View>

      <View style={styles.flow}>
        <View style={[styles.flowStep, { backgroundColor: c.infoSoft }]}>
          <Text style={[styles.flowLabel, { color: c.primaryDark }]}>Raw speech</Text>
        </View>
        <View style={[styles.flowLine, { backgroundColor: c.borderStrong }]} />
        <View style={[styles.flowStep, { backgroundColor: c.successSoft }]}>
          <Text style={[styles.flowLabel, { color: c.success }]}>Structured note</Text>
        </View>
        <View style={[styles.flowLine, { backgroundColor: c.borderStrong }]} />
        <View style={[styles.flowStep, { backgroundColor: riskPalette.bg }]}>
          <Text style={[styles.flowLabel, { color: riskPalette.fg }]}>Risk check</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <PreviewTile label="Symptoms" value={parsed.symptoms.join(', ')} />
        <PreviewTile label="Blood pressure" value={parsed.bp} />
        <PreviewTile label="Oxygen" value={parsed.oxygen} />
        <PreviewTile label="Temperature" value={parsed.temperature} />
      </View>

      {parsed.dangerSigns.length > 0 && (
        <View style={[styles.dangerStrip, { backgroundColor: c.dangerSoft, borderColor: c.accent }]}>
          <Text style={[styles.dangerTitle, { color: c.accent }]}>Danger signs found</Text>
          <Text style={[styles.dangerCopy, { color: c.ink }]}>{parsed.dangerSigns.join(', ')}</Text>
        </View>
      )}
    </View>
  );
}

function PreviewTile({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.tile, { backgroundColor: theme.colors.surfaceSoft, borderColor: theme.colors.border }]}>
      <Text style={[styles.tileLabel, { color: theme.colors.muted }]}>{label}</Text>
      <Text style={[styles.tileValue, { color: theme.colors.ink }]} numberOfLines={2}>{value || '--'}</Text>
    </View>
  );
}

function buildStructuredIntake(text: string) {
  const lower = text.toLowerCase();
  const vitals = extractClinicalVitals(text);
  const symptoms = extractClinicalSymptoms(text).slice(0, 4);
  const dangerSigns = [
    /pregnan/.test(lower) && /bleeding|abdominal pain|dizzy|headache|visual/.test(lower) ? 'maternal danger signs' : '',
    (vitals.oxygen_saturation ?? 100) < 94 ? 'low oxygen' : '',
    (vitals.systolic_bp ?? 999) < 90 ? 'shock-range BP' : '',
    /chest pain|left arm pain|sweating|unconscious|seizure/.test(lower) ? 'time-sensitive emergency' : ''
  ].filter(Boolean);
  const fever = /fever|temp\s*3[89]|temp\s*40/.test(lower);
  const risk = dangerSigns.length ? 'red' : fever ? 'amber' : 'green';

  return {
    symptoms,
    dangerSigns,
    risk: risk as 'red' | 'amber' | 'green',
    bp: vitals.systolic_bp ? `${vitals.systolic_bp}/${vitals.diastolic_bp || '--'} mmHg` : '--',
    oxygen: vitals.oxygen_saturation ? `${vitals.oxygen_saturation}%` : '--',
    temperature: vitals.temperature_c ? `${vitals.temperature_c} C` : '--'
  };
}

const styles = StyleSheet.create({
  empty: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 14
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '900'
  },
  emptyCopy: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20
  },
  wrap: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between'
  },
  kicker: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2
  },
  riskBadge: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7
  },
  riskText: {
    fontSize: 11,
    fontWeight: '900'
  },
  flow: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  flowStep: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 8
  },
  flowLabel: {
    fontSize: 11,
    fontWeight: '900'
  },
  flowLine: {
    flex: 1,
    height: 2
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tile: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 72,
    padding: 10,
    width: '48%'
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  tileValue: {
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
    marginTop: 5
  },
  dangerStrip: {
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 10
  },
  dangerTitle: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  dangerCopy: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20
  }
});
