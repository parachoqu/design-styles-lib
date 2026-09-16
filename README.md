# Design Styles Lib

Biblioteca navegável de **47 estilos de web design**, cada um com uma demo funcional
renderizada no navegador — não um print. Duas páginas estáticas autocontidas:
`index.html` para explorar a biblioteca e `combinador.html` para criar sistemas de
design a partir dela, sem build, sem dependência de aplicação e sem imagem externa.

Abra o arquivo no navegador. É só isso.

```
open index.html        # macOS
xdg-open index.html    # Linux
```

## O que dá para fazer

| Recurso | Como |
|---|---|
| Índice em grade | Em telas a partir de 1024px, a entrada sem fragmento mostra só o catálogo; uma cartela abre a demo individual |
| Busca | `/` foca o campo, `Esc` limpa. Ignora acento: *retro* acha **Retrô/Y2K** |
| Filtro por grupo | Chips A–H na barra do topo, combináveis com a busca |
| Estilo individual | `index.html#style=vaporwave` mostra a demo e, abaixo, resumo, tags, paleta e receita |
| Anterior / próximo | Percorrem os resultados filtrados; os controles ficam desabilitados nas extremidades |
| Voltar ao catálogo | Restaura busca, grupo, rolagem e foco na cartela de origem |
| Abrir em nova aba / compartilhar | As cartelas têm links próprios; um link aberto diretamente percorre a sequência completa dos 47 estilos |
| Âncoras antigas e telas menores | `index.html#vaporwave` mantém o documento contínuo; abaixo de 1024px, `#style=vaporwave` vira `#vaporwave` |
| Copiar cor | Clique num swatch da paleta e o hex vai para a área de transferência |
| Copiar receita | `receita css` abre o essencial do estilo, com botão de copiar |
| Explorar as demos | Seletores, filtros e controles alteram conteúdo e estado localmente; não acionam serviços reais |
| Combinar estilos | O link no topo abre o combinador, com até três estilos e tokens CSS copiáveis |

## Combinar sistemas de design

Abra **Combinar estilos** na barra do catálogo ou abra `combinador.html` diretamente.
Busque por nome ou tag, filtre pelos grupos A–H e selecione de um a três dos 47
estilos, sem repetições. A primeira escolha é a **Base**; a segunda influencia
**Tom e material**; a terceira acrescenta **Detalhe e movimento**. Ao remover a
base, a próxima escolha assume esse papel.

O resultado muda imediatamente e pode ser visto como **Painel de componentes** ou
**Landing page**. As duas prévias usam o mesmo sistema, e a origem das escolhas
visuais aparece junto do resultado. **Copiar tokens** exporta as variáveis CSS de
cor, tipografia, espaçamento, forma, elevação e movimento.

A composição é local e determinística: cada estilo tem um perfil curado, e os
papéis definem como suas características entram no sistema. Não há geração por IA,
contas, histórico salvo, armazenamento ou servidor. O combinador não tenta mesclar
o CSS completo das demos.

**Compartilhar** usa o compartilhamento nativo quando disponível ou copia o link.
As escolhas e a prévia ficam na URL:

```text
combinador.html?base=minimalismo&influence=glassmorphism&influence=bauhaus&preview=components
```

`preview` aceita `components` ou `landing`; os parâmetros `influence` são opcionais
e seguem a ordem dos papéis. Abrir o link reconstrói a combinação. As duas páginas
funcionam em `file://`, mas um link de arquivo só é útil em outro ambiente com o
mesmo caminho local. Para compartilhar com outras pessoas, use a URL de uma cópia
servida por HTTP ou HTTPS.

## Os 47 estilos


### A · Fundamentos & Minimalismos

| # | Estilo | Âncora | Tags |
|---|--------|--------|------|
| 01 | **Minimalismo** ¹ | `#minimalismo` | whitespace, hierarquia, sans-serif light, monocromático |
| 02 | **Flat Design** ¹ | `#flat-design` | zero skeuomorfismo, cores sólidas, ícones geométricos, blocos de cor |
| 03 | **Estilo Suíço** | `#estilo-suico` | grid modular, helvetica, assimetria, vermelho |
| 04 | **Wabi-sabi / Japandi** | `#wabi-sabi` | imperfeição, vazio, hairline, terra |
| 05 | **Monocromático / Duotone** | `#duotone` | duas cores, mix-blend-mode, screen, multiply |

### B · Sistemas de Produto

| # | Estilo | Âncora | Tags |
|---|--------|--------|------|
| 06 | **Bento Grid** ¹ | `#bento-grid` | módulos span, radius 22px, gap constante, dashboard |
| 07 | **Material You** | `#material-you` | material 3, superfície tonal, elevação, fab |
| 08 | **Neumorfismo** | `#neumorfismo` | soft ui, extrusão, dupla sombra, monocromático |
| 09 | **Claymorphic** ¹ | `#claymorphic` | argila, dupla sombra inset, radius extremo, pastel |
| 10 | **Dados Densos** | `#dados-densos` | terminal financeiro, bloomberg, tabular nums, densidade |
| 11 | **Isotype / Infográfico** | `#isotype` | pictograma, neurath, quantidade por repetição, infográfico |

### C · Luz, Vidro & Superfície

| # | Estilo | Âncora | Tags |
|---|--------|--------|------|
| 12 | **Glassmorphism** ¹ | `#glassmorphism` | backdrop-filter, vidro fosco, orbs, blur |
| 13 | **Liquid Glass** | `#liquid-glass` | vidro líquido, refração, lente, especular |
| 14 | **Aurora / Mesh Gradient** | `#aurora-mesh` | mesh gradient, saas escuro, borda em gradiente, glow |
| 15 | **Skeuomorfismo** | `#skeuomorfismo` | textura, linho, couro, bisel |
| 16 | **Frutiger Aero** | `#frutiger-aero` | aero, vista, glossy, aqua |

### D · Brutalismos & Anti-design

| # | Estilo | Âncora | Tags |
|---|--------|--------|------|
| 17 | **Neobrutalismo** ¹ | `#neobrutalismo` | hard shadow, borda 4px, cores saturadas, grid exposto |
| 18 | **Brutalismo Radical** ¹ | `#brutalismo-radical` | tipo esticado, assimetria, link azul default, sem grid confortável |
| 19 | **Anti-design / Web 1.0** | `#anti-design` | geocities, tabela, comic sans, marquee |
| 20 | **Punk / Fanzine** | `#punk-fanzine` | xerox, ransom note, colagem, fita crepe |

### E · Tipografia & Editorial

| # | Estilo | Âncora | Tags |
|---|--------|--------|------|
| 21 | **Editorial de Revista** | `#editorial` | capitular, multi-coluna, serif display, olho |
| 22 | **Jornal / Broadsheet** | `#jornal` | manchete condensada, papel jornal, colunas justificadas, olho |
| 23 | **Luxo / Alta-costura** | `#luxo` | letterspacing, serif fina, dourado, preto |
| 24 | **Terminal / ASCII** | `#terminal-ascii` | monoespaçado, fósforo verde, cursor, box drawing |
| 25 | **Design Cinético** ¹ | `#cinetico` | split por caractere, repulsão do ponteiro, scroll velocity, parallax |
| 26 | **Gótico / Blackletter** | `#blackletter` | blackletter, fraktur, capitular rubricada, pergaminho |

### F · Movimentos Históricos

| # | Estilo | Âncora | Tags |
|---|--------|--------|------|
| 27 | **Bauhaus** | `#bauhaus` | primárias, círculo quadrado triângulo, geométrico, weimar |
| 28 | **Art Déco** | `#art-deco` | dourado, simetria, leque, chevron |
| 29 | **Art Nouveau** | `#art-nouveau` | curva whiplash, floral, orgânico, mucha |
| 30 | **Construtivismo Russo** | `#construtivismo` | diagonal, vermelho e preto, rodchenko, cartaz |
| 31 | **Memphis 80s** | `#memphis` | sottsass, confete, squiggle, terrazzo |
| 32 | **Neo-retrô Anos 70** | `#neo-70s` | mostarda, ferrugem, abacate, arco |
| 33 | **Psicodélico Anos 60** | `#psicodelico` | arco-íris, textPath, tipo ondulado, swirl |
| 34 | **Pop Art / Halftone** | `#pop-art` | ben-day, halftone, quadrinho, balão de fala |

### G · Nostalgia Digital

| # | Estilo | Âncora | Tags |
|---|--------|--------|------|
| 35 | **Retrô / Y2K** ¹ | `#y2k` | scanline, crt, grid em perspectiva, pixel font |
| 36 | **Vaporwave** | `#vaporwave` | pôr do sol, grid, letterspacing, pastel neon |
| 37 | **Acid / Chrome Líquido** | `#acid-chrome` | chrome, metálico, conic-gradient, ácido |
| 38 | **Ciberpunk** ¹ | `#ciberpunk` | neon, glitch, clip-path chanfro, hud |
| 39 | **HUD Espacial / Sci-Fi** | `#hud-espacial` | hud, cantoneira, anel orbital, spatial ui |
| 40 | **Isométrico / 3D** | `#isometrico` | isométrico, rotateX rotateZ, preserve-3d, cubo |

### H · Orgânicos & Artesanais

| # | Estilo | Âncora | Tags |
|---|--------|--------|------|
| 41 | **Maximalismo Tátil** ¹ | `#maximalismo-tatil` | papel de algodão, argila fosca, pigmento natural, tecido |
| 42 | **Ilustração Flat Orgânica** ¹ | `#flat-organica` | svg autoral, silhueta orgânica, cor chapada, canteiros |
| 43 | **Risografia** | `#risografia` | riso, tinta spot, separações, sobreimpressão |
| 44 | **Corporate Memphis** | `#corporate-memphis` | alegria, proporções expressivas, figuras geométricas, flat |
| 45 | **Cottagecore / Botânico** | `#cottagecore` | botânico, sazonalidade, horta doméstica, papel |
| 46 | **Solarpunk** | `#solarpunk` | eco-futurismo, cooperativa, energia solar, ciclo da água |
| 47 | **Paper Cut / Camadas** | `#paper-cut` | papel recortado, camadas opacas, luz direcional, recorte interno |
¹ Os 12 estilos originários dos dois labs anteriores (`design-styles-lab.html` e
`design-styles-lab-02.html`), aprofundados nesta biblioteca.

## Como isso é construído

**Catálogo autocontido, três blocos.** `index.html` tem `<head>` com um único `<link>` de fontes → `<style>` com
o shell, os 47 estilos e os breakpoints → `<body>` com a barra, o catálogo, as 47
seções e um `<script>` em IIFE.

**O DOM é a fonte de dados do catálogo.** O índice, a busca, o filtro e as contagens
de grupo são gerados das seções no carregamento, sem uma lista paralela no script
do catálogo.

**Interações locais, uma raiz por demo.** A `.frame__body` original usa
`data-demo="<slug>"`, e seus controles funcionais usam `data-act`. O registro
`demo(slug, setup)` recebe essa raiz e inicializa seletores, listeners e estados
somente nela, depois da montagem do catálogo. Os botões com `data-act` preservam
seu próprio feedback; formulários demonstrativos não são enviados. As interações
são reversíveis e locais, sem serviços reais ou persistência.

**As miniaturas guardam o estado inicial.** Cada demo já contém uma composição
completa no HTML/CSS antes de receber listeners. O catálogo clona esse conteúdo
sem inicializar outra demo. `localizeIds(clone, i)` renomeia os IDs internos com
um sufixo por cartão e reescreve suas referências, incluindo `url(#…)`, `href`,
`for` e atributos ARIA. Assim, gradientes, máscaras, recortes e rótulos continuam
ligados aos elementos da própria miniatura.

**O combinador tem seu próprio adaptador de perfis.** `combinador.html` reúne o
shell, as prévias, o motor de composição e um registro explícito dos 47 perfis,
mantendo a abertura por `file://` sem buscar outro arquivo. Os metadados desse
registro correspondem às seções de `index.html`; os atributos visuais são curados
para cada papel. Os testes do combinador verificam a correspondência de metadados
entre as duas páginas.

**Duas formas de navegar, as mesmas seções.** A partir de 1024px, o endereço sem
fragmento abre o catálogo e `#style=<slug>` mostra uma única seção, com a demo acima
dos seus metadados. Anterior e próximo usam a lista de resultados que abriu o estilo;
um acesso direto ou em nova aba usa os 47 estilos. A navegação intencional usa
`history.pushState`, e `popstate` e `hashchange` restauram a visão correspondente.
Voltar ao catálogo recupera busca, grupo, rolagem e foco. Rolar não cria entradas no
histórico.

Os endereços antigos `#<slug>` continuam abrindo o documento contínuo. Abaixo de
1024px, essa também é a apresentação padrão, e uma rota `#style=<slug>` é convertida
para a âncora antiga. A navegação reaproveita as demos e os metadados existentes no
DOM, sem duplicar as seções ou criar uma lista paralela de estilos.

**Animação só roda na seção visível.** Com 47 demos animando ao mesmo tempo o scroll
travaria. Um `IntersectionObserver` marca `.is-live` no que está perto da viewport, e
o CSS pausa o resto:

```css
html.js .lab-section:not(.is-live) *,
html.js .lab-section:not(.is-live) *::before,
html.js .lab-section:not(.is-live) *::after{animation-play-state:paused!important}
```

Os pseudo-elementos precisam estar na regra: `*` não os alcança. O registro
`onLive(slug, callback)` conecta timers e loops ao estado de visibilidade da demo;
o `requestAnimationFrame` cinético também respeita esse estado. Voltar ao catálogo
suspende as demos. `onMotion(callback)` recebe a preferência de movimento reduzido
na inicialização e quando ela muda durante a sessão. Movimentos contínuos têm
controle local de pausa, e a composição estática continua completa. A classe `.js`
é adicionada pelo script; o gate por visibilidade depende dele, enquanto a regra
CSS de movimento reduzido também atua sem JavaScript.

**Sangramento é intencional.** Vários demos posicionam decoração fora dos limites
(orbs, blobs, anéis, o tipo esticado do Brutalismo Radical). A `.frame` tem
`overflow:hidden` e recorta — é o enquadramento, não um bug.

## Adicionar o 48º estilo

Escreva o CSS num namespace próprio e acrescente uma seção seguindo este contrato.
O catálogo a reconhece automaticamente. Para também disponibilizar o estilo no
combinador, acrescente seu perfil curado ao registro de `combinador.html` com os
mesmos slug, nome, grupo e tags, e atualize as contagens documentadas e verificadas
pelos testes:

```html
<section class="lab-section" id="meu-estilo"
         data-slug="meu-estilo" data-group="A" data-name="Meu Estilo"
         data-tags="tag, outra tag, mais uma">
  <div class="lab-head">
    <div class="lab-head__l">
      <span class="lab-head__id">48 · FUNDAMENTOS</span>
      <h2>Meu Estilo</h2>
      <div class="lab-tags"><span class="lab-tag">Tag</span></div>
      <div class="lab-palette">
        <button class="sw" data-hex="#112233" style="background:#112233"></button>
      </div>
    </div>
    <div class="lab-head__r">
      <p>O que define o estilo, e qual é o truque técnico dele.</p>
      <details class="recipe"><summary>receita css</summary><div class="recipe__body">
        <button class="recipe__copy">copiar</button>
        <pre class="recipe__code">/* o mínimo que reproduz o estilo */</pre>
      </div></details>
    </div>
  </div>
  <div class="frame">
    <div class="frame__chrome">
      <i class="dot dot--r"></i><i class="dot dot--y"></i><i class="dot dot--g"></i>
      <div class="frame__url">meusite.com</div>
    </div>
    <div class="frame__body meu" data-demo="meu-estilo">
      <button type="button" data-act="meu-detalhe" aria-pressed="false">Ver detalhe</button>
      <p data-meu-status role="status">Visão geral da peça.</p>
    </div>
  </div>
</section>
```

No registro existente, antes da inicialização das demos:

```js
demo('meu-estilo', function(root){
  var button = root.querySelector('[data-act="meu-detalhe"]');
  var status = root.querySelector('[data-meu-status]');
  on(button, 'click', function(){
    var selected = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(selected));
    setText(status, selected ? 'Detalhe do material da peça.' : 'Visão geral da peça.');
  });
});
```

Regras que o contrato assume:

- `id` e `data-slug` são iguais — é o que faz o deep-link funcionar
- `data-group` é uma letra de `A` a `H`, e o divisor daquele grupo já existe no documento
- a paleta usa `data-hex` (o clique copia esse valor, não o `style`)
- seletores e listeners de interação ficam presos à raiz recebida por `demo()`;
  use `data-act` nos controles e mantenha o estado inicial completo no HTML
- timers e loops novos usam `onLive()` e `onMotion()`; movimento contínuo oferece
  pausa, e os estilos visuais usam classes próprias que também funcionam nos clones
- se o demo tiver navegação em `<ul>`, acrescente o seletor à lista que some no
  `@media(max-width:760px)` — senão ela estoura a moldura no celular
- o demo não carrega imagem: só CSS, SVG inline e `data:` URI

## Fontes

Dezenove famílias num único pedido ao Google Fonts, com `display=swap`. É o único
recurso externo do arquivo. O Anti-design / Web 1.0 pede
`"Comic Sans MS", "Comic Neue", cursive` de propósito, para pegar a fonte do sistema
antes de baixar qualquer coisa.

## Verificação

As verificações da biblioteca abrangem duas camadas:

- **estrutural** — árvore de tags fechada, chaves do `<style>` balanceadas, 47 seções,
  `data-slug` únicos e iguais ao `id`, contrato completo em toda seção, nenhum recurso
  externo fora do Google Fonts
- **runtime**, em Chromium — zero erro de script; catálogo com 47 cartelas; busca sem
  acento; filtro por grupo; copiar hex e receita pela área de transferência; deep-link;
  nenhuma animação rodando fora da tela; e nenhum conteúdo em fluxo vazando da moldura
  em 1440px, 768px e 390px

Para executar os testes de navegação, use Node.js e uma instalação de Playwright com
Chromium disponível no ambiente de teste. Essas ferramentas não são dependências
para abrir a biblioteca no navegador:

```sh
node tests/navigation.cjs
```

Por padrão, o script abre o `index.html` local. Para testar uma versão servida por
HTTP, informe o endereço em `NAV_TEST_URL`:

```sh
NAV_TEST_URL=http://127.0.0.1:8000/index.html node tests/navigation.cjs
```

A suíte dedicada do combinador verifica os 47 perfis, a correspondência com os
metadados do catálogo, seleções de um a três estilos, remoção e promoção da base,
restauração pela URL, prévias, cópia, compartilhamento e interação responsiva:

```sh
node tests/combinador.cjs
```

Por padrão, ela abre `combinador.html` por `file://`. Para uma versão servida:

```sh
MIXER_TEST_URL=http://127.0.0.1:8000/combinador.html node tests/combinador.cjs
```

`NAV_BASELINE=/caminho/para/index.html` é opcional e permite comparar as 47 seções e
o layout mobile com uma cópia anterior. Se o `node` padrão falhar neste ambiente,
use `/home/https/.config/nvm/versions/node/v24.14.0/bin/node` no lugar de `node`.

Confira também no navegador: catálogo sem fragmento em 1440px; abertura de uma
cartela; anterior/próximo dentro de um grupo filtrado e nos limites da lista; retorno
com busca, grupo, rolagem e foco restaurados; Voltar/Avançar; edição manual do hash;
link de estilo em nova aba; âncora antiga; e apresentação contínua em 768px e 390px.
Na visão individual, confirme que a demo vem antes do resumo, tags, paleta e receita,
e que copiar cor/receita e as interações originais continuam funcionando.

Os comandos e cenários acima descrevem como verificar a navegação; não constituem
um registro de aprovação dos testes desta revisão.
