import Phaser from 'phaser';
import { UI_THEME } from '../../config/theme.config';
import { GuildSystem } from '../../systems/GuildSystem';
import { SoundManager } from '../../audio/SoundManager';
import { FirebaseService } from '../../network/FirebaseService';

export class GuildModal extends Phaser.GameObjects.Container {
  private onClose?: () => void;
  private activeTab: 'GUILDS_LIST' | 'CREATE_GUILD' | 'MEMBERS' | 'DONATE' | 'REQUESTS' = 'GUILDS_LIST';

  constructor(scene: Phaser.Scene, onClose?: () => void) {
    const { width, height } = scene.scale;
    super(scene, width / 2, height / 2);
    this.onClose = onClose;
    this.setDepth(2100);
    this.setVisible(true);

    scene.add.existing(this);
    this.renderModal();
  }

  public toggle(): void {
    this.setVisible(!this.visible);
    if (this.visible) {
      this.renderModal();
    }
  }

  private renderModal(): void {
    this.removeAll(true);

    const pw = 580;
    const ph = 430;
    const px = -pw / 2;
    const py = -ph / 2;

    // Fundo de Vidro Obsidiana Translúcido com Moldura Dourada
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0a0618, 0.96);
    bg.fillRoundedRect(px, py, pw, ph, 14);
    bg.lineStyle(2, 0xffd700, 0.95);
    bg.strokeRoundedRect(px, py, pw, ph, 14);
    bg.lineStyle(1, 0x5a3e10, 0.7);
    bg.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 12);
    this.add(bg);

    // Título Central
    const title = this.scene.add.text(0, py + 22, '🏰 SISTEMA DE GUILDAS & CLÃS TEMPLÁRIOS', {
      fontFamily: UI_THEME.fonts.title, fontSize: '15px', color: '#ffd700', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add(title);

    // Botão Fechar [X]
    const closeBtn = this.scene.add.text(px + pw - 24, py + 20, '❌', { fontSize: '14px' })
      .setInteractive({ useHandCursor: true }).setOrigin(0.5);
    closeBtn.on('pointerdown', () => {
      if (this.onClose) this.onClose();
      this.setVisible(false);
    });
    this.add(closeBtn);

    const userGuild = GuildSystem.getInstance().getUserGuild();

    if (!userGuild) {
      this.renderNoGuildView(px, py);
    } else {
      this.renderGuildMemberView(px, py, userGuild);
    }
  }

  /**
   * Visão para Jogadores Sem Guilda: Lista de Guildas Públicas & Formulário de Criação
   */
  private renderNoGuildView(px: number, py: number): void {
    const tabY = py + 52;
    const gs = GuildSystem.getInstance();

    // Abas: [LOCALIZAR GUILDA] e [CRIAR NOVA GUILDA]
    const tabs: Array<{ key: 'GUILDS_LIST' | 'CREATE_GUILD'; label: string; x: number }> = [
      { key: 'GUILDS_LIST', label: '🔍 LOCALIZAR GUILDA', x: px + 40 },
      { key: 'CREATE_GUILD', label: '⚔️ FUNDAR NOVA GUILDA', x: px + 220 },
    ];

    tabs.forEach(t => {
      const isSel = this.activeTab === t.key || (this.activeTab !== 'CREATE_GUILD' && t.key === 'GUILDS_LIST');
      const btn = this.scene.add.text(t.x, tabY, t.label, {
        fontFamily: UI_THEME.fonts.title,
        fontSize: '12px',
        fontStyle: 'bold',
        color: isSel ? '#ffd700' : '#888888',
      }).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this.activeTab = t.key;
        SoundManager.getInstance().playUIClick();
        this.renderModal();
      });
      this.add(btn);
    });

    // Linha Divisória
    const div = this.scene.add.graphics();
    div.lineStyle(1, 0xd4af37, 0.4);
    div.lineBetween(px + 20, py + 74, px + 560, py + 74);
    this.add(div);

    if (this.activeTab === 'CREATE_GUILD') {
      this.renderCreateGuildForm(px, py);
    } else {
      this.renderGuildsList(px, py, gs);
    }
  }

  /**
   * Lista de Guildas Públicas do Reino para Solicitar Entrada
   */
  private renderGuildsList(px: number, py: number, gs: GuildSystem): void {
    const publicGuilds = gs.getPublicGuilds();
    const startY = py + 85;

    publicGuilds.forEach((g, idx) => {
      const yPos = startY + idx * 72;

      const cardBg = this.scene.add.graphics();
      cardBg.fillStyle(0x130a24, 0.9);
      cardBg.fillRoundedRect(px + 30, yPos, 520, 62, 6);
      cardBg.lineStyle(1.5, 0x4a2d6e, 0.8);
      cardBg.strokeRoundedRect(px + 30, yPos, 520, 62, 6);

      const name = this.scene.add.text(px + 45, yPos + 10, `[${g.tag}] ${g.name}`, {
        fontFamily: UI_THEME.fonts.title, fontSize: '13px', color: '#ffd700', fontStyle: 'bold'
      });

      const info = this.scene.add.text(px + 45, yPos + 28, `Nível ${g.level}  |  Membros: ${g.memberCount}/${g.maxMembers}  |  Mestre: ${g.leaderName}`, {
        fontFamily: UI_THEME.fonts.hud, fontSize: '10px', color: '#aaaaaa'
      });

      const reqText = this.scene.add.text(px + 45, yPos + 44, `💬 "${g.motd}"  • Exige Nível ${g.minLevelReq}+`, {
        fontFamily: UI_THEME.fonts.body, fontSize: '10px', color: '#3498db', fontStyle: 'italic'
      });

      const isPending = gs.getPendingRequestGuildId() === g.id;

      const btnBg = this.scene.add.graphics();
      btnBg.fillStyle(isPending ? 0x7f8c8d : 0x27ae60, 1);
      btnBg.fillRoundedRect(px + 395, yPos + 16, 140, 30, 6);

      const btnText = this.scene.add.text(px + 465, yPos + 31, isPending ? '⏳ PENDENTE' : '📩 ENTRAR', {
        fontFamily: UI_THEME.fonts.title, fontSize: '10px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);

      if (!isPending) {
        const btnZone = this.scene.add.zone(px + 465, yPos + 31, 140, 30).setInteractive({ useHandCursor: true });
        btnZone.on('pointerdown', () => {
          const res = gs.requestJoinGuild(g.id, 15);
          SoundManager.getInstance().playCoinPickup();
          alert(res.message);
          this.renderModal();
        });
        this.add(btnZone);
      }

      this.add([cardBg, name, info, reqText, btnBg, btnText]);
    });
  }

  /**
   * Formulário de Fundação de Nova Guilda
   */
  private renderCreateGuildForm(px: number, py: number): void {
    const startY = py + 95;

    const noticeBg = this.scene.add.graphics();
    noticeBg.fillStyle(0x1a0f2e, 0.9);
    noticeBg.fillRoundedRect(px + 40, startY, 500, 50, 6);
    noticeBg.lineStyle(1, 0xffd700, 0.6);
    noticeBg.strokeRoundedRect(px + 40, startY, 500, 50, 6);

    const noticeText = this.scene.add.text(px + 55, startY + 10, '📜 REQUISITOS DE FUNDAÇÃO DE CLÃ:\n• Custo: 1.000 Ouro  • Nível Mínimo do Fundador: Nível 10+', {
      fontFamily: UI_THEME.fonts.body, fontSize: '11px', color: '#ffd700', fontStyle: 'bold'
    });

    const formBg = this.scene.add.graphics();
    formBg.fillStyle(0x130a24, 0.85);
    formBg.fillRoundedRect(px + 40, startY + 65, 500, 160, 8);

    const l1 = this.scene.add.text(px + 60, startY + 80, 'Nome da Guilda: Ordem Sagrada', {
      fontFamily: UI_THEME.fonts.body, fontSize: '12px', color: '#ffffff'
    });
    const l2 = this.scene.add.text(px + 60, startY + 110, 'Tag da Guilda (3 Letras): OSG', {
      fontFamily: UI_THEME.fonts.body, fontSize: '12px', color: '#ffffff'
    });
    const l3 = this.scene.add.text(px + 60, startY + 140, 'Nível Mínimo para Membros: 10', {
      fontFamily: UI_THEME.fonts.body, fontSize: '12px', color: '#ffffff'
    });

    // Botão Fundar
    const fundBtnBg = this.scene.add.graphics();
    fundBtnBg.fillStyle(0xd4af37, 1);
    fundBtnBg.fillRoundedRect(-100, py + 340, 200, 38, 6);
    fundBtnBg.lineStyle(2, 0xffffff, 1);
    fundBtnBg.strokeRoundedRect(-100, py + 340, 200, 38, 6);

    const fundText = this.scene.add.text(0, py + 359, '⚔️ FUNDAR GUILDA (1.000 OURO)', {
      fontFamily: UI_THEME.fonts.title, fontSize: '11px', color: '#0a0612', fontStyle: 'bold'
    }).setOrigin(0.5);

    const fundZone = this.scene.add.zone(0, py + 359, 200, 38).setInteractive({ useHandCursor: true });
    fundZone.on('pointerdown', () => {
      const res = GuildSystem.getInstance().createGuild('Ordem Sagrada', 'OSG', 10, 'Unidos na Batalha Sagrada!', 15, 2500);
      if (res.success) {
        SoundManager.getInstance().playCoinPickup();
        alert(res.message);
        this.activeTab = 'MEMBERS';
        this.renderModal();
      } else {
        alert(res.message);
      }
    });

    this.add([noticeBg, noticeText, formBg, l1, l2, l3, fundBtnBg, fundText, fundZone]);
  }

  /**
   * Visão para Membros da Guilda: Roster, Doações e Gestão de Pedidos
   */
  private renderGuildMemberView(px: number, py: number, guild: any): void {
    const isLeader = guild.members.some((m: any) => m.name.includes('Você') && m.role === 'Mestre');

    // Header da Guilda
    const headerBg = this.scene.add.graphics();
    headerBg.fillStyle(0x130a24, 0.95);
    headerBg.fillRoundedRect(px + 20, py + 50, 540, 50, 8);
    headerBg.lineStyle(1.5, 0xffd700, 0.8);
    headerBg.strokeRoundedRect(px + 20, py + 50, 540, 50, 8);

    const titleText = this.scene.add.text(px + 35, py + 58, `[${guild.tag}] ${guild.name}`, {
      fontFamily: UI_THEME.fonts.title, fontSize: '15px', color: '#ffd700', fontStyle: 'bold'
    });

    const infoText = this.scene.add.text(px + 35, py + 78, `Nível ${guild.level}  |  Membros: ${guild.members.length}/${guild.maxMembers}  |  EXP: ${guild.exp}  |  💬 "${guild.motd}"`, {
      fontFamily: UI_THEME.fonts.body, fontSize: '10px', color: '#aaaaaa'
    });

    this.add([headerBg, titleText, infoText]);

    // Abas de Membro / Mestre
    const tabY = py + 110;
    const reqCount = guild.joinRequests ? guild.joinRequests.length : 0;

    const tabs = [
      { key: 'MEMBERS', label: '👥 MEMBROS', x: px + 35 },
      { key: 'DONATE', label: '💰 DOAÇÕES & BUFFS', x: px + 170 },
      ...(isLeader ? [{ key: 'REQUESTS', label: `📩 ADMISSÃO (${reqCount})`, x: px + 360 }] : []),
    ];

    tabs.forEach(t => {
      const isSel = this.activeTab === t.key || (this.activeTab !== 'DONATE' && this.activeTab !== 'REQUESTS' && t.key === 'MEMBERS');
      const btn = this.scene.add.text(t.x, tabY, t.label, {
        fontFamily: UI_THEME.fonts.title, fontSize: '11px', fontStyle: 'bold', color: isSel ? '#ffd700' : '#888888'
      }).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => {
        this.activeTab = t.key as any;
        SoundManager.getInstance().playUIClick();
        this.renderModal();
      });
      this.add(btn);
    });

    if (this.activeTab === 'REQUESTS' && isLeader) {
      this.renderJoinRequestsView(px, py, guild);
    } else if (this.activeTab === 'DONATE') {
      this.renderDonateView(px, py, guild);
    } else {
      this.renderMembersView(px, py, guild);
    }
  }

  private renderMembersView(px: number, py: number, guild: any): void {
    const startY = py + 140;

    guild.members.forEach((m: any, idx: number) => {
      const yPos = startY + idx * 40;

      const bg = this.scene.add.graphics();
      bg.fillStyle(0x130a24, 0.85);
      bg.fillRoundedRect(px + 20, yPos, 540, 32, 6);
      bg.lineStyle(1, 0x4a2d6e, 0.6);
      bg.strokeRoundedRect(px + 20, yPos, yPos + 32, 6);

      const name = this.scene.add.text(px + 35, yPos + 8, m.name, {
        fontFamily: UI_THEME.fonts.body, fontSize: '12px', color: m.role === 'Mestre' ? '#ffd700' : '#ffffff'
      });

      const role = this.scene.add.text(px + 260, yPos + 8, `[${m.role}]`, {
        fontFamily: UI_THEME.fonts.hud, fontSize: '11px', color: '#9b59b6'
      });

      const contrib = this.scene.add.text(px + 400, yPos + 8, `+${m.contribution} EXP`, {
        fontFamily: UI_THEME.fonts.hud, fontSize: '11px', color: '#2ecc71'
      });

      this.add([bg, name, role, contrib]);
    });
  }

  private renderDonateView(px: number, py: number, guild: any): void {
    const startY = py + 150;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x130a24, 0.9);
    bg.fillRoundedRect(px + 40, startY, 500, 160, 8);

    const desc = this.scene.add.text(px + 60, startY + 20, `Doar ouro para a guilda aumenta o Nível do Clã (Atual: Lv.${guild.level}) e concede EXP passiva!`, {
      fontFamily: UI_THEME.fonts.body, fontSize: '11px', color: '#ffffff', wordWrap: { width: 460 }
    });

    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(0xd4af37, 1);
    btnBg.fillRoundedRect(-100, startY + 90, 200, 36, 6);

    const btnText = this.scene.add.text(0, startY + 108, '💰 DOAR 100 OURO', {
      fontFamily: UI_THEME.fonts.title, fontSize: '12px', color: '#0a0612', fontStyle: 'bold'
    }).setOrigin(0.5);

    const btnZone = this.scene.add.zone(0, startY + 108, 200, 36).setInteractive({ useHandCursor: true });
    btnZone.on('pointerdown', () => {
      GuildSystem.getInstance().contribute(100);
      SoundManager.getInstance().playCoinPickup();
      this.renderModal();
    });

    this.add([bg, desc, btnBg, btnText, btnZone]);
  }

  private renderJoinRequestsView(px: number, py: number, guild: any): void {
    const startY = py + 140;
    const reqs = guild.joinRequests || [];

    if (reqs.length === 0) {
      const emptyText = this.scene.add.text(0, startY + 40, 'Nenhum pedido de admissão pendente.', {
        fontFamily: UI_THEME.fonts.body, fontSize: '12px', color: '#aaaaaa'
      }).setOrigin(0.5);
      this.add(emptyText);
      return;
    }

    reqs.forEach((r: any, idx: number) => {
      const yPos = startY + idx * 48;

      const bg = this.scene.add.graphics();
      bg.fillStyle(0x130a24, 0.9);
      bg.fillRoundedRect(px + 20, yPos, 540, 40, 6);

      const info = this.scene.add.text(px + 35, yPos + 12, `${r.playerName} (Lv.${r.playerLevel} ${r.playerClass})`, {
        fontFamily: UI_THEME.fonts.body, fontSize: '12px', color: '#ffffff'
      });

      // Aceitar
      const accBg = this.scene.add.graphics();
      accBg.fillStyle(0x27ae60, 1);
      accBg.fillRoundedRect(px + 360, yPos + 8, 75, 24, 4);
      const accTxt = this.scene.add.text(px + 397, yPos + 20, 'ACEITAR', {
        fontFamily: UI_THEME.fonts.title, fontSize: '9px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);

      const accZone = this.scene.add.zone(px + 397, yPos + 20, 75, 24).setInteractive({ useHandCursor: true });
      accZone.on('pointerdown', () => {
        GuildSystem.getInstance().acceptRequest(r.id);
        SoundManager.getInstance().playCoinPickup();
        this.renderModal();
      });

      // Rejeitar
      const rejBg = this.scene.add.graphics();
      rejBg.fillStyle(0xc0392b, 1);
      rejBg.fillRoundedRect(px + 445, yPos + 8, 75, 24, 4);
      const rejTxt = this.scene.add.text(px + 482, yPos + 20, 'REJEITAR', {
        fontFamily: UI_THEME.fonts.title, fontSize: '9px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);

      const rejZone = this.scene.add.zone(px + 482, yPos + 20, 75, 24).setInteractive({ useHandCursor: true });
      rejZone.on('pointerdown', () => {
        GuildSystem.getInstance().rejectRequest(r.id);
        SoundManager.getInstance().playUIClick();
        this.renderModal();
      });

      this.add([bg, info, accBg, accTxt, accZone, rejBg, rejTxt, rejZone]);
    });
  }
}
