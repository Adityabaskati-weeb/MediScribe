import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { colors } from '../styles/theme';

export function PatientHistory({ items }: { items: any[] }) {
  return (
    <View style={styles.list}>
      {items.length === 0 && (
        <Card>
          <Text style={styles.emptyTitle}>No local history yet</Text>
          <Text style={styles.meta}>Start a consultation and MediScribe will save the visit on this device for offline follow-up.</Text>
        </Card>
      )}
      {items.map((item, index) => (
        <Card style={styles.row} key={item.id || index}>
          <View style={styles.timelineRow}>
            <View style={styles.timelineDot} />
            <View style={styles.body}>
              <Text style={styles.title}>{item.possibleDiagnosis1 || item.assessment?.clinical_summary || 'Visit'}</Text>
              <Text style={styles.meta}>Risk: {item.urgency || item.assessment?.urgency || 'routine'}</Text>
              <Text style={styles.meta}>{item.created_at || item.assessment?.created_at}</Text>
              <Text style={styles.scan}>Photo/OCR record ready for review</Text>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10
  },
  row: {
    gap: 4
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12
  },
  timelineDot: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 16,
    marginTop: 2,
    width: 16
  },
  body: {
    flex: 1,
    gap: 4
  },
  title: {
    color: colors.ink,
    fontWeight: '700'
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900'
  },
  meta: {
    color: colors.muted
  },
  scan: {
    color: colors.primaryDark,
    fontWeight: '800'
  }
});
