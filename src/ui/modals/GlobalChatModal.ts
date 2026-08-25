import Phaser from 'phaser';
import { SoundSynth } from '../../utils/SoundSynth';

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
  private tabButtons: Map<'GERAL' | 'GUILDA' | 'GRUPO' | 'PRIVADO', Phaser.GameObjects.Text> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createChatUI();
    this.addDefaultWelcomeMessages();
  }

  private createChatUI(): void {
    const width = 360;
    const height = 200;
    const x = 20;
    const y = this.scene.scale.height - height - 20;

    this.container = this.scene.add.container(x, y).setDepth(1500).setScrollFactor(0);

    // Fundo de Vidro Obsidiana Translúcido
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0a0614, 0.92);
    bg.fillRoundedRect(0, 0, width, height, 10);
    bg.lineStyle(2, 0xffd700, 0.85);
    bg.strokeRoundedRect(0, 0, width, height, 10);
    this.container.add(bg);

    // Cabeçalho das Abas (GERAL, GUILDA, GRUPO, PRIVADO)
    const channels: Array<'GERAL' | 'GUILDA' | 'GRUPO' | 'PRIVADO'> = ['GERAL', 'GUILDA', 'GRUPO', 'PRIVADO'];
    channels.forEach((ch, idx) => {
      const tabX = 12 + idx * 82;
      const tabBtn = this.scene.add.text(tabX, 8, `[${ch}]`, {
        fontFamily: 'Cinzel',
        fontSize: '11px',
        fontStyle: 'bold',
        color: ch === this.activeChannel ? '#ffd700' : '#888888',
      }).setInteractive({ useHandCursor: true });

      tabBtn.on('pointerdown', () => {
        this.activeChannel = ch;
        this.updateTabColors();
        this.updateChatDisplay();
      });

      this.tabButtons.set(ch, tabBtn);
      this.container.add(tabBtn);
    });

    // Divisor abaixo das abas
    const div = this.scene.add.graphics();
    div.lineStyle(1, 0xd4af37, 0.4);
    div.lineBetween(8, 28, width - 8, 28);
    this.container.add(div);

    // Área de Texto do Histórico de Mensagens
    for (let i = 0; i < 6; i++) {
      const msgTxt = this.scene.add.text(12, 34 + i * 22, '', {
        fontFamily: 'Inter',
        fontSize: '11px',
        color: '#ffffff',
        wordWrap: { width: 336 },
      });
      this.messageTexts.push(msgTxt);
      this.container.add(msgTxt);
    }

    // Botão de Abrir Entrada de Texto
    const sendBtn = this.scene.add.text(12, height - 28, '💬 Pressione Enter ou Clique para conversar...', {
      fontFamily: 'Inter',
      fontSize: '11px',
      color: '#ffd700',
      backgroundColor: '#1a102a',
      padding: { x: 10, y: 4 },
    }).setInteractive({ useHandCursor: true });

    sendBtn.on('pointerdown', () => {
      this.promptMessageInput();
    });

    this.container.add(sendBtn);

    // Tecla Enter para Chat Rápido
    this.scene.input.keyboard?.on('keydown-ENTER', () => {
      const existing = document.getElementById('chat-input-overlay');
      if (!existing && this.isVisible) {
        this.promptMessageInput();
      }
    });
  }

  private updateTabColors(): void {
    this.tabButtons.forEach((btn, ch) => {
      if (ch === this.activeChannel) {
        btn.setColor('#ffd700');
      } else {
        btn.setColor('#888888');
      }
    });
  }

  private addDefaultWelcomeMessages(): void {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.messages.push({
      sender: 'Sistema', classType: 'SYSTEM', channel: 'GERAL',
      text: '⚔️ Bem-vindo ao MMORPG Taverna dos Templários!', timestamp: now,
    });

    this.updateTabColors();
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

    if (this.messages.length > 50) {
      this.messages.shift();
    }

    this.updateChatDisplay();
  }

  private promptMessageInput(): void {
    const existing = document.getElementById('chat-input-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'chat-input-overlay';
    overlay.style.position = 'fixed';
    overlay.style.bottom = '22px';
    overlay.style.left = '20px';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.gap = '8px';
    overlay.style.backgroundColor = 'rgba(10, 6, 20, 0.98)';
    overlay.style.padding = '8px 12px';
    overlay.style.borderRadius = '8px';
    overlay.style.border = '2px solid #ffd700';
    overlay.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.8)';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Enviar mensagem em [${this.activeChannel}]...`;
    input.style.backgroundColor = '#1a0e2e';
    input.style.color = '#ffffff';
    input.style.border = '1px solid #5a3e10';
    input.style.padding = '6px 12px';
    input.style.borderRadius = '4px';
    input.style.fontFamily = 'Inter, sans-serif';
    input.style.fontSize = '12px';
    input.style.width = '240px';
    input.style.outline = 'none';

    const sendBtn = document.createElement('button');
    sendBtn.innerText = 'ENVIAR';
    sendBtn.style.backgroundColor = '#ffd700';
    sendBtn.style.color = '#0a0612';
    sendBtn.style.border = 'none';
    sendBtn.style.padding = '6px 14px';
    sendBtn.style.borderRadius = '4px';
    sendBtn.style.fontFamily = 'Cinzel, serif';
    sendBtn.style.fontWeight = 'bold';
    sendBtn.style.cursor = 'pointer';

    const doSend = () => {
      if (input.value.trim()) {
        this.sendMessage(input.value.trim(), 'Templário (Você)', this.activeChannel);
        SoundSynth.playUpgrade();
      }
      overlay.remove();
    };

    sendBtn.onclick = doSend;
    input.onkeydown = (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') doSend();
      if (e.key === 'Escape') overlay.remove();
    };

    overlay.appendChild(input);
    overlay.appendChild(sendBtn);
    document.body.appendChild(overlay);
    setTimeout(() => input.focus(), 50);
  }

  private updateChatDisplay(): void {
    const filtered = this.messages.filter(m => m.channel === this.activeChannel || m.sender === 'Sistema');
    const recent = filtered.slice(-6);

    this.messageTexts.forEach((txt, idx) => {
      if (idx < recent.length) {
        const msg = recent[idx];
        let color = '#ffffff';
        if (msg.sender === 'Sistema') color = '#ffd700';
        else if (msg.channel === 'GUILDA') color = '#33ff88';
        else if (msg.channel === 'GRUPO') color = '#00e5ff';
        else if (msg.channel === 'PRIVADO') color = '#ff77ff';

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
