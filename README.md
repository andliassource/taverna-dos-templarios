# ⚔️ Taverna dos Templários

> RPG Arcade Medieval — Cross-Platform (Web / Mobile / Steam)

## 🎮 Sobre o Projeto

**Taverna dos Templários** é um RPG arcade com tema medieval templário, inspirado em jogos como Eudemons Online, Solo Leveling, Divinity 2 e Final Fantasy clássico. O jogo combina mecânicas profundas de RPG (12 classes, sistema de despertar, atributos, pets, runas, gemas, síntese, forja) com jogabilidade arcade acessível e visual pixel art HD.

## 🛠️ Stack Tecnológico

| Tecnologia | Uso |
|:---|:---|
| **Phaser 3** | Engine de jogo 2D |
| **TypeScript** | Linguagem principal |
| **Vite** | Build tool & dev server |
| **Firebase** | Auth (Google), Firestore (Save na Nuvem), Hosting |
| **Capacitor** | Empacotamento Mobile (iOS/Android) |
| **Electron** | Empacotamento Steam/Desktop |

## 🎮 Controles do Jogo

| Tecla / Botão | Ação |
|:---|:---|
| `W A S D` / `Setas` | Movimentação do Templário |
| `Espaço` / `Clique` | Ataque Básico corpo a corpo / disparo |
| `1`, `2`, `3` | Usar Habilidades Ativas da Classe |
| `Shift` | Dash / Esquiva Rápida |
| `C` | Abrir / Fechar Painel de Perfil & Atributos |
| `I` | Abrir / Fechar Inventário & Equipamentos |
| `ENTER` | Interagir com NPCs (Ferreiro, Mercadora, Mestre da Arena) |
| `ESC` | Fechar Diálogos e Janelas |

## 🌟 Funcionalidades Implementadas

- 🏋️ **Sistema de Atributos & Perfil (`Tecla C`)**: Distribuição de pontos a cada Level Up (FOR, AGI, INT, VIT) afetando Dano, Crítico, Mana e HP.
- 🐉 **Pets & Auto-Loot Magnético**: Mascote acompanhante com vácuo de atração automática de Ouro, Gemas e Equipamentos.
- 🔨 **Forja do Ferreiro Bjorn**: Aprimoramento de equipamentos com Ouro e Gemas (+1 a +10).
- 🛒 **Mercadora Elise**: Compra e venda de poções e suprimentos mágicos.
- ⚔️ **Arena de Combate (Mestre Aldric)**: Sistema de desafios em ondas de monstros com recompensas volumosas.
- ☁️ **Sistema de Save Dual**: Salvamento automático local (`localStorage`) sincronizado com a nuvem (`Firebase Firestore`).
- 📱 **Interface Cross-Platform**: HUD responsivo com suporte a Touch Joystick e botões na tela para mobile.

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
│   ├── entities/        # Sprites, players, monsters, PetEntity
│   ├── systems/         # Combate, atributos, inventário, SaveManager
│   ├── ui/              # HUD, menus, perfil, diálogos, mobile controls
│   ├── config/          # Configurações (Phaser, Firebase)
│   ├── network/         # FirebaseService (Auth & Cloud Save)
│   ├── utils/           # Utilitários e gerador de som (SoundSynth)
│   └── styles/          # CSS global
├── server/              # Backend (Cloud Functions + Game Server)
├── shared/              # Tipos (item, scene, stats) compartilhados
└── index.html           # Entry point HTML
```

## ⚔️ Classes Jogáveis

| Classe | Status no Jogo | Arquétipo | Recurso | Habilidades |
|:---|:---|:---|:---|:---|
| 🛡️ Paladino | ✅ Jogável | Tank/DPS | Fé Sagrada | Escudo Divino, Cura, Impacto da Justiça |
| 🛡️ Guardião | ✅ Jogável | Tank Puro | Determinação | Muralha Inabalável, Provocar, Investida |
| ⚔️ Guerreiro | ✅ Jogável | DPS Melee | Fúria | Corte Giratório, Grito de Guerra, Impacto Devastador |
| 🔮 Mago | ✅ Jogável | DPS Mágico | Mana | Bola de Fogo Arcana, Barreira de Gelo, Teletransporte |
| 💀 Necromante | ✅ Jogável | Summoner | Essência Vital | Orbe Sombrio, Servo Esqueleto, Explosão Cadavérica |
| 🏹 Arqueiro | ✅ Jogável | DPS Ranged | Concentração | Disparo Triplo, Armadilha, Chuva de Flechas |
| 🗡️ Assassino | ✅ Jogável | DPS Burst | Sigilo | Corte Sombrio, Faca Envenenada, Invisibilidade |
| 💚 Clérigo | ✅ Jogável | Healer | Preces | Luz Sagrada, Punição Divina, Aura de Proteção |
| 🛡️ Cavaleiro Negro | 🚧 Em breve | Off-Tank | Sombra | Dreno de Vida, Marca Sombria |
| 🔮 Elementalist | 🚧 Em breve | Controle | Harmonia | Meteoro, Tempestade Elétrica |
| 💚 Bardo | 🚧 Em breve | Buffer | Melodia | Hino da Coragem, Balada da Regeneração |
| 💚 Druida | 🚧 Em breve | Healer/Tank | Natureza | Forma de Urso, Vinhas Asfixiantes |

## 📝 Licença

Proprietário — Todos os direitos reservados.

---

*Feito com ⚔️ e ☕ por um Templário do código.*
