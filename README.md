# ⚔️ Taverna dos Templários

> RPG Action Arcade Medieval — Cross-Platform (Web / Mobile / Steam)

[![Firebase Hosting](https://img.shields.io/badge/Deploy-Firebase_Hosting-ffca28?style=flat-square&logo=firebase)](https://taverna-dos-templarios.web.app/)
[![Phaser 3](https://img.shields.io/badge/Engine-Phaser_3-904600?style=flat-square&logo=phaser)](https://phaser.io/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 🎮 Sobre o Projeto

**Taverna dos Templários** é um Action-RPG com estética visual inspirada em *The Legend of Zelda: The Minish Cap* e *Oceanhorn*. O jogo combina mecânicas profundas de RPG (12 classes jogáveis, recipientes de corações de vida, sistema de atributos, mascotes, forja, inventário e arena) com jogabilidade responsiva e iluminação dinâmica `Light2D`.

Acesse e jogue no navegador: **[https://taverna-dos-templarios.web.app/](https://taverna-dos-templarios.web.app/)**

---

## 🎮 Modos de Controle

| Comando / Ação | Teclado & Mouse | Celular (Touch) |
|:---|:---|:---|
| **Caminhar até o Ponto** | Clique Esquerdo no Terreno (*Point-and-Click*) | Joystick Virtual Esquerdo |
| **Movimentação Direta** | Teclas `W` `A` `S` `D` / Setas | Joystick Virtual Esquerdo |
| **Ataque Básico** | `Espaço` ou Clique Próximo ao Inimigo | Botão `Ⓑ Atacar` |
| **Habilidades Ativas** | Teclas `1`, `2`, `3` | Botões `1`, `2`, `3` |
| **Dash / Esquiva** | Tecla `Shift` | Botão `Ⓧ Esquiva` |
| **Interagir com NPCs** | Tecla `E` / `ENTER` / Clique no NPC | Botão `Ⓐ Interagir` |
| **Perfil & Atributos** | Tecla `C` | Menu da UI |
| **Inventário & Equipar** | Tecla `I` | Menu da UI |
| **Alternar Controles Touch** | Botão `📱 Touch` (Canto Sup. Direito) | Botão `📱 Touch` |

---

## 🛡️ As 12 Classes Jogáveis

Todas as 12 classes possuem spritesheets 16-bit completas e animações procedimentais:

| Classe | Arquétipo | Recurso | Habilidades Principais |
|:---|:---|:---|:---|
| 🛡️ **Paladino** | Tank / DPS | Fé Sagrada | Escudo Divino, Cura Divina, Impacto da Justiça |
| 🛡️ **Guardião** | Tank Puro | Determinação | Muralha Inabalável, Provocar, Investida de Escudo |
| ⚔️ **Guerreiro** | DPS Melee | Fúria | Corte Giratório, Grito de Guerra, Impacto Devastador |
| 🔮 **Mago** | DPS Mágico | Mana | Bola de Fogo Arcana, Barreira de Gelo, Teletransporte |
| 💀 **Necromante** | Summoner | Essência Vital | Orbe Sombrio, Servo Esqueleto, Explosão Cadavérica |
| 🏹 **Arqueiro** | DPS Ranged | Concentração | Disparo Triplo, Armadilha de Caça, Chuva de Flechas |
| 🗡️ **Assassino** | DPS Burst | Furtividade | Corte Sombrio, Faca Envenenada, Invisibilidade |
| 💚 **Clérigo** | Healer / Suporte | Preces | Luz Sagrada, Punição Divina, Aura de Proteção |
| 🛡️ **Cavaleiro Negro** | Off-Tank Sombrio | Sangue | Dreno de Vida, Marca Sombria, Aura de Ruína |
| 🔮 **Elementalista** | Controle Mágico | Elementos | Meteoro Devastador, Tempestade Elétrica, Onda de Gelo |
| 🎶 **Bardo** | Buffer | Melodias | Hino da Coragem, Balada da Regeneração, Eco Dissonante |
| 🐻 **Druida** | Shapeshifter | Natureza | Forma de Urso, Vinhas Asfixiantes, Semente da Vida |

---

## 🏛️ Sistema de Interface (System UI)

- ❤️ **Recipientes de Coração Zelda (`❤️ ❤️ ❤️ ❤️ ❤️`)**: Indicador de HP dinâmico no topo esquerdo.
- 🪙 **Badges em Pílulas**: Exibição de Ouro, Gemas e Recursos com bordas metálicas douradas.
- 🎮 **GBA Action Hints**: Pílulas coloridas para atalhos `Ⓐ Interagir`, `Ⓑ Atacar` e `Ⓧ Esquiva`.
- 🎒 **Inventário Reativo**: Equipar armas, armaduras, elmos e escudos com atualização imediata da UI.

---

## 🛠️ Stack Tecnológico

| Tecnologia | Uso |
|:---|:---|
| **Phaser 3** | Engine de jogo 2D com Shaders `Light2D` |
| **TypeScript** | Linguagem principal com tipagem estrita |
| **Vite** | Build tool & Dev Server de alta performance |
| **Firebase** | Cloud Auth, Firestore Save & Hosting |

---

## 🚀 Execução Local

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Gerar build de produção
npm run build
```

---

## 📝 Licença

Proprietário — Todos os direitos reservados.
