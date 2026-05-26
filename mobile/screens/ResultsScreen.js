import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { colors } from '../assets/colors';

export const ResultsScreen = ({ route, navigation }) => {
  const { results } = route.params || {};

  const handleReset = () => {
    navigation.navigate('Upload');
  };

  return (
    <View style={styles.container}>
      <ResultsDisplay results={results} onReset={handleReset} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});