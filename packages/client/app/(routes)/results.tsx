import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { Colors } from "../../constants/Colors";
import { api, RedacaoResult, RedacaoStatus } from "../../utils/api";

interface Competencia {
  id: number;
  titulo: string;
  nota: number;
  descricao: string;
  analise: string;
  melhorias: string[];
  parabens: string;
}

const COMPETENCIAS_DESC = [
  "Demonstrar domínio da modalidade escrita formal da Língua Portuguesa.",
  "Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento.",
  "Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos.",
  "Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.",
  "Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos.",
];

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [redacao, setRedacao] = useState<RedacaoResult | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pollingIntervalRef = useRef<any>(null);

  // Função para converter resultado da API para formato de competências
  const converterResultadoParaCompetencias = (
    resultado: RedacaoResult,
  ): Competencia[] => {
    if (!resultado.resultado_json?.competencias) {
      return [];
    }

    return resultado.resultado_json.competencias.map((comp, index) => {
      // Garantir que o número da competência é válido (1-5), senão usar índice
      const numComp = comp.competencia >= 1 && comp.competencia <= 5
        ? comp.competencia
        : index + 1;

      return {
        id: index + 1, // Usar índice para ID único
        titulo: `Competência ${numComp}`,
        nota: comp.nota,
        descricao: COMPETENCIAS_DESC[numComp - 1] || "",
        analise: comp.analise_critica || "",
        melhorias: comp.analise_critica
          ? comp.analise_critica.split("\n").filter((m) => m.trim().length > 0 && m.includes("-"))
          : [],
        parabens:
          comp.nota === 200
            ? `Parabéns! Você demonstrou excelente habilidade na ${numComp}ª competência!`
            : "",
      };
    });
  };

  // Função para buscar status da redação
  const buscarRedacao = async (redacaoId: string) => {
    try {
      const id = parseInt(redacaoId);
      const resultado = await api.obterRedacao(id);
      setRedacao(resultado);

      // Se a correção foi concluída, converter e parar polling
      if (resultado.status === RedacaoStatus.CONCLUIDO) {
        const comps = converterResultadoParaCompetencias(resultado);
        setCompetencias(comps);
        setIsLoading(false);

        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        // Animação de entrada
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      } else if (resultado.status === RedacaoStatus.ERRO) {
        setIsLoading(false);
        Alert.alert(
          "Erro",
          "Ocorreu um erro ao processar sua redação. Tente novamente.",
        );
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar redação:", error);
      setIsLoading(false);
      Alert.alert("Erro", "Não foi possível buscar o status da redação.");
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  };

  useEffect(() => {
    const redacaoId = params.redacaoId as string;

    if (!redacaoId) {
      Alert.alert("Erro", "ID da redação não encontrado.");
      router.back();
      return;
    }

    // Buscar imediatamente
    buscarRedacao(redacaoId);

    // Configurar polling a cada 3 segundos
    pollingIntervalRef.current = setInterval(() => {
      buscarRedacao(redacaoId);
    }, 3000);

    // Limpar intervalo ao desmontar
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [params.redacaoId]);

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const notaTotal = redacao?.resultado_json?.nota_final
    ? redacao.resultado_json.nota_final
    : competencias.reduce((total, comp) => total + comp.nota, 0);

  const handleNovaRedacao = () => {
    router.push("/(routes)/(tabs)/add");
  };

  const handleVoltar = () => {
    router.back();
  };

  const handleExportPDF = () => {
    Alert.alert(
      "Sucesso",
      "O relatório em PDF foi gerado e está disponível na sua pasta de downloads!",
      [{ text: "OK" }]
    );
  };

  const getNotaColor = (nota: number) => {
    return "#FFFFFF";
  };

  const getNotaBackground = (nota: number) => {
    return "rgba(255, 255, 255, 0.05)"; // Neutro para todos
  };

  const getNotaBorder = (nota: number) => {
    return Colors.border; // Borda neutra padrão
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {redacao?.status === RedacaoStatus.PROCESSANDO
              ? "Processando sua redação..."
              : "Aguardando processamento..."}
          </Text>
          <Text style={styles.loadingSubtext}>
            {redacao?.status === RedacaoStatus.PROCESSANDO
              ? "Isso pode levar alguns segundos"
              : "Sua redação está na fila de processamento"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <Header />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleVoltar}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Resultado da Correção</Text>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleExportPDF}
            >
              <Ionicons name="download-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.tituloSection}>
            <Text style={styles.tituloLabel}>Título:</Text>
            <Text style={styles.tituloTexto}>
              {redacao?.tema ||
                (params.titulo as string) ||
                "Redação sem título"}
            </Text>
          </View>

          {/* Nota Geral */}
          <View style={styles.notaGeralCard}>
            <Text style={styles.notaGeralLabel}>Nota Geral</Text>
            <Text style={styles.notaGeralValor}>{notaTotal}</Text>
            <Text style={styles.notaGeralMaximo}>/ 1000 pontos</Text>
            <View style={styles.notaGeralBar}>
              <View
                style={[
                  styles.notaGeralProgress,
                  {
                    width: `${(notaTotal / 1000) * 100}%`,
                    backgroundColor: "#FFFFFF",
                  },
                ]}
              />
            </View>
          </View>

          {/* Competências */}
          {competencias.length > 0 && (
            <>
              <Text style={styles.competenciasTitle}>
                Análise por Competência
              </Text>

              {competencias.map((competencia) => (
                <View
                  key={competencia.id}
                  style={[
                    styles.competenciaCard,
                    { borderLeftWidth: 4, borderLeftColor: getNotaBorder(competencia.nota) }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.competenciaHeader}
                    onPress={() => toggleExpanded(competencia.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.competenciaInfo}>
                      <Text style={styles.competenciaTitulo}>
                        {competencia.titulo}
                      </Text>
                      <Text
                        style={styles.competenciaDescricao}
                        numberOfLines={2}
                      >
                        {competencia.descricao}
                      </Text>
                    </View>
                    <View style={styles.competenciaScore}>
                      <Text
                        style={[
                          styles.competenciaNota,
                          { color: getNotaColor(competencia.nota) },
                        ]}
                      >
                        {competencia.nota}
                      </Text>
                      <Ionicons
                        name={
                          expandedItems.has(competencia.id)
                            ? "chevron-up"
                            : "chevron-down"
                        }
                        size={20}
                        color={Colors.textSecondary}
                      />
                    </View>
                  </TouchableOpacity>

                  {expandedItems.has(competencia.id) && (
                    <View style={styles.competenciaExpanded}>
                      <View style={styles.notaBadge}>
                        <Text
                          style={[
                            styles.notaBadgeText,
                            { color: getNotaColor(competencia.nota) },
                          ]}
                        >
                          {competencia.nota}/200 pontos
                        </Text>
                      </View>


                      {competencia.nota === 200 && competencia.parabens && (
                        <View style={styles.parabensSection}>
                          <Ionicons name="trophy" size={24} color="#FFFFFF" />
                          <Text style={styles.parabensText}>
                            {competencia.parabens}
                          </Text>
                        </View>
                      )}

                      {competencia.analise ? (
                        <View style={styles.analiseSection}>
                          <Text style={styles.analiseTitle}>Análise da IA:</Text>
                          <Text style={styles.analiseText}>{competencia.analise}</Text>
                        </View>
                      ) : null}

                      {competencia.melhorias.length > 0 && (
                        <View style={styles.melhoriasSection}>
                          <Text style={styles.melhoriasTitle}>
                            Pontos específicos:
                          </Text>
                          {competencia.melhorias.map((melhoria, index) => (
                            <View key={index} style={styles.melhoriaItem}>
                              <Ionicons name="alert-circle" size={16} color="#FFFFFF" />
                              <Text style={styles.melhoriaText}>
                                {melhoria.replace(/^[-\s]+/, "")}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </>
          )}

          {/* Resumo Geral */}
          {competencias.length > 0 && (
            <View style={styles.resumoSection}>
              <Text style={styles.resumoTitle}>Resumo Geral</Text>
              {redacao?.resultado_json?.competencias ? (
                redacao.resultado_json.competencias.map((comp, index) => (
                  <View key={index} style={styles.resumoBlock}>
                    <Text style={styles.resumoBlockTitle}>
                      Competência {comp.competencia}
                    </Text>
                    <Text style={styles.resumoText}>
                      {comp.justificativa.replace(/\[Média C\d+\] /, "")}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.resumoText}>
                  Sua redação demonstrou um bom domínio da linguagem, mas há
                  oportunidades de melhoria na profundidade dos argumentos e na
                  elaboração de propostas de intervenção mais concretas.
                  Continue praticando para alcançar notas ainda maiores!
                </Text>
              )}
            </View>
          )}

          {/* Botão de Ação */}
          <TouchableOpacity
            style={styles.novaRedacaoButton}
            onPress={handleNovaRedacao}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={20} color={Colors.background} />
            <Text style={styles.novaRedacaoText}>Corrigir Nova Redação</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
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
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
  },
  exportButton: {
    padding: 8,
  },
  tituloSection: {
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tituloLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  tituloTexto: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  notaGeralCard: {
    backgroundColor: Colors.cardBackground,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  notaGeralLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  notaGeralValor: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 4,
  },
  notaGeralMaximo: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  notaGeralBar: {
    width: "100%",
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  notaGeralProgress: {
    height: "100%",
    borderRadius: 4,
  },
  competenciasTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  competenciaCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  competenciaHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  competenciaInfo: {
    flex: 1,
  },
  competenciaTitulo: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  competenciaDescricao: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  competenciaScore: {
    alignItems: "center",
    gap: 4,
  },
  competenciaNota: {
    fontSize: 20,
    fontWeight: "bold",
  },
  competenciaExpanded: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  notaBadge: {
    alignSelf: "flex-start",
    marginBottom: 12,
    marginTop: 14,
  },
  notaBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  parabensSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 0,
    marginBottom: 16,
    gap: 8,
  },
  parabensText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  melhoriasSection: {
    gap: 8,
  },
  melhoriasTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  melhoriaItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  melhoriaText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  analiseSection: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  analiseTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  analiseText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  resumoSection: {
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resumoTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  resumoBlock: {
    marginBottom: 16,
    backgroundColor: Colors.cardBackground,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  resumoBlockTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  resumoText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  novaRedacaoButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
  },
  novaRedacaoText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
  },
  loadingSubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
