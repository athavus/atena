import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import Header from '../../components/Header';
import { Colors } from '../../constants/Colors';

export default function AddScreen() {
  const [texto, setTexto] = useState('');
  const [imagens, setImagens] = useState<string[]>([]);

  const handleSelecionarImagem = () => {
    // TODO: Implementar seleção de imagem
    console.log('Selecionar imagem');
  };

  const handleSubmit = () => {
    // TODO: Enviar para o backend
    console.log('Enviando:', { texto, imagens });

    // Limpar após envio
    setTexto('');
    setImagens([]);
  };

  const podeEnviar = texto.trim().length > 0 || imagens.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Área de Upload de Imagem */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enviar Foto da Redação</Text>
            <TouchableOpacity
              style={styles.uploadArea}
              onPress={handleSelecionarImagem}
              activeOpacity={0.7}
            >
              <View style={styles.dashedBorder}>
                <Ionicons name="image-outline" size={40} color={Colors.textSecondary} />
                <Text style={styles.uploadText}>Toque para adicionar imagem</Text>
                {imagens.length > 0 && (
                  <Text style={styles.imagensCount}>
                    {imagens.length} {imagens.length === 1 ? 'imagem' : 'imagens'} selecionada(s)
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Divisor */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Área de Texto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Digitar Redação</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Digite ou cole o texto da sua redação aqui..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              value={texto}
              onChangeText={setTexto}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {texto.length} caracteres
            </Text>
          </View>

          {/* Botão de Enviar */}
          <TouchableOpacity
            style={[styles.submitButton, !podeEnviar && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!podeEnviar}
            activeOpacity={0.8}
          >
            <Ionicons
              name="send"
              size={20}
              color={podeEnviar ? Colors.background : Colors.textSecondary}
            />
            <Text style={[styles.submitButtonText, !podeEnviar && styles.submitButtonTextDisabled]}>
              Enviar para Correção
            </Text>
          </TouchableOpacity>

          {/* Informação sobre envios em lote */}
          <Text style={styles.infoText}>
            Você pode enviar múltiplas imagens de uma vez
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  uploadArea: {
    width: '100%',
    height: 180,
  },
  dashedBorder: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground + '40',
  },
  uploadText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  imagensCount: {
    color: Colors.primary,
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginHorizontal: 16,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    color: Colors.text,
    fontSize: 15,
    minHeight: 200,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charCount: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    gap: 10,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.cardBackground,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
});
