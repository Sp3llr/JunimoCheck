# Especificação de Requisitos — JunimoCheck

**Versão:** 1.0  
**Data:** 17 de agosto de 2026  
**Autor:** Manoel Ricardo  
**Projeto:** [JunimoCheck](https://github.com/Sp3llr/JunimoCheck)

## 1. Objetivo

Este documento descreve os requisitos funcionais e não funcionais da JunimoCheck, uma aplicação web colaborativa criada para organizar as entregas dos pacotes do Centro Comunitário de Stardew Valley.

A aplicação permite que jogadores criem fazendas, convidem integrantes e acompanhem uma checklist compartilhada em tempo real.

## 2. Escopo

A JunimoCheck contempla:

- cadastro e autenticação de usuários;
- criação e personalização de fazendas;
- gerenciamento de integrantes;
- checklist compartilhada do Centro Comunitário;
- filtros por sala e estação;
- acompanhamento do progresso;
- sincronização das alterações entre os integrantes.

A JunimoCheck não modifica arquivos do jogo e não se conecta diretamente ao Stardew Valley. As informações são registradas manualmente pelos usuários.

## 3. Atores do sistema

| Ator | Descrição |
|---|---|
| Visitante | Pessoa que ainda não entrou em uma conta e pode realizar cadastro ou login. |
| Usuário | Pessoa autenticada que pode criar fazendas ou acessar fazendas das quais participa. |
| Proprietário | Usuário responsável pela fazenda, com permissão para convidar ou remover integrantes e excluir a fazenda. |
| Integrante | Usuário convidado que pode visualizar e atualizar a checklist compartilhada. |

## 4. Prioridades

| Prioridade | Significado |
|---|---|
| Essencial | Sem este requisito, uma função principal do sistema não pode ser utilizada corretamente. |
| Importante | Melhora significativamente a experiência ou o gerenciamento do sistema. |
| Desejável | Complementa a experiência, mas não impede o funcionamento principal. |

## 5. Requisitos funcionais

Os requisitos funcionais descrevem **o que o sistema deve fazer**.

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | O sistema deve permitir que o visitante crie uma conta informando nome, e-mail e senha. | Essencial |
| RF02 | O sistema deve permitir que o usuário escolha um personagem para representar seu perfil. | Importante |
| RF03 | O sistema deve permitir que o usuário entre e saia de sua conta. | Essencial |
| RF04 | O sistema deve permitir a solicitação de redefinição de senha por e-mail. | Essencial |
| RF05 | O sistema deve permitir que o usuário altere o personagem de seu perfil. | Importante |
| RF06 | O sistema deve exibir no hub todas as fazendas criadas pelo usuário ou compartilhadas com ele. | Essencial |
| RF07 | O sistema deve permitir a criação de uma fazenda com nome, título da checklist, descrição e logo personalizada. | Essencial |
| RF08 | O sistema deve exibir uma pré-visualização da logo antes da criação da fazenda. | Importante |
| RF09 | O sistema deve permitir que o proprietário exclua sua fazenda mediante confirmação e repetição do nome. | Essencial |
| RF10 | O sistema deve permitir que o proprietário convide integrantes por e-mail. | Essencial |
| RF11 | O sistema deve permitir que uma pessoa convidada acesse a fazenda utilizando sua conta. | Essencial |
| RF12 | O sistema deve exibir os nomes e personagens dos integrantes de cada fazenda. | Importante |
| RF13 | O sistema deve permitir que o proprietário remova um integrante após uma confirmação. | Essencial |
| RF14 | O sistema deve permitir que os integrantes marquem e desmarquem itens da checklist. | Essencial |
| RF15 | O sistema deve sincronizar as alterações da checklist entre os integrantes da fazenda. | Essencial |
| RF16 | O sistema deve calcular e exibir a quantidade e a porcentagem de entregas concluídas. | Essencial |
| RF17 | O sistema deve identificar visualmente quando um pacote da checklist estiver completo. | Importante |
| RF18 | O sistema deve bloquear marcações adicionais nos pacotes que exigem somente uma quantidade limitada de itens. | Essencial |
| RF19 | O sistema deve permitir filtrar os pacotes pelas salas do Centro Comunitário. | Importante |
| RF20 | O sistema deve permitir filtrar os itens por Primavera, Verão, Outono e Inverno. | Essencial |
| RF21 | O sistema deve alterar o cenário e as cores de acordo com a estação selecionada. | Desejável |
| RF22 | O sistema deve informar, quando aplicável, a estação, o horário e o local de obtenção de cada item. | Importante |
| RF23 | O sistema deve disponibilizar links dos itens para páginas correspondentes da Wiki de Stardew Valley em português. | Importante |
| RF24 | O sistema deve exibir mensagens temporárias de sucesso ou erro após as ações do usuário. | Importante |

## 6. Regras de negócio

| ID | Regra |
|---|---|
| RN01 | Cada usuário pode criar no máximo três fazendas. |
| RN02 | Somente o proprietário pode excluir a fazenda. |
| RN03 | Somente o proprietário pode convidar ou remover integrantes. |
| RN04 | O proprietário não pode ser removido da própria fazenda como se fosse um integrante comum. |
| RN05 | O progresso pertence à fazenda e deve ser compartilhado entre todos os seus integrantes. |
| RN06 | Ao atingir a quantidade exigida por um pacote de escolha, os itens restantes devem permanecer desabilitados até que uma seleção seja desmarcada. |
| RN07 | A exclusão de uma fazenda deve exigir que o proprietário digite corretamente o nome dela. |

## 7. Requisitos não funcionais

Os requisitos não funcionais descrevem **como o sistema deve funcionar**.

| ID | Requisito | Categoria | Prioridade |
|---|---|---|---|
| RNF01 | A interface deve adaptar-se a computadores, tablets e celulares. | Usabilidade | Essencial |
| RNF02 | A interface deve utilizar português do Brasil em seus textos e mensagens. | Usabilidade | Importante |
| RNF03 | Os controles devem apresentar rótulos compreensíveis e retorno visual após a interação. | Usabilidade | Importante |
| RNF04 | A aplicação deve funcionar nas versões atuais dos principais navegadores baseados em Chromium e Firefox. | Compatibilidade | Importante |
| RNF05 | O acesso às áreas privadas deve exigir uma sessão de usuário válida. | Segurança | Essencial |
| RNF06 | As políticas de Row Level Security do Supabase devem impedir o acesso não autorizado às fazendas e aos dados de outros usuários. | Segurança | Essencial |
| RNF07 | Chaves administrativas, como a chave `service_role`, não devem ser expostas no código executado pelo navegador. | Segurança | Essencial |
| RNF08 | Senhas devem ser processadas pelo serviço de autenticação e não devem ser armazenadas diretamente nas tabelas da aplicação. | Segurança | Essencial |
| RNF09 | Alterações colaborativas devem aparecer para os demais integrantes sem exigir a atualização manual da página. | Tempo real | Essencial |
| RNF10 | O sistema deve preservar a integridade do progresso quando diferentes integrantes atualizarem a mesma fazenda. | Confiabilidade | Essencial |
| RNF11 | O sistema deve apresentar mensagens de erro sem revelar informações sensíveis do banco de dados ou da autenticação. | Segurança | Essencial |
| RNF12 | O código deve ser versionado em um repositório Git e possuir histórico de alterações. | Manutenibilidade | Importante |
| RNF13 | As configurações sensíveis e específicas de ambiente devem ser mantidas fora do código-fonte público. | Manutenibilidade | Essencial |
| RNF14 | A aplicação deve ser publicável como aplicação web no Cloudflare Workers. | Portabilidade | Importante |
| RNF15 | Imagens em pixel art devem permanecer nítidas e não devem distorcer o conteúdo principal. | Interface | Desejável |
| RNF16 | Animações decorativas devem respeitar a preferência de redução de movimento do dispositivo quando possível. | Acessibilidade | Desejável |
| RNF17 | A aplicação deve apresentar aviso informando que é um projeto de fãs sem afiliação oficial com Stardew Valley ou ConcernedApe. | Legal | Essencial |

## 8. Restrições

- O sistema depende de conexão com a internet para autenticação, sincronização e armazenamento dos dados.
- O sistema utiliza Supabase para autenticação, banco de dados, armazenamento e tempo real.
- O frontend é desenvolvido com Next.js, React e TypeScript.
- A publicação principal utiliza Cloudflare Workers.
- O conteúdo relacionado a Stardew Valley pertence aos seus respectivos proprietários.

## 9. Critérios gerais de aceitação

A versão pode ser considerada funcional quando:

1. um usuário consegue criar uma conta e entrar;
2. o usuário consegue criar uma fazenda dentro do limite permitido;
3. o proprietário consegue convidar e remover integrantes;
4. os integrantes conseguem marcar itens e visualizar o mesmo progresso;
5. os filtros exibem corretamente os pacotes de cada sala ou estação;
6. usuários sem permissão não conseguem acessar ou alterar fazendas de terceiros;
7. as funções principais podem ser utilizadas tanto no computador quanto no celular.

## 10. Controle de alterações

| Versão | Data | Alteração |
|---|---|---|
| 1.0 | 17/08/2026 | Criação da primeira especificação de requisitos funcionais e não funcionais. |
