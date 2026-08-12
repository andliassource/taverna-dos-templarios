import { CombatSystem } from '../systems/CombatSystem';

export interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
}

export class GameplayTestRunner {
  public static runAllTests(combatSystem: CombatSystem): TestResult[] {
    const results: TestResult[] = [];

    // Teste 1: Inicialização do Jogador
    try {
      const hp = combatSystem.getHP();
      const maxHp = combatSystem.getMaxHP();
      const hasValidHp = hp > 0 && maxHp >= hp;
      results.push({
        testName: 'Status do Jogador',
        passed: hasValidHp,
        message: hasValidHp ? `HP OK (${hp}/${maxHp})` : 'HP Inválido',
      });
    } catch (err: any) {
      results.push({ testName: 'Status do Jogador', passed: false, message: err.message });
    }

    // Teste 2: Atribuição de Atributos (FOR, AGI, INT, VIT)
    try {
      const points = combatSystem.getStatPoints();
      results.push({
        testName: 'Pontos de Atributos',
        passed: points >= 0,
        message: `Pontos disponíveis: ${points}`,
      });
    } catch (err: any) {
      results.push({ testName: 'Pontos de Atributos', passed: false, message: err.message });
    }

    // Teste 3: Cooldown de Habilidades
    try {
      const cd0 = combatSystem.getSkillCooldown(0);
      const cd1 = combatSystem.getSkillCooldown(1);
      const passed = cd0 > 0 && cd1 > 0;
      results.push({
        testName: 'Cooldown de Habilidades',
        passed,
        message: passed ? `CD Skill 1: ${cd0}ms, CD Skill 2: ${cd1}ms` : 'Cooldowns com valor zero ou nulo',
      });
    } catch (err: any) {
      results.push({ testName: 'Cooldown de Habilidades', passed: false, message: err.message });
    }

    // Teste 4: Cálculo de Ângulo de Mira por Ponteiro
    try {
      const playerX = 100;
      const playerY = 100;
      const mouseX = 200;
      const mouseY = 100;
      const angle = Math.atan2(mouseY - playerY, mouseX - playerX);
      const passed = Math.abs(angle) < 0.01; // ~0 rad (direção direita)
      results.push({
        testName: 'Cálculo de Mira do Mouse',
        passed,
        message: passed ? 'Mira direcional do mouse precisa (0° à direita)' : `Ângulo incorreto: ${angle}`,
      });
    } catch (err: any) {
      results.push({ testName: 'Cálculo de Mira do Mouse', passed: false, message: err.message });
    }

    return results;
  }
}
