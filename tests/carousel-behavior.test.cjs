const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../app/FestivalCarousel.tsx'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../app/festival-carousel.module.css'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2017,
    esModuleInterop: true,
  },
}).outputText;

test('carousel layout has isolated selectors and nonshrinking card bounds', () => {
  assert.match(css, /flex:\s*0 0 var\(--card-size\)/);
  assert.match(css, /min-width:\s*var\(--card-size\)/);
  assert.doesNotMatch(source, /className="carousel-(?:track|slide)"/);
});

const cases = [
  { device: 320, width: 288, size: 288 * .92, gap: 12, shown: 1 },
  { device: 390, width: 358, size: 358 * .88, gap: 16, shown: 1 },
  { device: 768, width: 704, size: (704 - 20) / 2, gap: 20, shown: 2 },
  { device: 1440, width: 1180, size: (1180 - 40) / 3, gap: 20, shown: 3 },
];

function flatten(node) {
  if (!node || typeof node !== 'object') return [];
  const children = node.props?.children;
  return [node, ...(Array.isArray(children) ? children : [children]).flat(Infinity).flatMap(flatten)];
}

// These are DOM geometry fixtures, not a browser layout simulation.
// The tests execute the actual component's effects and navigation handlers.
for (const fixture of cases) {
  test(`carousel navigation at ${fixture.device}px viewport geometry`, () => {
    const effects = [];
    const listeners = {};
    const calls = [];
    let view;
    let reduced = false;
    const slides = Array.from({ length: 12 }, (_, index) => ({
      offsetLeft: Math.round(index * (fixture.size + fixture.gap)),
      offsetWidth: Math.round(fixture.size),
    }));
    const track = {
      children: slides,
      clientWidth: fixture.width,
      scrollWidth: Math.round(12 * fixture.size + 11 * fixture.gap),
      scrollLeft: 0,
      addEventListener: (key, callback) => { listeners[key] = callback; },
      removeEventListener: () => {},
      scrollTo: ({ left, behavior }) => {
        calls.push({ left, behavior });
        track.scrollLeft = left;
        listeners.scroll?.();
      },
    };
    const react = {
      useRef: () => ({ current: track }),
      useId: () => ':test:',
      useState: (initial) => {
        view = initial;
        return [initial, (update) => { view = typeof update === 'function' ? update(view) : update; }];
      },
      useEffect: (callback) => effects.push(callback),
    };
    const jsx = (type, props, key) => ({ type, props, key });
    const exports = {};
    const sandbox = {
      exports,
      require: (name) => {
        if (name === 'react') return react;
        if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
        if (name === './festival-carousel.module.css') {
          return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
        }
        throw new Error(`Unexpected dependency: ${name}`);
      },
      window: {
        addEventListener: () => {},
        removeEventListener: () => {},
        matchMedia: () => ({ matches: reduced }),
      },
      ResizeObserver: class { observe() {} disconnect() {} },
    };
    vm.runInNewContext(compiled, sandbox);
    const tree = exports.default({
      label: 'Спикеры фестиваля',
      children: Array.from({ length: 12 }, (_, index) => `Карточка ${index}`),
    });
    effects.forEach((callback) => callback());
    assert.equal(view.first, 1);
    assert.equal(view.last, fixture.shown);
    assert.equal(view.atStart, true);
    assert.equal(view.atEnd, false);

    const nodes = flatten(tree);
    const buttons = nodes.filter((node) => node.type === 'button');
    const list = nodes.find((node) => node.props?.role === 'list');
    assert.equal(nodes.filter((node) => node.props?.role === 'listitem').length, 12);

    buttons[1].props.onClick();
    assert.equal(track.scrollLeft, slides[1].offsetLeft);
    assert.equal(calls.at(-1).behavior, 'smooth');
    reduced = true;
    buttons[0].props.onClick();
    assert.equal(track.scrollLeft, 0);
    assert.equal(calls.at(-1).behavior, 'auto');

    for (let index = 0; index < 20; index++) buttons[1].props.onClick();
    assert.equal(track.scrollLeft, track.scrollWidth - track.clientWidth);
    assert.equal(view.atEnd, true);
    assert.equal(view.last, 12);

    let prevented = false;
    const focus = {};
    list.props.onKeyDown({
      target: focus, currentTarget: focus, key: 'Home',
      preventDefault: () => { prevented = true; },
    });
    assert.equal(prevented, true);
    assert.equal(track.scrollLeft, 0);
    list.props.onKeyDown({
      target: {}, currentTarget: focus, key: 'ArrowRight',
      preventDefault: () => { throw new Error('Nested control intercepted'); },
    });
    assert.equal(track.scrollLeft, 0);
    list.props.onKeyDown({ target: focus, currentTarget: focus, key: 'End', preventDefault: () => {} });
    assert.equal(view.atEnd, true);
    buttons[0].props.onClick();
    assert.ok(track.scrollLeft < track.scrollWidth - track.clientWidth);
    assert.equal(view.atEnd, false);

    assert.ok(fixture.size >= 260, 'Readable width floor');
    assert.ok(track.scrollWidth > track.clientWidth, 'Horizontal overflow required');
    track.scrollLeft = slides[4].offsetLeft + Math.round(fixture.size / 2);
    listeners.scroll();
    assert.ok(view.first >= 5, 'Counter must not jump back to card 1 halfway through a swipe');
  });
}
