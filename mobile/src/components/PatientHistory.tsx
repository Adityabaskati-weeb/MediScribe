import React from 'react';
import { Text, View } from 'react-native';

export function PatientHistory({ items }: { items: any[] }) {
  return (
    <View>
      {items.map((item, index) => <Text key={index}>{item.assessment?.clinical_summary || 'Visit'}</Text>)}
    </View>
  );
}
