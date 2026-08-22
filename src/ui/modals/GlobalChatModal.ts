import Phaser from 'phaser';

export interface ChatMessage {
  sender: string;
  classType: string;
  channel: 'GERAL' | 'GUILDA' | 'GRUPO' | 'PRIVADO';
  text: string;
  timestamp: string;
}

export class GlobalChatModal {
  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private isVisible = true;
  private activeChannel: 'GERAL' | 'GUILDA' | 'GRUPO' | 'PRIVADO' = 'GERAL';
  private messages: ChatMessage[] = [];
  private messageTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createChatUI();
    this.addDefaultWelcomeMessages();
  }

  private createChatUI(): void {
    const width = 340;
    const height = 180;
    const x = 20;
    const y = this.scene.scale.height - height - 60;

    this.container = this.scene.add.container(x, y).setDepth(1500).setScrollFactor(0);

    // Fundo de Vidro Obsidiana Translúcido
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0a0614, 0.85);
    bg.fillRoundedRect(0, 0, width, height, 10);
    bg.lineStyle(2, 0xffd700, 0.8);
    bg.strokeRoundedRect(0, 0, width, height, 10);
    this.container.add(bg);

    // Cabeçalho das Abas (GERAL, GUILDA, GRUPO, PRIVADO)
    const channels: Array<'GERAL' | 'GUILDA' | 'GRUPO' | 'PRIVADO'> = ['GERAL', 'GUILDA', 'GRUPO', 'PRIVADO'];
    channels.forEach((ch, idx) => {
      const tabX = 10 + idx * 80;
      const tabBtn = this.scene.add.text(tabX, 8, `[${ch}]`, {
        fontFamily: 'Cinzel',
        fontSize: '11px',
        fontStyle: 'bold',
        color: ch === this.activeChannel ? '#ffd700' : '#888888',
      }).setInteractive({ useHandCursor: true });

      tabBtn.on('pointerdown', () => {
        this.activeChannel = ch;
        this.updateChatDisplay();
      });

      this.container.add(tabBtn);
    });

    // Área de Texto do Histórico de Mensagens
    for (let i = 0; i < 6; i++) {
      const msgTxt = this.scene.add.text(12, 32 + i * 20, '', {
        fontFamily: 'Inter',
        fontSize: '11px',
        color: '#ffffff',
        wordWrap: { width: 316 },
      });
      this.messageTexts.push(msgTxt);
      this.container.add(msgTxt);
    }

    // Botão de Abrir Entrada de Texto
    const sendBtn = this.scene.add.text(12, height - 26, '💬 Clique aqui para conversar (Enter)...', {
      fontFamily: 'Inter',
      fontSize: '11px',
      color: '#aaaaaa',
      backgroundColor: '#1a102a',
      padding: { x: 10, y: 4 },
    }).setInteractive({ useHandCursor: true });

    sendBtn.on('pointerdown', () => {
      this.promptMessageInput();
    });

    this.container.add(sendBtn);

    // Tecla Enter para Chat Rápido
    this.scene.input.keyboard?.on('keydown-ENTER', () => {
      this.promptMessageInput();
    });
  }

  private addDefaultWelcomeMessages(): void {
    this.messages.push({
      sender: 'Sistema',
      classType: 'SYSTEM',
      channel: 'GERAL',
      text: '⚔️ Bem-vindo ao MMORPG Taverna dos Templários!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    this.messages.push({
      sender: 'Guardião_Eldrin',
      classType: 'GUARDIAN',
      channel: 'GERAL',
      text: 'Alguém para raidar a Masmorra de Malakor?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    this.updateChatDisplay();
  }

  public sendMessage(text: string, senderName = 'Templário', channel = this.activeChannel): void {
    if (!text.trim()) return;

    this.messages.push({
      sender: senderName,
      classType: 'HERO',
      channel: channel,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    if (this.messages.length > 30) {
      this.messages.shift();
    }

    this.updateChatDisplay();
  }

  private promptMessageInput(): void {
    const userInput = prompt(`[Chat MMORPG - ${this.activeChannel}] Digite sua mensagem:`);
    if (userInput) {
      this.sendMessage(userInput);
    }
  }

  private updateChatDisplay(): void {
    const filtered = this.messages.filter(m => m.channel === this.activeChannel || m.channel === 'GERAL');
    const recent = filtered.slice(-6);

    this.messageTexts.forEach((txt, idx) => {
      if (idx < recent.length) {
        const msg = recent[idx];
        const color = msg.sender === 'Sistema' ? '#ffd700' : (msg.channel === 'GUILDA' ? '#33ff33' : '#ffffff');
        txt.setText(`[${msg.timestamp}] ${msg.sender}: ${msg.text}`).setColor(color);
      } else {
        txt.setText('');
      }
    });
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.container.setVisible(this.isVisible);
  }
}
