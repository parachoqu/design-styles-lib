# Design Styles Lib

Biblioteca navegável de **47 estilos de web design**, cada um com uma demo funcional
renderizada no navegador — não um print. Tudo vive num único arquivo autocontido:
`index.html`, sem build, sem dependência, sem imagem externa.

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
| 41 | **Maximalismo Tátil** ¹ | `#maximalismo-tatil` | grão, formas orgânicas, serif + manuscrita, rotação irregular |
| 42 | **Ilustração Flat Orgânica** ¹ | `#flat-organica` | svg assimétrico, grão, terracota, oliva |
| 43 | **Risografia** | `#risografia` | riso, tinta spot, desalinho de registro, multiply |
| 44 | **Corporate Memphis** | `#corporate-memphis` | alegria, humano blob, membros desproporcionais, flat |
| 45 | **Cottagecore / Botânico** | `#cottagecore` | floral, guirlanda, sálvia, rosa seco |
| 46 | **Solarpunk** | `#solarpunk` | eco-futurismo, solar, verde e dourado, otimista |
| 47 | **Paper Cut / Camadas** | `#paper-cut` | papel recortado, camadas, drop-shadow, profundidade suave |
¹ Os 12 estilos herdados dos dois labs originais (`design-styles-lab.html` e
`design-styles-lab-02.html`), migrados sem reescrita de CSS.

## Como isso é construído

**Um arquivo, três blocos.** `<head>` com um único `<link>` de fontes → `<style>` com
o shell, os 47 estilos e os breakpoints → `<body>` com a barra, o catálogo, as 47
seções e um `<script>` em IIFE.

**Os metadados moram na seção, e em nenhum outro lugar.** O índice, a busca, o filtro
e as contagens de grupo são gerados do DOM no carregamento — não existe uma lista
paralela em JavaScript para dessincronizar. É por isso que adicionar um estilo é só
escrever a seção.

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

Os pseudo-elementos precisam estar na regra: `*` não os alcança, e sem eles o glitch
do Ciberpunk e o pulse do HUD continuam rodando fora da tela. O `requestAnimationFrame`
do demo cinético também só existe enquanto aquela seção está por perto, e
`prefers-reduced-motion: reduce` desliga tudo. A classe `.js` é adicionada pelo próprio
script: sem JavaScript nada é pausado, e o arquivo continua animando.

**Sangramento é intencional.** Vários demos posicionam decoração fora dos limites
(orbs, blobs, anéis, o tipo esticado do Brutalismo Radical). A `.frame` tem
`overflow:hidden` e recorta — é o enquadramento, não um bug.

## Adicionar o 48º estilo

Escreva o CSS num namespace próprio e acrescente uma seção seguindo este contrato.
Nada mais precisa ser tocado:

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
    <div class="frame__body meu">…a demo…</div>
  </div>
</section>
```

Regras que o contrato assume:

- `id` e `data-slug` são iguais — é o que faz o deep-link funcionar
- `data-group` é uma letra de `A` a `H`, e o divisor daquele grupo já existe no documento
- a paleta usa `data-hex` (o clique copia esse valor, não o `style`)
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
