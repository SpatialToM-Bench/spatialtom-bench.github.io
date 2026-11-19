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
