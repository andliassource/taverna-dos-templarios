# Instruções Gerais de Execução — Taverna dos Templários

1. **Autonomia Total de Comandos**: O agente NUNCA deve solicitar ao usuário para executar comandos no terminal (`npm build`, `firebase deploy`, `git`, etc.).
2. **Deploy Automático**: Sempre compilar (`vite build`) e publicar (`firebase deploy`) os resultados diretamente ao concluir qualquer alteração.
3. **Uso de Assets & Artes de Jogos**: NUNCA desenhar sprites, monstros ou UI proceduralmente por código cru de Canvas do zero quando houver assets pré-configurados (Mixamo, Kenney.nl, OpenGameArt, etc.). Priorizar sempre gráficos HD reais e spritesheets 2D/2.5D de alta fidelidade.
4. **Boas Práticas para Jogos**: Manter animações fluidas de 60 FPS, transparência limpa via ChromaKey, anti-aliasing `roundPixels`, filtro de textura `NEAREST` para evitar emendas e interface visual AAA Obsidian & Gold Glassmorphism.
5. **Regra Estrita de Dados Reais**: PROIBIDO de forma alguma utilizar dados fictícios, preenchimentos de teste (mock data), nomes fakes de jogadores ou contadores simulados. Tudo deve ser 100% autêntico e funcional.
