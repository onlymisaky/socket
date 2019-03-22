const event = (() => {
  const events = {};

  const emit = (type, ...msgs) => {
    const listeners = events[type] || [];
    listeners.forEach(listener => listener(...msgs));
  }

  const on = (type, listener) => {
    if (typeof type !== 'string' || typeof listener !== 'function') {
      return;
    }
    const listeners = events[type] || [];
    listeners.push(listener);
    events[type] = listeners;
  }

  const off = (type, listener) => {
    let listeners = events[type] || [];
    if (typeof listener === 'function') {
      let index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
      return;
    }
    if (listeners.length) {
      delete events[type];
    }
  }

  return { emit, on, off }

})();

export default event;
