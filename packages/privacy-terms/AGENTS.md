# Privacy Terms Package

Este documento fornece informações sobre o package `privacy-terms` do projeto Atena.

## Visão Geral

O package `privacy-terms` é um site estático simples construído com Vite e React, que exibe os termos de privacidade e termos de uso do aplicativo Atena.

## Estrutura de Diretórios

```
packages/privacy-terms/
├── src/
│   ├── App.tsx           # Componente principal
│   ├── App.css           # Estilos do componente
│   ├── main.tsx          # Ponto de entrada
│   └── index.css         # Estilos globais
├── public/               # Arquivos estáticos públicos
├── dist/                 # Build de produção (gerado)
├── index.html            # HTML principal
├── vite.config.ts        # Configuração do Vite
└── package.json
```

## Tecnologias

- **Vite**: Build tool e dev server
- **React**: Framework UI
- **TypeScript**: Tipagem estática
- **CSS**: Estilização (sem frameworks)

## Funcionalidades

O site exibe duas seções principais:

1. **Política de Privacidade**: Informações sobre coleta e uso de dados
2. **Termos de Uso**: Regras e condições de uso do serviço

### Interface

- Tabs para alternar entre Política de Privacidade e Termos de Uso
- Design dark mode consistente com o app mobile
- Layout responsivo

## Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Gera build de produção
npm run preview  # Preview do build de produção
npm run lint     # Executa ESLint
```

## Build e Deploy

O build gera arquivos estáticos na pasta `dist/` que podem ser servidos por qualquer servidor web estático.

### Deploy Sugerido

- Vercel (atual): `atena-privacy-terms.vercel.app`
- Netlify
- GitHub Pages
- Qualquer CDN estático

## Configuração

Não requer variáveis de ambiente ou configurações especiais. É um site completamente estático.

## Estilização

- Cores consistentes com o app mobile:
  - Background: `#1a1a1a`
  - Cards: `#2a2a2a`
  - Primary: `#4a9eff`
  - Text: `#ffffff`
  - Text Secondary: `#cccccc`

## Pontos de Atenção

1. **Conteúdo**: O conteúdo dos termos deve ser revisado legalmente antes de produção
2. **Atualização**: As datas de "última atualização" são geradas dinamicamente
3. **Responsividade**: Verificar em diferentes tamanhos de tela
4. **Acessibilidade**: Considerar melhorias de acessibilidade (ARIA labels, etc.)

## Integração com o App

O app mobile pode referenciar este site através de:
- Link direto: `atena-privacy-terms.vercel.app`
- WebView no app (futuro)
- Deep linking (futuro)

## Próximos Passos Sugeridos

1. Adicionar mais conteúdo legal detalhado
2. Melhorar acessibilidade (ARIA, navegação por teclado)
3. Adicionar versão em PDF para download
4. Implementar versionamento de termos
5. Adicionar aceite de termos no registro do app
