# Uso seguro de token Cloudflare

## Quando criar um token
1. Entre no painel Cloudflare.
2. Vá em **API Tokens** > **Create Token**.
3. Crie um token customizado para este projeto.

## Permissões mínimas necessárias
- `Workers AI` → `Edit`
- `Vectorize` → `Edit`

Não marque permissões de conta ou billing se não precisar.

## Como usar o token
1. Copie o token apenas para uso local.
2. No terminal, configure apenas no shell atual:

```powershell
$env:CLOUDFLARE_ACCOUNT_ID="9be294b417f40ca51e6805d2a475c7c7"
$env:CLOUDFLARE_API_TOKEN="SEU_TOKEN_AQUI"
py -3 scripts\indexar-concursos-v2.py
```

3. Não salve o token em arquivos de código nem cole em conversas.

## Se o token vazar ou for exposto
1. Revogue o token imediatamente no Cloudflare.
2. Crie um novo token com as permissões mínimas.
3. Atualize apenas no seu terminal local.

## Boa prática
- Use um token apenas para a tarefa necessária.
- Não poste o token em chats, screenshots ou código compartilhado.
- Se precisar de novo, gere outro token.

## Ferramenta reutilizável

Também há um utilitário reutilizável no projeto:

- `tools/cloudflare_token_tool.py`

Ele pode:
- verificar se um token Cloudflare é válido com `--check`
- carregar `CLOUDFLARE_ACCOUNT_ID` e `CLOUDFLARE_API_TOKEN` de um `.env`
- executar um comando local com as credenciais configuradas via `--run-cmd`

O projeto já inclui um template seguro:

- `.env.example`

Use-o como modelo e nunca coloque valores reais em arquivos versionados.

Exemplo:

```powershell
py -3 tools\cloudflare_token_tool.py --env-file .env --check
py -3 tools\cloudflare_token_tool.py --env-file .env --run-cmd "py -3 scripts\indexar-concursos-v2.py"
```

## Proteção adicional

O repositório já ignora arquivos de ambiente sensíveis como:

- `.env`
- `.env.local`
- `.env.*.local`

Isso evita que arquivos de credenciais sejam adicionados ao git por acidente.
