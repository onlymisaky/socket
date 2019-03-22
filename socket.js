import event from 'event';

const socket = (url, reConnectCount = 10) => {

  /** @type {WebSocket|undefined|null} */
  let ws;

  const _instance = {
    url: url || '',
    errorList: [],
    connectCount: 0,
    // 原生事件池
    nativeEvents: {},
    eventsTemp: {},
    hasCreated() {
      return ws instanceof WebSocket;
    },
    reOpen() {
      if (_instance.connectCount >= reConnectCount) {
        event.emit('error', {
          msg: '超过重连次数',
          errorList: _instance.errorList
        });
        return;
      }
      if (ws && ws.readyState === ws.OPEN) {
        return;
      }
      window.setTimeout(() => {
        instance.open();
      }, 1000)
    },
    bindNativeEvent() {
      for (var event in _instance.nativeEvents) {
        _instance.nativeEvents[event].forEach(({ binded, listener }, index) => {
          if (!binded) {
            ws.addEventListener(event, listener);
            _instance.nativeEvents[event][index].binded = true;
          }
        });
      }
    },
    bindSelfEvent() {
      ws.addEventListener('open', e => event.emit('open', e));
      ws.addEventListener('message', e => event.emit('message', e.data));
      ws.addEventListener('error', e => {
        _instance.reOpen();
        _instance.errorList.push(e);
      });
    }
  };

  const instance = {
    open(url) {
      if (!url && !_instance.url) {
        event.emit('error', '没有地址！');
        return;
      }
      if (_instance.hasCreated()) {
        if (ws.readyState === ws.OPEN) {
          return;
        }
        ws.close();
      }
      ws = null;
      ws = new WebSocket(_instance.url);
      _instance.connectCount++;
      _instance.bindSelfEvent();
      _instance.bindNativeEvent();
    },
    close(...args) {
      if (_instance.hasCreated()) {
        ws.close(...args);
      } else {
        ws = null;
      }
      event.emit('close');
    },
    on(eventName, eventFn) {
      if (typeof eventName !== 'string' ||
        typeof eventFn !== 'function') {
        return;
      }
      // 原生事件
      if (['open.native', 'message.native', 'error.native', 'close.native'].indexOf(eventName) > -1) {
        const binded = _instance.hasCreated();
        const type = eventName.replace('.native', '');

        let eventList = _instance.nativeEvents[type] || [];
        if (eventList.indexOf(eventFn) === -1) {
          binded && ws.addEventListener(type, eventFn);
          eventList.push({
            listener: eventFn,
            binded
          });
          _instance.nativeEvents[type] = eventList;
        }
        return;
      }
      event.on(eventName, eventFn);
    },
    emit: event.emit,
    off() {

    },
    send(msg) {
      if (_instance.hasCreated() && ws.readyState === ws.OPEN) {
        return ws.send(msg);
      }
      event.emit('error', 'socket还没有连接！');
    },
    getWebSocket() {
      return ws;
    }
  };

  return instance;
}

export default socket;
