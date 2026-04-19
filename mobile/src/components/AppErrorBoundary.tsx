import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../styles/theme';

type AppErrorBoundaryProps = {
  children: React.ReactNode;
  resetKey: number;
  onReturnHome: () => void;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidUpdate(previousProps: AppErrorBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: undefined });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.eyebrow}>MediScribe recovered</Text>
        <Text style={styles.title}>The consultation screen hit an error.</Text>
        <Text style={styles.copy}>Your device is still usable. Return home and restart the demo without clearing the whole app.</Text>
        {this.state.message ? <Text style={styles.detail}>{this.state.message}</Text> : null}
        <Pressable accessibilityRole="button" onPress={this.props.onReturnHome} style={styles.button}>
          <Text style={styles.buttonText}>Return home</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    gap: 14,
    justifyContent: 'center',
    padding: spacing.xl
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34
  },
  copy: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23
  },
  detail: {
    backgroundColor: colors.dangerSoft,
    borderColor: '#efb2ac',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 19,
    padding: 12
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    minHeight: 54,
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 16
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900'
  }
});

