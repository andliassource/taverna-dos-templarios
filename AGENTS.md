# Regra de Execução Autônoma

- **NUNCA peça para o usuário rodar comandos de terminal (build, test, deploy, etc.)**.
- Você (o agente) deve **SEMPRE executar diretamente** todos os comandos de build, testes e deploy para o Firebase/Hosting ou servidores de produção.
- Ao concluir alterações, faça o build e o deploy automaticamente e entregue o resultado final funcionando.
