import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function PatientHistory({ items }: { items: any[] }) {
  return (
    <View style={styles.list}>
      {items.length === 0 && <Text>No local history yet.</Text>}
      {items.map((item, index) => (
        <View style={styles.row} key={item.id || index}>
          <Text style={styles.title}>{item.possibleDiagnosis1 || item.assessment?.clinical_summary || 'Visit'}</Text>
          <Text>{item.urgency || item.assessment?.urgency || 'routine'}</Text>
          <Text>{item.created_at || item.assessment?.created_at}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10
  },
  row: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    gap: 4,
    padding: 12
  },
  title: {
    fontWeight: '700'
  }
});
