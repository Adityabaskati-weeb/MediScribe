import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { colors } from '../styles/theme';
import { useAppTheme } from '../styles/ThemeContext';
import type { PatientProfile } from '../types/clinical';
import { followUpQuestions } from '../utils/clinicalDecisionSupport';

export function SmartFollowUpQuestions({
  text,
  patient,
  onAddQuestion
}: {
  text: string;
  patient?: PatientProfile;
  onAddQuestion?: (question: string) => void;
}) {
  const questions = followUpQuestions(text, patient);
  const { theme } = useAppTheme();
  const c = theme.colors;
  if (!questions.length) return null;

  return (
    <Card>
      <Text style={[styles.eyebrow, { color: c.primary }]}>Next-question agent</Text>
      <Text style={[styles.heading, { color: c.ink }]}>Ask before diagnosis</Text>
      {questions.map((question, index) => (
        <Pressable
          accessibilityRole="button"
          key={question}
          onPress={() => onAddQuestion?.(question)}
          style={[styles.question, { backgroundColor: c.surfaceSoft, borderColor: c.border }]}
        >
          <View style={[styles.index, { backgroundColor: c.infoSoft }]}><Text style={[styles.indexText, { color: c.primaryDark }]}>{index + 1}</Text></View>
          <Text style={[styles.questionText, { color: c.ink }]}>{question}</Text>
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  heading: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900'
  },
  question: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12
  },
  index: {
    alignItems: 'center',
    backgroundColor: colors.infoSoft,
    borderRadius: 8,
    height: 30,
    justifyContent: 'center',
    width: 30
  },
  indexText: {
    color: colors.primaryDark,
    fontWeight: '900'
  },
  questionText: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21
  }
});
