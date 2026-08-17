# Instruções Gerais de Execução

1. **Autonomia Total de Comandos**: O agente NUNCA deve solicitar ao usuário para executar comandos no terminal (`npm build`, `firebase deploy`, `git`, etc.).
2. **Deploy Automático**: Sempre compilar (`vite build`) e publicar (`firebase deploy`) os resultados diretamente ao concluir qualquer alteração.
