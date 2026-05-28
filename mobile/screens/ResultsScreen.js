import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { getMockAnalysisData } from '../api/apiClient';
import { colors } from '../assets/colors';

export const ResultsScreen = ({ route, navigation }) => {
  const [results, setResults] = useState(null);
  const [isSample, setIsSample] = useState(false);

  useEffect(() => {
    if (route.params?.results) {
      setResults(route.params.results);
      setIsSample(route.params.isSample || false);
    } else {
      // Default to sample data if no results provided
      setResults(getMockAnalysisData());
      setIsSample(true);
    }
  }, [route.params]);

  const handleReset = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <ResultsDisplay results={results} onReset={handleReset} isSample={isSample} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});