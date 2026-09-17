# Design Styles Lib

Biblioteca navegável de **59 estilos de web design**, cada um apresentado como uma demo funcional no navegador — nunca como uma imagem estática. O projeto é composto por duas páginas autocontidas:

- `index.html` explora o catálogo e abre cada demo.
- `combinador.html` combina de um a três estilos em um sistema de design copiável.

Não há build, servidor, conta, armazenamento ou imagem externa. Abra qualquer arquivo no navegador; o único recurso remoto é o pedido já existente ao Google Fonts.

```sh
open index.html        # macOS
xdg-open index.html    # Linux
```

## Explorar o catálogo

Em desktop, a rota sem fragmento abre a grade de 59 cartelas; `#style=<slug>` abre uma única demo. Em telas menores que 1024px, a página mantém a apresentação contínua e as âncoras legadas (`#<slug>`) seguem disponíveis.

| Recurso | Comportamento |
|---|---|
| Busca | `/` foca a busca e `Esc` limpa. Nome, tags, categorias, facetas visuais e aliases em inglês ignoram acentos. |
| Grupo | Os chips A–H filtram a grade. |
| Categoria | O seletor usa as 20 categorias de projeto e combina por **AND** com busca, grupo e estilo. |
| Estilo | O seletor usa 24 facetas visuais; aliases representam estilos existentes, sem criar demos duplicadas. |
| Contagens | Cada opção mostra a quantidade compatível com os outros filtros ativos. |
| Navegação | Anterior/próximo percorre apenas os resultados filtrados. Voltar/Avançar recupera busca, grupo, categoria, estilo, rolagem e foco. |
| Paleta e receita | Swatches copiam o hex; cada `prompt universal` abre e copia a receita do estilo. |

Os filtros do catálogo são estado local de navegação. O combinador também mantém busca e filtros locais: apenas escolhas de estilos e o tipo de prévia são compartilhados pela URL.

## Combinar sistemas de design

Abra **Combinar estilos** no topo do catálogo ou `combinador.html` diretamente. Selecione até três dos 59 estilos sem repetição:

1. **Base** define estrutura e legibilidade.
2. **Tom e material** ajusta superfície, acento e tipografia.
3. **Detalhe e movimento** acrescenta formas, padrões e microinterações.

O combinador oferece os mesmos filtros de grupo, categoria e estilo do catálogo. Cada perfil público em `window.MixerEngine.profiles` contém `categories` e `visualStyles`, além dos metadados, paleta e tokens curados. `window.MixerEngine.categories` e `window.MixerEngine.visualStyles` expõem os rótulos e aliases da taxonomia.

As escolhas são determinísticas, podem ser vistas como **Painel de componentes** ou **Landing page**, e exportam tokens CSS. A URL registra somente a composição:

```text
combinador.html?base=minimalismo&influence=glassmorphism&influence=bauhaus&preview=components
```

`base` é obrigatório quando há uma combinação; até dois `influence` são opcionais, em ordem. `preview` aceita `components` ou `landing`.

## Os 59 estilos

### A · Fundamentos & Minimalismos

Minimalismo · Flat Design · Estilo Suíço · Wabi-sabi / Japandi · Monocromático / Duotone · **Layout em Grade**

### B · Sistemas de Produto

Bento Grid · Material You · Neumorfismo · Claymorphic · Dados Densos · Isotype / Infográfico · **Layout Horizontal** · **Layout Modular**

### C · Luz, Vidro & Superfície

Glassmorphism · Liquid Glass · Aurora / Mesh Gradient · Skeuomorfismo · Frutiger Aero

### D · Brutalismos & Anti-design

Neobrutalismo · Brutalismo Radical · Anti-design / Web 1.0 · Punk / Fanzine · **Grunge**

### E · Tipografia & Editorial

Editorial de Revista · Jornal / Broadsheet · Luxo / Alta-costura · Terminal / ASCII · Design Cinético · Gótico / Blackletter · **Efeitos de Scroll** · **Tipografia Expressiva** · **Layout Estreito** · **Tipografia Pesada**

### F · Movimentos Históricos

Bauhaus · Art Déco · Art Nouveau · Construtivismo Russo · Memphis 80s · Neo-retrô Anos 70 · Psicodélico Anos 60 · Pop Art / Halftone

### G · Nostalgia Digital

Retrô / Y2K · Vaporwave · Acid / Chrome Líquido · Ciberpunk · HUD Espacial / Sci-Fi · Isométrico / 3D · **Futurista** · **Pixel Art** · **Glitch**

### H · Orgânicos & Artesanais

Maximalismo Tátil · Ilustração Flat Orgânica · Risografia · Corporate Memphis · Cottagecore / Botânico · Solarpunk · Paper Cut / Camadas · **Lúdico**

Os 12 nomes em negrito são as demos adicionadas nesta expansão. Seus slugs são, respectivamente: `grid-layout`, `horizontal-layout`, `modular-layout`, `grunge`, `scroll-effects`, `typographic`, `narrow-layout`, `bold`, `futuristic`, `pixel-art`, `glitch` e `fun`.

## Taxonomia de projeto

Cada demo tem de duas a cinco categorias curadas. Elas descrevem um contexto de uso, não uma inferência em tempo de execução.

| ID | Rótulo | Alias pesquisável |
|---|---|---|
| `portfolio` | Portfólio | portfolio |
| `landing-page` | Landing Page | landing page |
| `digital-product` | Produto digital | digital product |
| `launching-soon` | Em breve | launching soon, coming soon |
| `app` | Aplicativo | app, application |
| `service` | Serviço | service |
| `personal` | Pessoal | personal |
| `event` | Evento | event |
| `informational` | Informativo | informational |
| `music-related` | Música | music related, music |
| `experimental` | Experimental | experimental |
| `restaurant` | Restaurante | restaurant |
| `finance` | Finanças | finance |
| `photography` | Fotografia | photography |
| `startup` | Startup | startup |
| `saas` | SaaS | saas, software as a service |
| `game` | Jogos | game, gaming |
| `physical-product` | Produto físico | physical product |
| `ecommerce` | E-commerce | e-commerce, ecommerce |
| `sport` | Esporte | sport, sports |

## Facetas visuais e aliases

As facetas abaixo são filtros e termos de busca. Elas não são uma segunda lista de rotas. Por exemplo, `illustrative` encontra a demo existente `flat-organica`; `retro-vintage` reúne `y2k`, `neo-70s` e `vaporwave`.

| ID | Rótulo | Alias pesquisável |
|---|---|---|
| `illustrative` | Ilustrativo | illustrative |
| `scroll-effects` | Efeitos de Scroll | scroll effects |
| `minimal` | Minimalista | minimal |
| `flat-design` | Flat Design | flat design |
| `typographic` | Tipográfico | typographic |
| `fun` | Lúdico | fun, playful |
| `horizontal-layout` | Layout Horizontal | horizontal layout |
| `retro-vintage` | Retrô & Vintage | retro vintage, vintage |
| `three-d` | 3D | 3d, three dimensional |
| `gradients` | Gradientes | gradients, gradient |
| `brutalism` | Brutalismo | brutalism |
| `narrow-layout` | Layout Estreito | narrow layout |
| `grunge` | Grunge | grunge |
| `modular-layout` | Layout Modular | modular layout |
| `glassmorphism` | Glassmorphism | glassmorphism |
| `futuristic` | Futurista | futuristic |
| `pixel-art` | Pixel Art | pixel art |
| `glitch` | Glitch | glitch |
| `editorial` | Editorial | editorial |
| `luxury` | Luxo | luxury |
| `bold` | Tipografia Pesada | bold, heavy typography |
| `skeuomorphism` | Skeuomorfismo | skeuomorphism |
| `grid-layout` | Layout em Grade | grid layout |
| `corporate` | Corporativo | corporate |

Os seguintes pedidos não criam duplicatas: Illustrative → `flat-organica`; Minimal → `minimalismo`; Flat Design → `flat-design`; Retro & Vintage → `y2k` / `neo-70s` / `vaporwave`; 3D → `isometrico`; Gradients → `aurora-mesh`; Brutalism → `neobrutalismo` / `brutalismo-radical`; Glassmorphism → `glassmorphism`; Editorial → `editorial`; Luxury → `luxo`; Skeuomorphism → `skeuomorfismo`; Corporate → `corporate-memphis`.

## Estrutura e interações

O DOM do catálogo é a fonte dos cartões. No carregamento, o registro inline de taxonomia associa cada `slug` a `data-categories` e `data-visual-styles`; tanto o catálogo quanto o combinador usam o mesmo conjunto canônico de IDs.

Cada demo possui uma raiz `.frame__body[data-demo="<slug>"]`, CSS isolado e controles locais. O registro `demo(slug, setup)` recebe somente essa raiz; botões usam `data-act`, formulários demonstrativos não são enviados e nenhum controle aciona serviço real. A composição inicial é completa antes de qualquer listener, para que as miniaturas possam ser clonadas com segurança.

Animações contínuas respeitam visibilidade e `prefers-reduced-motion`: `onLive()` conecta loops à seção visível e `onMotion()` reage à preferência do sistema. Todo movimento deve ter uma versão estática íntegra e, quando for contínuo, um controle de pausa.

## Adicionar o 60º estilo

Para acrescentar uma demo sem quebrar o contrato:

1. Crie uma seção com `id` e `data-slug` idênticos, `data-group` entre `A` e `H`, `data-name`, `data-tags`, paleta com `data-hex`, receita copiável e uma raiz `data-demo`.
2. Mantenha CSS e seletores no namespace da demo. Inicialize a interação por `demo(slug, setup)`, prenda listeners à raiz recebida e use `data-act` nos controles.
3. Registre o slug na taxonomia inline com 2–5 `categories` e as `visualStyles` diretas relevantes. Registre o mesmo conjunto no perfil de `MixerEngine`.
4. Inclua paleta, tags, perfil visual e tokens com contraste AA no combinador. Não crie uma rota nova quando o pedido já for um alias de estilo existente.
5. Atualize a contagem, a lista deste README e as expectativas de teste. Verifique unicidade de slug, rota, perfil e cobertura de taxonomia.

Modelo mínimo de seção:

```html
<section class="lab-section" id="meu-estilo"
         data-slug="meu-estilo" data-group="A" data-name="Meu Estilo"
         data-tags="tag, outra tag">
  <div class="lab-head">...</div>
  <div class="frame">
    <div class="frame__body meu-estilo" data-demo="meu-estilo">
      <button type="button" data-act="detalhe" aria-pressed="false">Ver detalhe</button>
    </div>
  </div>
</section>
```

Use `onLive()` e `onMotion()` para timers, `requestAnimationFrame` ou animação contínua. SVG inline e `data:` URI são permitidos; a demo não deve carregar uma imagem externa.

## Verificação

Os testes verificam estrutura, 59 slugs únicos, taxonomia, contagens dinâmicas, aliases, paridade entre catálogo e `MixerEngine`, navegação/histórico, cópia, responsividade, contraste e movimento reduzido.

```sh
node tests/navigation.cjs
node tests/combinador.cjs
```

Por padrão os scripts usam os arquivos locais. Para testar uma cópia servida por HTTP:

```sh
NAV_TEST_URL=http://127.0.0.1:8000/index.html node tests/navigation.cjs
MIXER_TEST_URL=http://127.0.0.1:8000/combinador.html node tests/combinador.cjs
```

`NAV_BASELINE=/caminho/para/index.html` é opcional: quando fornecido, a navegação confirma que os 47 slugs legados continuam disponíveis, ao lado das 12 novas demos.
