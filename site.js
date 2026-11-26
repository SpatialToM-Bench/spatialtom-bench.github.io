(() => {
  const items = document.querySelectorAll('.resource-item');
  let activeItem = null;
  let pinned = false;

  function close() {
    activeItem?.classList.remove('is-open');
    activeItem = null;
    pinned = false;
  }

  function show(item, persist = false) {
    if (activeItem !== item) close();
    activeItem = item;
    pinned = pinned || persist;
    item.classList.add('is-open');
  }

  items.forEach(item => {
    const button = item.querySelector('button');
    item.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'touch') show(item);
    });
    item.addEventListener('pointerleave', () => {
      if (activeItem === item && !pinned && document.activeElement !== button) close();
    });
    button.addEventListener('focus', () => show(item));
    button.addEventListener('blur', () => {
      if (activeItem === item) close();
    });
    button.addEventListener('click', () => {
      if (activeItem === item && pinned) close();
      else show(item, true);
    });
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.resource-item')) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
  });
})();

(() => {
  const tablist = document.querySelector('.example-tabs');
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll('.example-tab')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  function select(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  }
  tablist.hidden = false;
  tablist.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); select(next, true); }
    });
  });
  select(0);

  // Display each task through a viewport onto the original, unmodified paper figure.
  const examples = [
    [
      ['Viewpoint Inference', [0, 130, 1184, 880]],
      ['Reference Frame Transformation', [1216, 130, 1184, 880]],
      ['Visibility Judgment', [0, 1032, 1184, 880]],
      ['Occlusion Reasoning', [1216, 1032, 1184, 880]],
      ['Visibility Tracking', [0, 1934, 1184, 880]],
      ['Viewpoint Attribution', [1216, 1934, 1184, 880]]
    ],
    [
      ['Knowledge Attribution', [0, 130, 2400, 525]],
      ['Action-Based Inference', [0, 673, 2400, 525]],
      ['Belief Revision', [0, 1216, 2400, 525]],
      ['Spatial Correspondence', [0, 1759, 2400, 525]],
      ['Reference Resolution', [0, 2302, 2400, 526]]
    ],
    [
      ['Route Guidance', [0, 130, 2400, 875]],
      ['Information Selection', [0, 1023, 2400, 875]],
      ['Multi-Agent Collaboration', [0, 1915, 2400, 913]]
    ]
  ];
  const dialog = document.querySelector('.image-dialog');
  const wrap = dialog?.querySelector('.dialog-image-wrap');
  const zoom = dialog?.querySelector('.zoom-toggle');
  const canEnlarge = dialog && typeof dialog.showModal === 'function';
  let opener;
  function openFigure(figure, title, trigger, width) {
    if (!canEnlarge) return;
    opener = trigger;
    wrap.replaceChildren(figure);
    wrap.style.setProperty('--figure-width', `${width}px`);
    wrap.classList.remove('is-zoomed');
    zoom.textContent = 'Actual size';
    dialog.querySelector('#image-dialog-title').textContent = title;
    dialog.showModal();
    wrap.scrollTo(0, 0);
    dialog.querySelector('.dialog-close').focus();
  }
  panels.forEach((panel, level) => {
    const figure = panel.querySelector('figure');
    const original = figure.querySelector('img');
    const browser = document.createElement('div');
    browser.className = 'task-browser';
    browser.innerHTML = `<div class="task-picker" role="group" aria-label="Choose an L${level} task"></div>
      <div class="task-stage"><div class="task-stage-head"><span class="task-position"></span><h4 class="task-stage-title" aria-live="polite"></h4><button class="task-enlarge" type="button">Enlarge ↗</button></div><div class="task-art${level === 0 ? ' is-l0' : ''}"></div>${level ? '<p class="task-mobile-note">Swipe the figure to see all observations.</p>' : ''}</div>`;
    const picker = browser.querySelector('.task-picker');
    const art = browser.querySelector('.task-art');
    const enlarge = browser.querySelector('.task-enlarge');
    const buttons = [];
    let current = 0;
    function showTask(index) {
      current = index;
      const [name, rect] = examples[level][index];
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      browser.querySelector('.task-position').textContent = `${String(index + 1).padStart(2, '0')} / ${String(examples[level].length).padStart(2, '0')}`;
      browser.querySelector('.task-stage-title').textContent = name;
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', rect.join(' '));
      svg.setAttribute('width', rect[2]);
      svg.setAttribute('height', rect[3]);
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', `${name}: visual evidence, question, and annotated answer from the paper.`);
      const image = document.createElementNS(ns, 'image');
      image.setAttribute('href', original.getAttribute('src'));
      image.setAttribute('width', '2400');
      image.setAttribute('height', '2842');
      svg.append(image);
      art.replaceChildren(svg);
      art.scrollLeft = 0;
    }
    examples[level].forEach(([name], index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = name;
      button.addEventListener('click', () => showTask(index));
      picker.append(button);
      buttons.push(button);
    });
    enlarge.hidden = !canEnlarge;
    enlarge.addEventListener('click', () => openFigure(art.querySelector('svg').cloneNode(true), examples[level][current][0], enlarge, examples[level][current][1][2]));
    const details = document.createElement('details');
    details.className = 'full-sheet';
    const summary = document.createElement('summary');
    summary.textContent = `View all L${level} examples together`;
    details.append(summary);
    figure.before(browser, details);
    details.append(figure);
    showTask(0);
  });
  if (!canEnlarge) return;
  document.querySelectorAll('.figure-link, .overview a').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const source = link.querySelector('img');
      openFigure(source.cloneNode(true), 'Figure detail', link, source.naturalWidth || 2400);
    });
  });
  zoom.addEventListener('click', () => {
    const zoomed = wrap.classList.toggle('is-zoomed');
    zoom.textContent = zoomed ? 'Fit to screen' : 'Actual size';
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
})();
