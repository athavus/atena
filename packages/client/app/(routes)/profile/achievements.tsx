import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { api } from "../../../utils/api";

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    unlocked: boolean;
    color: string;
}

export default function AchievementsScreen() {
    const router = useRouter();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);

    const checkAchievements = async () => {
        try {
            const redacoes = await api.listarRedacoes();
            const concluidas = redacoes.filter(r => r.status === "CONCLUIDO");
            const hasOCR = false; // OCR detection logic can be added later
            const highScores = concluidas.filter(r => (r.resultado_json?.nota_final || 0) >= 900);

            const list: Achievement[] = [
                {
                    id: "first_essay",
                    title: "Primeira de Muitas",
                    description: "Enviou sua primeira redação para correção.",
                    icon: "pencil",
                    unlocked: concluidas.length >= 1,
                    color: "#4ADE80"
                },
                {
                    id: "habit",
                    title: "Hábito Formado",
                    description: "Corrigiu pelo menos 5 redações.",
                    icon: "calendar",
                    unlocked: concluidas.length >= 5,
                    color: "#60A5FA"
                },
                {
                    id: "ocr_master",
                    title: "Mestre do Papel",
                    description: "Utilizou a câmera para digitalizar uma redação.",
                    icon: "camera",
                    unlocked: hasOCR,
                    color: "#F472B6"
                },
                {
                    id: "genius",
                    title: "Gênio Literário",
                    description: "Alcançou uma nota superior a 900 pontos.",
                    icon: "trophy",
                    unlocked: highScores.length >= 1,
                    color: "#FBBF24"
                }
            ];

            setAchievements(list);
        } catch (error) {
            console.error("Erro ao carregar conquistas:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            checkAchievements();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <Header />

            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title}>Minhas Conquistas</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {achievements.map((item) => (
                        <View key={item.id} style={[styles.card, !item.unlocked && styles.cardLocked]}>
                            <View style={[styles.iconWrapper, { backgroundColor: item.unlocked ? item.color : "#2a2a2a" }]}>
                                <Ionicons
                                    name={item.unlocked ? item.icon : "lock-closed"}
                                    size={32}
                                    color={item.unlocked ? "#000" : "#555"}
                                />
                            </View>
                            <Text style={[styles.cardTitle, !item.unlocked && styles.textLocked]}>{item.title}</Text>
                            <Text style={styles.cardDesc}>{item.description}</Text>
                            {item.unlocked && (
                                <View style={styles.unlockedBadge}>
                                    <Text style={styles.unlockedText}>DESBLOQUEADO</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        marginVertical: 24,
        gap: 16,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "bold",
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 16,
    },
    card: {
        width: "47%",
        backgroundColor: Colors.cardBackground,
        borderRadius: 24,
        padding: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardLocked: {
        opacity: 0.6,
    },
    iconWrapper: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    cardTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    textLocked: {
        color: "#888",
    },
    cardDesc: {
        color: Colors.textSecondary,
        fontSize: 12,
        textAlign: "center",
        lineHeight: 16,
    },
    unlockedBadge: {
        marginTop: 12,
        backgroundColor: "rgba(74, 222, 128, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    unlockedText: {
        color: "#4ADE80",
        fontSize: 9,
        fontWeight: "bold",
    }
});
