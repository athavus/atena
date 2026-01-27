import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { Fonts } from "../../../constants/Fonts";
import { api } from "../../../utils/api";
import { storage } from "../../../utils/config";

const DICAS = [
  "Use conectivos como 'Além disso' e 'Contudo' para melhorar a coesão.",
  "Mantenha sua proposta de intervenção detalhada com: Agente, Ação, Meio e Efeito.",
  "Tente usar repertórios sociológicos para embasar seus argumentos.",
  "Evite repetições de palavras. Use sinônimos para tornar a leitura fluida.",
  "O título não é obrigatório no ENEM, mas pode ajudar a fechar o tema.",
];

const ESSAYS_PER_LEVEL = 2; // Sobe de nível a cada 2 redações

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("Estudante");
  const [stats, setStats] = useState({
    total: 0,
    media: 0,
    level: 1,
    xpProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dicaDia, setDicaDia] = useState("");
  const [lastEssays, setLastEssays] = useState<{ id: number; tema: string }[]>(
    [],
  );
  const [dailyGoal, setDailyGoal] = useState({ current: 0, target: 1 });
  const [focoEstudo, setFocoEstudo] = useState<{
    id: number;
    nota: number;
  } | null>(null);

  const loadData = async () => {
    try {
      const userData = await storage.getUserData();
      if (userData.name) {
        setUserName(userData.name.split(" ")[0]);
      }

      const redacoes = await api.listarRedacoes();
      const concluidas = redacoes.filter((r) => r.status === "CONCLUIDO");

      const total = concluidas.length;
      const somaNotas = concluidas.reduce(
        (acc, r) => acc + (r.resultado_json?.nota_final || 0),
        0,
      );
      const media = total > 0 ? Math.round(somaNotas / total) : 0;

      // Cálculo de Nível (Ex: Level 1 = 0-1 red, Level 2 = 2-3 red, etc.)
      const level = Math.floor(total / ESSAYS_PER_LEVEL) + 1;
      const progressInLevel = total % ESSAYS_PER_LEVEL;
      const xpProgress = (progressInLevel / ESSAYS_PER_LEVEL) * 100;

      setStats({ total, media, level, xpProgress });

      // Pega as últimas 3 redações
      setLastEssays(
        redacoes.slice(0, 3).map((r) => ({ id: r.id, tema: r.tema })),
      );

      // Meta Diária (Redações enviadas HOJE)
      const hoje = new Date().toISOString().split("T")[0];
      const enviadasHoje = redacoes.filter((r) =>
        (r.criado_em || "").startsWith(hoje),
      ).length;
      setDailyGoal((prev) => ({ ...prev, current: enviadasHoje }));

      // Cálculo do Foco de Estudo (Menor média por competência)
      if (concluidas.length > 0) {
        const somaComps = [0, 0, 0, 0, 0];
        const contComps = [0, 0, 0, 0, 0];

        concluidas.forEach((r) => {
          r.resultado_json?.competencias?.forEach((c) => {
            somaComps[c.competencia - 1] += c.nota;
            contComps[c.competencia - 1]++;
          });
        });

        let minMedia = 200;
        let minId = 1;
        let found = false;

        somaComps.forEach((soma, idx) => {
          if (contComps[idx] > 0) {
            const media = soma / contComps[idx];
            if (media < minMedia) {
              minMedia = media;
              minId = idx + 1;
              found = true;
            }
          }
        });

        if (found && minMedia < 180) {
          // Só foca se não for nota máxima
          setFocoEstudo({ id: minId, nota: Math.round(minMedia) });
        }
      }

      // Escolhe dica aleatória
      setDicaDia(DICAS[Math.floor(Math.random() * DICAS.length)]);
    } catch (error) {
      console.error("Erro ao carregar dados da Home:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeTextColumn}>
            <Text style={styles.greeting}>Olá, {userName}!</Text>
          </View>
        </View>

        {/* Daily Goal & Stats */}
        <View style={styles.goalAndStatsRow}>
          <View style={styles.dailyGoalCard}>
            <Text style={styles.goalLabel}>Meta Diária</Text>
            <View style={styles.goalProgressLine}>
              <View
                style={[
                  styles.goalFill,
                  dailyGoal.current >= dailyGoal.target && styles.goalComplete,
                ]}
              />
            </View>
            <Text style={styles.goalValue}>
              {dailyGoal.current}/{dailyGoal.target}
            </Text>
          </View>

          <View style={styles.miniStatsContainer}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatValue}>{stats.total}</Text>
              <Text style={styles.miniStatLabel}>Total</Text>
            </View>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatValue}>{stats.media}</Text>
              <Text style={styles.miniStatLabel}>Média</Text>
            </View>
          </View>
        </View>

        {/* Foco de Estudo */}
        {focoEstudo && (
          <View style={styles.focoCard}>
            <View style={styles.focoIconContainer}>
              <Ionicons name="flashlight-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.focoTextContainer}>
              <Text style={styles.focoLabel}>FOCO DE HOJE</Text>
              <Text style={styles.focoTitle}>Competência {focoEstudo.id}</Text>
              <Text style={styles.focoDesc}>
                Sua média nesta área é {focoEstudo.nota}. Recomendo praticar
                mais{" "}
                {focoEstudo.id === 1
                  ? "gramática e ortografia."
                  : focoEstudo.id === 2
                    ? "repertório sociocultural."
                    : focoEstudo.id === 3
                      ? "argumentação e coerência."
                      : focoEstudo.id === 4
                        ? "conectivos e coesão."
                        : "proposta de intervenção."}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Acesso Rápido</Text>

          <TouchableOpacity
            style={styles.mainActionButton}
            onPress={() => router.push("/(routes)/(tabs)/add")}
          >
            <View style={styles.actionIconWrapper}>
              <Ionicons name="add-circle" size={32} color="#000" />
            </View>
            <View style={styles.actionTextWrapper}>
              <Text style={styles.actionTitle}>Nova Redação</Text>
              <Text style={styles.actionDesc}>
                Envie seu texto para correção instantânea
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={() => router.push("/(routes)/(tabs)/history")}
          >
            <Ionicons name="time" size={24} color={Colors.text} />
            <Text style={styles.secondaryActionText}>Ver meu histórico</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Progress */}
        {lastEssays.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Progresso Recente</Text>
            {lastEssays.map((essay, index) => (
              <TouchableOpacity
                key={essay.id}
                style={styles.recentItem}
                onPress={() =>
                  router.push({
                    pathname: "/(routes)/results",
                    params: {
                      redacaoId: essay.id.toString(),
                      titulo: essay.tema,
                    },
                  })
                }
              >
                <Ionicons
                  name="document-text"
                  size={20}
                  color={Colors.primary}
                />
                <Text style={styles.recentItemText} numberOfLines={1}>
                  {essay.tema}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTextColumn: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    color: Colors.textSecondary,
    ...Fonts.styles.body,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCardPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.text,
  },
  dicaCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dicaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  dicaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  dicaText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    fontStyle: "italic",
  },
  actionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  mainActionButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  actionIconWrapper: {
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 8,
    borderRadius: 12,
    marginRight: 16,
  },
  actionTextWrapper: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  actionDesc: {
    fontSize: 13,
    color: "rgba(0,0,0,0.6)",
  },
  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryActionText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  // Level System Styles
  levelCard: {
    backgroundColor: Colors.cardBackground,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 16,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.1)",
  },
  levelBadgeText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  levelSub: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  xpBarContainer: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 4,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  recentSection: {
    marginBottom: 40,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentItemText: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  goalAndStatsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  dailyGoalCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  goalLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  goalProgressLine: {
    width: "80%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
    marginBottom: 8,
  },
  goalFill: {
    height: "100%",
    width: "0%", // Toggle based on state? For now let's use 100% if done
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  goalComplete: {
    width: "100%",
  },
  goalValue: {
    color: Colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  miniStatsContainer: {
    flex: 1,
    gap: 10,
  },
  miniStat: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniStatValue: {
    color: Colors.text,
    fontWeight: "bold",
    fontSize: 18,
  },
  miniStatLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
  // Foco Styles
  focoCard: {
    backgroundColor: "rgba(255, 107, 107, 0.12)",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  focoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  focoTextContainer: {
    flex: 1,
  },
  focoLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 4,
    opacity: 0.6, // Mantendo uma leve distinção visual mas ainda branco
  },
  focoTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  focoDesc: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
  },
});
