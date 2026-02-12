## 1. Como funciona
Este repositório contém uma implementação técnica avançada voltada para a automação de protocolos de telemetria do ecossistema de Quests do Discord. O motor de injeção permite a emulação de estados de execução de aplicações, fluxos de vídeo e atividades de interação sem a necessidade de instanciamento de recursos de hardware externos ou execução de binários de jogos.
A engine opera através da interceptação do `webpackChunkdiscord_app`, realizando o "sequestro" de módulos internos responsáveis pelo despacho de estados globais da aplicação.

O framework utiliza um sistema de busca dinâmica por protótipos para localizar instâncias de:
- **ApplicationStreamingStore:** Manipulação de metadados de transmissão.
- **RunningGameStore:** Emulação de Process ID (PID) e executáveis em execução.
- **QuestsStore:** Gerenciamento de estado de progresso e verificação de expiração.
- **FluxDispatcher:** Injeção de eventos de sistema diretamente no barramento de dados do Discord.

## 2. Como Utilizar

Para garantir a integridade da injeção e evitar falhas de segmentação de memória, siga rigorosamente o protocolo abaixo:
- **Ambiente: Utilize o Discord PTB.
- **Sincronização: Acesse a aba oficial de Missões (Quests) nas configurações do seu Discord e certifique-se de que a missão desejada foi aceita.
- **Injeção: Pressione Ctrl + Shift + I para abrir o Console de Desenvolvedor.
- **Execução: Copie o conteúdo integral do arquivo script.js, cole no console e pressione Enter.
Feedback: Sera renderizado em tempo real um progresso indicando tudo.

## 3. Riscos

O uso deste software envolve a manipulação de chamadas de API de baixo nível e telemetria simulada. O usuário deve estar ciente dos seguintes pontos:
- **Detecção Heurística: O uso de automação pode ser detectado através de análise estatística de pacotes pela plataforma.
- **Termos de Serviço: Esta ferramenta viola os Termos de Serviço do Discord. O uso excessivo pode resultar em restrições ou banimento permanente da conta.
- **Isenção de Responsabilidade: não me responsabilizo por quaisquer danos, perdas de conta ou sanções aplicadas pela plataforma decorrentes do uso desta ferramenta.

---
**Software distribuído para fins educacionais e de pesquisa em engenharia reversa de software.
Créditos de Desenvolvimento: odeiofivem*
