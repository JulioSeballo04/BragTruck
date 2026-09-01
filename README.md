# BRAG TRUCK — Ordem de Serviço

App de Ordem de Serviço (OS) para a BRAG TRUCK (oficina de caminhões em Bragança Paulista/SP), com cadastro de clientes e veículos, histórico de ordens e geração de PDF.

## Estrutura do projeto

```
BragTruck/
├── index.html              # Estrutura das telas (tela inicial, OS, histórico, cadastros)
├── css/
│   └── styles.css          # Estilo do app inteiro
├── js/
│   ├── firebase-config.js  # Configuração e inicialização do Firebase/Firestore
│   ├── navigation.js       # Navegação entre telas (showScreen)
│   ├── setores.js          # Lista de serviços/peças, renderização e coleta dos dados da OS
│   ├── clientes.js         # Cadastro, busca e listagem de clientes (Firestore)
│   ├── veiculos.js         # Cadastro, busca e listagem de veículos (Firestore)
│   ├── historico.js        # Histórico de ordens de serviço emitidas
│   └── ordem-servico.js    # Totais, forma de pagamento, geração do PDF e envio por WhatsApp
└── assets/
    └── logo.png             # Logo da BRAG TRUCK
```

## Como rodar

Como é um site estático, basta abrir o `index.html` num navegador, ou servir a pasta com qualquer servidor estático (ex.: `npx serve`, GitHub Pages, Firebase Hosting).

## Firebase / Firestore

O app usa o projeto Firestore `brag-truck` para guardar:
- `clientes` — cadastro de clientes
- `veiculos` — cadastro de veículos
- `ordens` — histórico de ordens de serviço emitidas (guarda os dados completos da OS, permitindo reimprimir o PDF depois)

**Importante:** o Firestore precisa estar com as regras de segurança liberadas para leitura/escrita (o app não tem autenticação de usuário). Veja `firestore.rules`.

## Bibliotecas externas (via CDN)

- [jsPDF](https://github.com/parallax/jsPDF) + jsPDF-AutoTable — geração do PDF da OS
- [Firebase](https://firebase.google.com/) (App + Firestore, SDK compat) — banco de dados
