import { useEffect, useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { api, RedacaoResult, RedacaoStatus } from "../../../utils/api";

export default function HistoryScreen() {
  const router = useRouter();
  const [redacoes, setRedacoes] = useState<RedacaoResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "score">("date");

  const carregarRedacoes = async () => {
    try {
      const resultado = await api.listarRedacoes();
      setRedacoes(resultado);
    } catch (error) {
      console.error("Erro ao carregar redações:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarRedacoes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    carregarRedacoes();
  };

  const getStatusColor = (status: RedacaoStatus) => {
    return "#FFFFFF";
  };

  const getStatusText = (status: RedacaoStatus) => {
    switch (status) {
      case RedacaoStatus.CONCLUIDO:
        return "Concluída";
      case RedacaoStatus.PROCESSANDO:
        return "Processando";
      case RedacaoStatus.PENDENTE:
        return "Pendente";
      case RedacaoStatus.ERRO:
        return "Erro";
      default:
        return status;
    }
  };

  const handleRedacaoPress = (redacao: RedacaoResult) => {
    router.push({
      pathname: "/(routes)/results",
      params: {
        redacaoId: redacao.id.toString(),
        titulo: redacao.tema,
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Carregando redações...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {redacoes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhuma redação encontrada</Text>
            <Text style={styles.emptySubtext}>
              Envie sua primeira redação para começar!
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.headerColumn}>
              <Text style={styles.title}>Minhas Redações</Text>

              <View style={styles.sortWrapper}>
                <Text style={styles.sortLabel}>Ordenar por:</Text>
                <View style={styles.sortContainer}>
                  <TouchableOpacity
                    style={[styles.sortButton, sortBy === "date" && styles.sortButtonActive]}
                    onPress={() => setSortBy("date")}
                  >
                    <Text style={[styles.sortButtonText, sortBy === "date" && styles.sortButtonTextActive]}>
                      Mais Recentes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sortButton, sortBy === "score" && styles.sortButtonActive]}
                    onPress={() => setSortBy("score")}
                  >
                    <Text style={[styles.sortButtonText, sortBy === "score" && styles.sortButtonTextActive]}>
                      Maior Nota
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {redacoes
              .sort((a, b) => {
                if (sortBy === "score") {
                  const scoreA = a.resultado_json?.nota_final || 0;
                  const scoreB = b.resultado_json?.nota_final || 0;
                  return scoreB - scoreA;
                }
                // Date sort (assuming ID is proxy for date since we don't have created_at in interface yet, or just existing order)
                return b.id - a.id;
              })
              .map((redacao) => (
                <TouchableOpacity
                  key={redacao.id}
                  style={styles.redacaoCard}
                  onPress={() => handleRedacaoPress(redacao)}
                  activeOpacity={0.7}
                >
                  <View style={styles.redacaoHeader}>
                    <Text style={styles.redacaoTema} numberOfLines={2}>
                      {redacao.tema}
                    </Text>
                    <View style={styles.statusBadge}>
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(redacao.status) },
                        ]}
                      >
                        {getStatusText(redacao.status)}
                      </Text>
                    </View>
                  </View>
                  {redacao.status === RedacaoStatus.CONCLUIDO &&
                    redacao.resultado_json?.nota_final && (
                      <View style={styles.notaContainer}>
                        <Text style={styles.notaLabel}>Nota:</Text>
                        <Text style={styles.notaValue}>
                          {redacao.resultado_json.nota_final} / 1000
                        </Text>
                      </View>
                    )}
                  <View style={styles.redacaoFooter}>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </View>
                </TouchableOpacity>
              ))}
          </>
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
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    color: Colors.text,
    fontSize: 16,
    marginTop: 16,
  },
  title: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  redacaoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  redacaoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  redacaoTema: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: "#FFFFFF40", // Subtle white border
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  notaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  notaLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  notaValue: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  redacaoFooter: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  headerColumn: {
    marginBottom: 20,
  },
  sortWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  sortLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginRight: 12,
  },
  sortContainer: {
    flexDirection: "row",
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  sortButtonText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  sortButtonTextActive: {
    color: "#000000", // Black text on white button (primary is white)
    fontWeight: "bold",
  },
});
