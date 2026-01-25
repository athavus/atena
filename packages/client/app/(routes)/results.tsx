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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../../components/Header";
import { Colors } from "../../constants/Colors";

interface Competencia {
  id: number;
  titulo: string;
  nota: number;
  descricao: string;
  melhorias: string[];
  parabens: string;
}

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Dados simulados das competências - em produção viria da API
  useEffect(() => {
    setIsLoading(true);

    // Simular processamento da redação (2 segundos)
    setTimeout(() => {
      const competenciasSimuladas: Competencia[] = [
      {
        id: 1,
        titulo: "Competência 1",
        nota: 180,
        descricao: "Demonstrar domínio da modalidade escrita formal da Língua Portuguesa.",
        melhorias: [
          "Evite contrações informais como 'pra' em vez de 'para'",
          "Use conectivos mais variados para melhorar a coesão textual",
          "Preste atenção na concordância verbal e nominal"
        ],
        parabens: ""
      },
      {
        id: 2,
        titulo: "Competência 2",
        nota: 160,
        descricao: "Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento.",
        melhorias: [
          "Desenvolva mais o tema com argumentos mais aprofundados",
          "Inclua referências a diferentes áreas do conhecimento",
          "Melhore a estrutura argumentativa com teses mais claras"
        ],
        parabens: ""
      },
      {
        id: 3,
        titulo: "Competência 3",
        nota: 200,
        descricao: "Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos.",
        melhorias: [],
        parabens: "Parabéns! Você demonstrou excelente habilidade em organizar e interpretar informações!"
      },
      {
        id: 4,
        titulo: "Competência 4",
        nota: 170,
        descricao: "Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação.",
        melhorias: [
          "Use uma maior variedade vocabular",
          "Incorpore figuras de linguagem quando apropriado",
          "Melhore o uso de pronomes e referências textuais"
        ],
        parabens: ""
      },
      {
        id: 5,
        titulo: "Competência 5",
        nota: 150,
        descricao: "Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos.",
        melhorias: [
          "Desenvolva uma proposta de intervenção mais concreta e viável",
          "Considere os aspectos práticos da implementação",
          "Inclua medidas de avaliação da proposta"
        ],
        parabens: ""
      }
    ];

    setCompetencias(competenciasSimuladas);
    setIsLoading(false);

    // Animação de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    }, 2000);
  }, [fadeAnim]);

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const notaTotal = competencias.reduce((total, comp) => total + comp.nota, 0);

  const handleNovaRedacao = () => {
    router.push("/(routes)/(tabs)/add");
  };

  const handleVoltar = () => {
    router.back();
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 180) return "#4CAF50"; // Verde
    if (nota >= 140) return "#FF9800"; // Laranja
    return "#F44336"; // Vermelho
  };

  const getNotaBackground = (nota: number) => {
    if (nota >= 180) return "#4CAF5020";
    if (nota >= 140) return "#FF980020";
    return "#F4433620";
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Analisando sua redação...</Text>
          <Text style={styles.loadingSubtext}>Isso pode levar alguns segundos</Text>
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
          </View>

          <View style={styles.tituloSection}>
            <Text style={styles.tituloLabel}>Título:</Text>
            <Text style={styles.tituloTexto}>{params.titulo || "Redação sem título"}</Text>
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
                  { width: `${(notaTotal / 1000) * 100}%`, backgroundColor: getNotaColor(notaTotal) }
                ]}
              />
            </View>
          </View>

          {/* Competências */}
          <Text style={styles.competenciasTitle}>Análise por Competência</Text>

          {competencias.map((competencia) => (
            <View key={competencia.id} style={styles.competenciaCard}>
              <TouchableOpacity
                style={styles.competenciaHeader}
                onPress={() => toggleExpanded(competencia.id)}
                activeOpacity={0.7}
              >
                <View style={styles.competenciaInfo}>
                  <Text style={styles.competenciaTitulo}>{competencia.titulo}</Text>
                  <Text style={styles.competenciaDescricao} numberOfLines={2}>
                    {competencia.descricao}
                  </Text>
                </View>
                <View style={styles.competenciaScore}>
                  <Text style={[styles.competenciaNota, { color: getNotaColor(competencia.nota) }]}>
                    {competencia.nota}
                  </Text>
                  <Ionicons
                    name={expandedItems.has(competencia.id) ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>

              {expandedItems.has(competencia.id) && (
                <View style={styles.competenciaExpanded}>
                  <View style={[styles.notaBadge, { backgroundColor: getNotaBackground(competencia.nota) }]}>
                    <Text style={[styles.notaBadgeText, { color: getNotaColor(competencia.nota) }]}>
                      {competencia.nota}/200 pontos
                    </Text>
                  </View>

                  {competencia.nota === 200 && competencia.parabens && (
                    <View style={styles.parabensSection}>
                      <Ionicons name="trophy" size={24} color="#FFD700" />
                      <Text style={styles.parabensText}>{competencia.parabens}</Text>
                    </View>
                  )}

                  {competencia.melhorias.length > 0 && (
                    <View style={styles.melhoriasSection}>
                      <Text style={styles.melhoriasTitle}>Pontos para melhorar:</Text>
                      {competencia.melhorias.map((melhoria, index) => (
                        <View key={index} style={styles.melhoriaItem}>
                          <Ionicons name="bulb" size={16} color={Colors.primary} />
                          <Text style={styles.melhoriaText}>{melhoria}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}

          {/* Resumo Geral */}
          <View style={styles.resumoSection}>
            <Text style={styles.resumoTitle}>Resumo Geral</Text>
            <Text style={styles.resumoText}>
              Sua redação demonstrou um bom domínio da linguagem, mas há oportunidades de melhoria
              na profundidade dos argumentos e na elaboração de propostas de intervenção mais concretas.
              Continue praticando para alcançar notas ainda maiores!
            </Text>
          </View>

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
    color: Colors.primary,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  notaBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  parabensSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD70020",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  parabensText: {
    color: "#FFD700",
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
  resumoSection: {
    backgroundColor: Colors.primary + "15",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  resumoTitle: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
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
