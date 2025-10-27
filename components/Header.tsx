import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export default function Header() {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="menu" size={24} color={Colors.text} />
      </TouchableOpacity>

      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo-atena.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>ATENA</Text>
      </View>

      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="person-circle-outline" size={28} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 30,
    marginHorizontal: 16,
    marginTop: 16,
  },
  iconButton: {
    padding: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  logoText: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
