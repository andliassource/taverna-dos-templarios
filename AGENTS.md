# Regras Gerais do Projeto — Taverna dos Templários MMORPG

## 1. 🤖 Regra de Execução Autônoma

- **NUNCA solicite ao usuário para executar comandos de terminal (build, test, deploy, etc.)**.
- Você (o agente) deve **SEMPRE executar diretamente** todos os comandos de build (`vite build`), testes e deploy para o Firebase Hosting (`firebase deploy`).
- Ao concluir alterações, faça o build e o deploy automaticamente e entregue o resultado final funcionando em produção.

## 2. 🎨 Regra Obrigatória de Uso de Assets & Artes de Jogos

- **PROIBIDO desenhar sprites, personagens, monstros ou UI proceduralmente via Canvas 2D/código cru do zero**.
- **SEMPRE utilize assets pré-configurados HD reais, conjuntos de artes de domínio público (Kenney.nl, OpenGameArt, Adobe Mixamo) e spritesheets 2D/2.5D de alta fidelidade**.
- **Preservação de Texturas**: Toda criação de gráficos DEVE verificar e priorizar texturas HD pré-carregadas (`if (!this.textures.exists(key)) return;`) para NUNCA sobrescrever artes de qualidade por código procedural.
- **Animações Fluidas**: Personagens e monstros devem possuir animações nítidas e dinâmicas (troca de quadros de caminhada, pulso de ataque, sombra suave e transparência cristalina com ChromaKey sem caixas de fundo).

## 3. 🎮 Boas Práticas AAA de Arquitetura de Jogos (Phaser 3)

- **WebGL & Anti-Aliasing**: Configuração `render.roundPixels = true` e `FilterMode.NEAREST` para solos e sprites, eliminando linhas de costura/seams subpixel.
- **UI Obsidian & Gold Glassmorphism**: Interface limpa em alta definição com tipografia *Cinzel* e *MedievalSharp*, botões táteis, painéis com fundo translúcido e resposta sonora instantânea.
- **Performabilidade & 60 FPS**: Gerenciamento de memória de texturas, reutilização de pools de objetos e física Arcade otimizada sem bloqueios na thread principal.

## 4. 🚫 Regra Estrita de Proibição de Conteúdo & Dados Fictícios (Strict Real Data Only)

- **PROIBIDO de forma alguma utilizar dados fictícios, preenchimentos de teste (mock data), nomes fakes de jogadores, contadores simulados ou mensagens de chat simuladas**.
- Todos os sistemas do jogo (Chat, Leilão, Guilda, Ranking, Canais de Servidor, Party e Eventos de Boss Mundial) DEVEM ser **100% funcionais, autênticos e conectados em tempo real** aos dados reais do jogador e do servidor.
- Se uma funcionalidade ainda não possuir integração de dados ao vivo, ela DEVE iniciar em estado neutro/vazio autêntico (ex: 0 membros no grupo solo, placar com registros reais obtidos) em vez de exibir dados ou nomes simulados.
