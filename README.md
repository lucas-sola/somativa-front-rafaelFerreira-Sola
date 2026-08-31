# Tier List Maker

Aplicação web para criar, editar, exportar e publicar tier lists. O projeto é totalmente client-side, feito com HTML semântico, Tailwind CSS e JavaScript puro.

## Funcionalidades

- Editor de tiers com categorias S, A, B, C e D editáveis
- Criação e exclusão de categorias, além de seletor de cor por tier
- Upload de múltiplas imagens locais
- Arrastar e soltar entre o repositório de imagens e as tiers
- Visualização ampliada e exclusão de imagens
- Exportação da área de classificação em PNG
- Hub de templates para Jogos, Filmes, Comidas e Animes
- Login e cadastro fictícios, sem backend e sem envio de dados
- Publicação simulada: só usuários logados podem publicar no feed da comunidade
- Feed comunitário em memória, com autor, data e total de itens classificados

## Templates

Cada template carrega uma lista pronta para edição:

- **Jogos inesquecíveis:** 16 jogos com capas locais incluídas no projeto
- **Filmes para maratonar:** 16 filmes; 15 capas locais já foram adicionadas. A imagem de Barbie permanece temporária até que sua capa seja fornecida
- **Comidas favoritas:** 16 comidas
- **Universo dos animes:** 16 personagens e títulos

As imagens de Jogos e Filmes ficam em `src/assets/games/` e `src/assets/movies/` respectivamente.

## Tecnologias

- HTML5
- Tailwind CSS 3
- JavaScript Vanilla
- [html2canvas](https://html2canvas.hertzen.com/) via CDN, para gerar o PNG

## Como abrir o projeto

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Gere o CSS compilado:

   ```bash
   npm run build
   ```

3. Abra `index.html` no navegador. No PowerShell, dentro da pasta do projeto:

   ```powershell
   start index.html
   ```

Durante o desenvolvimento, mantenha o Tailwind em modo de observação:

```bash
npm run watch
```

## Estrutura do projeto

```text
├── index.html                 # Interface e modais
├── package.json               # Scripts do Tailwind
├── tailwind.config.js         # Arquivos monitorados pelo Tailwind
└── src/
    ├── assets/
    │   ├── games/             # Capas locais dos jogos
    │   └── movies/            # Capas locais dos filmes
    ├── css/
    │   ├── input.css          # Diretivas e animações
    │   └── output.css         # CSS compilado
    └── js/
        └── script.js          # Estado, drag-and-drop, templates, login e publicação
```

## Observações

- Login, publicações e imagens enviadas pelo usuário existem somente enquanto a página está aberta.
- Não há banco de dados, servidor ou autenticação real.
- Para exportar em PNG, mantenha conexão com a internet para carregar o `html2canvas` via CDN.
