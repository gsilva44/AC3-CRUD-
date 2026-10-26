# AC3 - Cadastro de Alunos

Aplicacao CRUD em Node.js/Express e MySQL. Esta copia e destinada a hospedagem Render + Aiven. A versao demonstrada no relatorio foi executada em uma VM Windows Server.

## Render

- Runtime: Node
- Build Command: `npm ci`
- Start Command: `npm start`
- Root Directory: deixar vazio
- Instance Type: Free
- Health Check Path: `/health`

## Variaveis de ambiente

Preencher exclusivamente no painel do Render, nunca no repositorio:

| Nome | Valor |
| --- | --- |
| DB_HOST | Host do MySQL informado pela Aiven |
| DB_PORT | Porta informada pela Aiven |
| DB_USER | Usuario do banco |
| DB_PASSWORD | Senha do banco |
| DB_NAME | escola (criar em Connect > Databases da Aiven antes de publicar) |
| DB_CA_CERT | Conteudo completo do certificado CA da Aiven, incluindo BEGIN/END CERTIFICATE |

O servidor exige TLS com verificacao do certificado e do hostname. Cole o certificado com quebras de linha reais; tambem aceita sequencias literais de barra invertida + n. Nenhuma credencial foi incluida nestes arquivos.

Na inicializacao, o servidor cria a tabela alunos se ela nao existir, conforme os campos do script do professor. Nao apaga registros nem insere exemplos automaticamente. O usuario do banco precisa de permissao para criar a tabela.

## Verificacao apos publicar

1. Abrir /health: deve retornar status ok e banco conectado.
2. Cadastrar um registro de teste, atualizar a pagina e confirmar a persistencia.
3. Editar o registro e confirmar a alteracao.
4. Excluir apenas o registro de teste.

Esta e uma demonstracao publica sem autenticacao: visitantes podem cadastrar, editar e excluir os dados. Use somente dados ficticios.

O Render Free pode demorar para retomar apos inatividade. Aiven Free pode desligar por inatividade mediante aviso. A URL nao depende de manter a VM local ligada, mas os limites e regras dos provedores continuam valendo.
