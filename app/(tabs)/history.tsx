import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { Colors } from '../../constants/Colors';

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />

      <ScrollView style={styles.content}>
        <Text style={styles.emptyText}>Nenhuma redação corrigida ainda</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
