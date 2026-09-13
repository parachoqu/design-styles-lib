# Design Styles Lib

Ferramenta para **descobrir, estudar, comparar e reutilizar** 47 estilos de web design.
Cada estilo tem demo ao vivo, prévia responsiva de verdade, paleta, receita executável e
ficha de direção de arte. Tudo num único `index.html`, sem build, sem dependência de
runtime, abrindo direto do disco.

```
open index.html        # macOS
xdg-open index.html    # Linux
```

## Como navegar

A biblioteca tem três visões, todas no mesmo arquivo, endereçáveis pelo hash:

| Visão | Endereço | O que faz |
|---|---|---|
| **Catálogo** | `index.html` ou `#/` | Grade de 47 cartelas com prévia visual, trilho de filtros à esquerda |
| **Estilo** | `#vaporwave` | Demo isolada + prévia responsiva + abas de ficha, paleta e receita |
| **Comparação** | `#comparar=bauhaus,vaporwave` | 2 ou 3 estilos lado a lado + tabela de critérios equivalentes |

Os links antigos continuam valendo: `#minimalismo`, `#glassmorphism` e os outros 45 abrem
direto a visão do estilo.

**Voltar preserva o contexto.** Ao sair de um estilo, o catálogo volta com a busca, os
filtros, a posição de rolagem e o foco na cartela de origem. Voltar e Avançar do navegador
percorrem só a navegação intencional — rolar não cria entrada de histórico. Editar o hash
na barra de endereço também funciona.

**Dentro de um estilo**, as setas de anterior/próximo percorrem o **conjunto de resultados
filtrado**, não a lista inteira: se você filtrou por "Movimentos Históricos", navega entre
os oito.

### Atalhos

| Tecla | Ação |
|---|---|
| `/` | Foca a busca |
| `Esc` | Limpa a busca, fecha o painel de filtros ou volta ao catálogo |
| `Tab` | O primeiro alvo é "Pular para o conteúdo", que salta o trilho de filtros |
| `←` `→` | Alterna entre as abas de ficha, paleta e receita |

## Descoberta

**Busca** por nome, tag, grupo ou característica, ignorando acento — *retro* encontra
**Retrô/Y2K** e **Neo-retrô Anos 70**.

**Dois eixos de filtro, com papéis distintos:**

- **Grupo** (A–H) é o eixo principal, seleção única. É a taxonomia da coleção.
- **Características** são complementares e combináveis, em quatro dimensões verificáveis
  na própria demo: *composição*, *superfície*, *tipografia* e *movimento*.

Dentro de uma dimensão os valores somam (OU); entre dimensões restringem (E). Os filtros
ativos aparecem como pílulas removíveis com a contagem de resultados ao lado. Quando a
combinação não tem interseção, o estado vazio diz **quais** filtros derrubaram o resultado e
oferece remover cada um.

**Favoritos** ficam no `localStorage` e sobrevivem ao recarregamento. Toda leitura e escrita
é protegida: navegador com armazenamento bloqueado ou valor corrompido não quebram a
interface, apenas perdem a persistência.

## As três coisas que cada estilo entrega

### 1. Prévia responsiva real

Os seletores **Desktop (1280px) / Tablet (834px) / Mobile (390px)** mudam o layout de
verdade. A demo roda dentro de um `<iframe srcdoc>`, então tem viewport próprio e as
media queries **dela** disparam — o Flat Design passa de 4 para 2 e depois 1 coluna porque
bate nos breakpoints dele, não porque a imagem encolheu.

O iframe também resolve isolamento: CSS não vaza entre estilos, IDs não colidem entre
instâncias (`kinRoot`, `psyg1`), eventos não interferem, e fechar a visão descarta
listeners e `requestAnimationFrame` junto com o elemento.

### 2. Receita executável

A receita **não é transcrita à mão — é gerada** do mesmo CSS que acabou de renderizar a
prévia. Vem em blocos separados (Fontes, HTML, CSS, JavaScript), cada um com cópia própria,
mais um botão para o arquivo `.html` completo. O exemplo inclui doctype, `<link>` só das
famílias que aquele estilo usa, os `@keyframes` que ele referencia, o CSS da fatia, o markup
e o JS quando existe.

> Na versão anterior as receitas eram trechos escritos à mão e **não executavam**: 15 das 47
> declaravam variáveis CSS fora de qualquer seletor, 5 usavam `animation:` sem incluir os
> `@keyframes`, e 7 tinham SVG abreviado com reticências. Gerar da fonte elimina a classe
> inteira desses erros.

### 3. Ficha de direção de arte

Uma ficha por estilo, com princípios, composição, hierarquia tipográfica, espaçamento,
papéis das cores, superfície e profundidade, movimento, adaptação mobile e aplicações
adequadas. Um campo final separa **o que é escolha daquele exemplo** do **que é regra geral
do estilo** — para não inventar proibição nem afirmação histórica.

O botão **Copiar ficha como contexto de IA** exporta tudo em texto estruturado, com tokens
concretos (hex, famílias, espessuras observadas), regras acionáveis e o exemplo mínimo
funcional embutido. É material para colar num prompt de Claude ou Codex, não uma lista de
adjetivos.

## Acessibilidade e movimento

- Todo controle tem nome acessível. Os botões de cor anunciam ação e valor
  (`Copiar cor #2b1055`); nas cartelas as amostras são decorativas (`aria-hidden`).
- Foco visível em todo alvo, `aria-pressed` nos filtros e alternadores, abas com
  `role="tablist"` e navegação por seta, e uma região `aria-live` que anuncia cópias,
  contagem de resultados e troca de visão.
- **Controle global de pausa** no topo. `prefers-reduced-motion` é respeitado desde o
  primeiro pintar e acompanhado em tempo real por `matchMedia`; a preferência do sistema
  **tem precedência** sobre a reprodução automática, e nesse caso o botão fica desabilitado
  e explica o motivo.
- A pausa cobre animação CSS, **pseudo-elementos** (que `*` sozinho não alcança), rAF e
  rolagem suave, e é propagada aos iframes por `postMessage`.
- As miniaturas do catálogo nunca animam.

Onde a limitação faz parte do exemplo, a ficha declara: o Anti-design / Web 1.0 pisca e
reprova em contraste porque está citando 1998, e a ficha diz isso e recomenda corrigir os
dois pontos em uso real.

## Desempenho

- **A interface usa a pilha de fontes do sistema** e pinta sem depender da rede. As 19
  famílias servem às demos e são carregadas sem bloquear a renderização; com o Google Fonts
  indisponível a biblioteca continua utilizável nos fallbacks.
- As miniaturas são clones reais da demo, escalados, congelados (`animation:none`) e
  inertes, montados sob demanda. Só as próximas da janela existem no DOM.
- O observador de montagem usa `rootMargin` em **pixels derivados da altura da janela**,
  recalculado no `resize`. Porcentagem ali é ambígua: o texto da spec do W3C resolve contra
  a *largura*, os navegadores resolvem top/bottom contra a *altura*
  ([w3c/IntersectionObserver#391](https://github.com/w3c/IntersectionObserver/issues/391)).
- Não há observador de seção ativa por rolagem — com catálogo e visão individual separados,
  ele deixou de ser necessário.
- Abrir e fechar visões não acumula: iframes, listeners e rAF são descartados no fechamento.

## Estrutura do arquivo

```
<head>
  <style>                    interface (.dsl-*, prefixada, não encosta nas demos)
  <style data-css="_base">   ambiente comum das demos + keyframes compartilhados
  <style data-css="{slug}">  × 47 — a fatia de CSS de cada estilo
<body>
  barra, trilho de filtros, <main> (as três visões renderizam aqui)
  <script type="application/json" id="dsl-fichas">    47 fichas
  <script type="application/json" id="dsl-facetas">   vocabulário das características
  <template data-style="{slug}"> × 47                 markup da demo + metadados
  <script>                                            a aplicação inteira
```

A fatia `data-css="{slug}"` é **fonte única** de três coisas: a miniatura, o iframe da
prévia e a receita copiável. É isso que garante que o código copiado executa — ele é o mesmo
que renderizou na tela.

### Adicionar o 48º estilo

Acrescente a fatia de CSS e o template. Nada mais precisa ser tocado: catálogo, busca,
filtros, contagens, comparação e receita são todos derivados do DOM.

```html
<style data-css="meu-estilo">
  .meu{ /* só regras com o namespace do estilo */ }
  @media(max-width:760px){ .meu__grid{grid-template-columns:1fr} }
</style>

<template data-style="meu-estilo"
          data-name="Meu Estilo" data-group="A"
          data-root="meu" data-url="exemplo.com"
          data-tags="tag, outra tag"
          data-desc="Uma frase sobre o que define o estilo."
          data-palette="#112233,#445566"
          data-facets="composicao:grade superficie:plana tipografia:sans-neutra movimento:estatico"
          data-fonts="Inter" data-fontlink="https://fonts.googleapis.com/css2?family=Inter&display=swap">
  <nav class="meu__nav">…</nav>
</template>
```

E acrescente a ficha correspondente em `#dsl-fichas`, com as mesmas chaves das outras.

Regras que o contrato assume:

- `data-root` é a classe raiz da demo; o markup do template entra dentro de
  `<div class="frame__body {data-root}">`
- `data-facets` usa o vocabulário declarado em `#dsl-facetas` — valor fora dele não aparece
  em nenhum filtro
- todo namespace é exclusivo do estilo. Se um `@keyframes` for usado por mais de um estilo,
  ele pertence a `data-css="_base"` — senão a demo funciona na biblioteca e quebra na
  receita copiada
- a demo não carrega imagem: só CSS, SVG inline e `data:` URI

## Verificação

Reproduza no navegador, com o arquivo aberto do disco (`file://`). Cada item abaixo foi
verificado nesta entrega.

**Integridade** — 47 cartelas no catálogo; todo template com a fatia de CSS correspondente;
47 fichas; toda faceta dentro do vocabulário.

**Busca e filtros** — digite `retro`: devem aparecer Retrô/Y2K e Neo-retrô. Selecione grupo
F e a característica *Monoespaçada*: o resultado fica vazio e o aviso oferece remover cada
filtro; remover o grupo traz 3 resultados de volta.

**Favoritos** — favorite dois estilos e recarregue: continuam marcados. Em seguida rode
`localStorage.setItem('dsl.fav','{quebrado')` no console e recarregue: a biblioteca abre
normalmente.

**Navegação** — abra `index.html#glassmorphism` direto; use anterior/próximo; use Voltar e
Avançar do navegador; volte ao catálogo e confira que busca, filtros, rolagem e foco
voltaram. Clique num link cenográfico dentro de uma demo: a rota da biblioteca não muda.

**Prévia responsiva** — em um estilo com grade (Flat Design), alterne Desktop/Tablet/Mobile
e confirme que o número de colunas muda: 4 → 2 → 1.

**Comparação** — selecione três estilos; o quarto é recusado com aviso de limite; remova um;
confira a tabela de critérios.

**Acessibilidade** — percorra a página só com Tab: o primeiro alvo é "Pular para o
conteúdo", e o percurso completo cobre barra, busca, filtros e cartelas. Contraste medido
sobre o fundo da interface: texto principal 16,1:1, secundário 8,1:1, terciário 5,1:1,
acento 8,2:1 — todos acima de 4,5:1.

**Movimento** — pause pelo botão do topo e confirme que a demo aberta congela, inclusive
dentro do iframe; ative movimento reduzido no sistema e recarregue: nada anima e o botão
fica desabilitado.

**Robustez** — sem erro de console; sem vazamento horizontal em 1440, 834 e 390px, com
controles acima de 24px em todos; com o Google Fonts bloqueado a biblioteca segue
utilizável.

### O que não foi validado

A execução isolada das 47 receitas geradas (abrir cada `.html` exportado num arquivo
separado e comparar com a prévia) **não foi executada** nesta entrega. O que sustenta a
receita é que ela usa exatamente o mesmo caminho de código do iframe da prévia, que está
verificado — mas isso é inferência, não medição. É o primeiro teste a rodar numa próxima
passagem.
