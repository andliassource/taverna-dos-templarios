# ⚔️ Taverna dos Templários

> RPG Arcade Medieval — Cross-Platform (Web / Mobile / Steam)

## 🎮 Sobre o Projeto

**Taverna dos Templários** é um RPG arcade com tema medieval templário, inspirado em jogos como Eudemons Online, Solo Leveling, Divinity 2 e Final Fantasy clássico. O jogo combina mecânicas profundas de RPG (12 classes, sistema de despertar, pets, runas, gemas, síntese) com jogabilidade arcade acessível e visual pixel art HD.

## 🛠️ Stack Tecnológico

| Tecnologia | Uso |
|:---|:---|
| **Phaser 3** | Engine de jogo 2D |
| **TypeScript** | Linguagem principal |
| **Vite** | Build tool & dev server |
| **Firebase** | Auth, Firestore, Functions, Hosting |
| **Capacitor** | Empacotamento Mobile (iOS/Android) |
| **Electron** | Empacotamento Steam/Desktop |

## 🚀 Como Rodar

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

## 📂 Estrutura do Projeto

```
taverna-dos-templarios/
├── src/
│   ├── scenes/          # Cenas do Phaser (Boot, Menu, World, Battle, UI)
│   ├── entities/        # Sprites, players, monsters, pets
│   ├── systems/         # Combate, inventário, skills, economia
│   ├── ui/              # HUD, menus, diálogos
│   ├── config/          # Configurações (Phaser, Firebase)
│   ├── network/         # Comunicação com servidor
│   ├── utils/           # Utilitários
│   ├── assets/          # Assets do jogo
│   │   ├── data/        # JSON de balanceamento
│   │   ├── sprites/     # Spritesheets
│   │   ├── tilesets/    # Tilesets para Tiled
│   │   └── audio/       # Música e efeitos sonoros
│   └── styles/          # CSS global
├── server/              # Backend (Cloud Functions + Game Server)
├── shared/              # Tipos e constantes compartilhados
├── tools/               # Ferramentas de desenvolvimento
└── index.html           # Entry point HTML
```

## ⚔️ Classes Jogáveis

| Classe | Arquétipo | Recurso |
|:---|:---|:---|
| 🛡️ Paladino ⭐ | Tank/DPS | Fé Sagrada |
| 🛡️ Guardião | Tank Puro | Determinação |
| 🛡️ Cavaleiro Negro | Off-Tank | Sombra |
| ⚔️ Guerreiro | DPS Melee | Fúria |
| ⚔️ Assassino | DPS Burst | Sigilo |
| ⚔️ Arqueiro | DPS Ranged | Concentração |
| 🔮 Mago | DPS Mágico | Mana |
| 🔮 Necromante | Summoner | Essência Vital |
| 🔮 Elementalista | Controle | Harmonia |
| 💚 Clérigo | Healer | Preces |
| 💚 Bardo | Buffer | Melodia |
| 💚 Druida | Healer/Tank | Natureza |

## 📝 Licença

Proprietário — Todos os direitos reservados.

---

*Feito com ⚔️ e ☕ por um Templário do código.*
