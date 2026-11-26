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
