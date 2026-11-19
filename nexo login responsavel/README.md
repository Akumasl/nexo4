# NEXO — login, responsável e adolescente (protótipo local)

## Como executar

1. Abra **esta pasta NEXO_UNIFICADO** no VS Code (não abra somente a subpasta HTML).
2. Use **Open with Live Server** sobre o arquivo `index.html` na raiz.
3. Crie uma conta em `cadastro.html` e um perfil de responsável em **Selecionar perfis**.
4. Entre na área do responsável, abra **Meus filhos** e clique em **Adicionar filho**.
5. O NEXO cria automaticamente um perfil de adolescente e um ID exclusivo, como `NX-AB12CD`.
6. Em **Tarefas**, clique em **Adicionar tarefa**, escolha o adolescente pelo nome ou informe seu ID e salve.
7. Clique em **Trocar perfil** para abrir a área do adolescente. A tarefa aparecerá lá.
8. O adolescente abre a tarefa, permite acesso à câmera, tira uma foto e confirma. A tarefa passa a **Concluída**, com os pontos no painel do responsável e imagem de comprovação no histórico.
9. Em **Metas**, o responsável pode criar metas por adolescente; elas aparecem na tela **Minha meta** dele.

## Arquivos

- `index.html`, `cadastro.html` — autenticação de demonstração
- `perfis.html` — escolha do responsável ou adolescente
- `responsavel.html` — tarefas, filhos, metas, histórico e pontuação
- `adolescente.html` — home, tarefas, câmera, metas, Instant e perfil
- `js/familia.js` — vínculo dos IDs aos registros da família
- `css/` e `js/` — estilos e comportamentos

## Compatibilidade com a versão anterior

As contas, perfis de responsável, tarefas e filhos salvos na versão anterior, quando abertos sob a **mesma origem no navegador**, são preservados. Filhos antigos ganham perfil e ID ao acessar novamente o painel responsável.

## Limites desta versão

- É um protótipo local: os dados ficam em `localStorage` no mesmo navegador e origem. Não sincroniza entre celulares, PCs ou contas separadas; para isso é necessário um backend e banco de dados.
- O ID identifica o adolescente **dentro da conta familiar**, não permite vincular desconhecidos/contas externas automaticamente.
- O login não é adequado para produção e não protege dados reais de menores; use contas e fotos fictícias nesta demonstração.
- As fotos da câmera são comprimidas e guardadas localmente, limitadas pelo espaço do navegador. Autorize a câmera em `localhost` ou HTTPS.
- Instant permite publicar mensagens e curtir dentro da família local; não é uma rede social online.
- Recorrências ficam registradas como configuração, mas não geram novas tarefas automaticamente. Um servidor seria necessário para controle seguro de recompensas e tarefas repetidas.


## Novo acesso por tipo de usuário
- Abra `index.html` com Live Server. Escolha **Sou responsável** ou **Sou filho(a)**, e depois faça login/cadastro.
- O responsável recém-cadastrado entra diretamente no painel, cria um filho em **Meus filhos** e compartilha o ID `NX-...` mostrado ali.
- O filho cria sua conta própria usando esse código para vincular-se àquele cadastro familiar; sua conta entra diretamente em `adolescente.html`.
- Contas antigas sem tipo são consideradas contas de responsável. Se houver vários perfis de responsável, aparece a seleção de perfis.
- O vínculo e as tarefas funcionam **no mesmo navegador e origem (localhost/porta)**, pois todos os dados ficam em `localStorage`. Abrir em outro celular não sincroniza nada sem backend.
- Este é um protótipo local. O código de vínculo não substitui autenticação e autorização seguras em servidor.
