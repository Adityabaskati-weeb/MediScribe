import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import { colors } from '../styles/theme';

export function PatientHistory({ items }: { items: any[] }) {
  return (
    <View style={styles.list}>
      {items.length === 0 && <Text>No local history yet.</Text>}
      {items.map((item, index) => (
        <Card style={styles.row} key={item.id || index}>
          <Text style={styles.title}>{item.possibleDiagnosis1 || item.assessment?.clinical_summary || 'Visit'}</Text>
          <Text style={styles.meta}>{item.urgency || item.assessment?.urgency || 'routine'}</Text>
          <Text style={styles.meta}>{item.created_at || item.assessment?.created_at}</Text>
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
  title: {
    color: colors.ink,
    fontWeight: '700'
  },
  meta: {
    color: colors.muted
  }
});
