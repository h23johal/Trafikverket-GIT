"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
function domReady(condition = ["complete", "interactive"]) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}
const safeDOM = {
  append(parent, child) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent, child) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  }
};
function useLoading() {
  const className = `loaders-css__square-spin`;
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `;
  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");
  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`;
  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    }
  };
}
const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);
window.onmessage = (ev) => {
  ev.data.payload === "removeLoading" && removeLoading();
};
setTimeout(removeLoading, 4999);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uL2VsZWN0cm9uL3ByZWxvYWQvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXBjUmVuZGVyZXIsIGNvbnRleHRCcmlkZ2UgfSBmcm9tICdlbGVjdHJvbidcclxuXHJcbi8vIC0tLS0tLS0tLSBFeHBvc2Ugc29tZSBBUEkgdG8gdGhlIFJlbmRlcmVyIHByb2Nlc3MgLS0tLS0tLS0tXHJcbmNvbnRleHRCcmlkZ2UuZXhwb3NlSW5NYWluV29ybGQoJ2lwY1JlbmRlcmVyJywge1xyXG4gIG9uKC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIGlwY1JlbmRlcmVyLm9uPikge1xyXG4gICAgY29uc3QgW2NoYW5uZWwsIGxpc3RlbmVyXSA9IGFyZ3NcclxuICAgIHJldHVybiBpcGNSZW5kZXJlci5vbihjaGFubmVsLCAoZXZlbnQsIC4uLmFyZ3MpID0+IGxpc3RlbmVyKGV2ZW50LCAuLi5hcmdzKSlcclxuICB9LFxyXG4gIG9mZiguLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBpcGNSZW5kZXJlci5vZmY+KSB7XHJcbiAgICBjb25zdCBbY2hhbm5lbCwgLi4ub21pdF0gPSBhcmdzXHJcbiAgICByZXR1cm4gaXBjUmVuZGVyZXIub2ZmKGNoYW5uZWwsIC4uLm9taXQpXHJcbiAgfSxcclxuICBzZW5kKC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIGlwY1JlbmRlcmVyLnNlbmQ+KSB7XHJcbiAgICBjb25zdCBbY2hhbm5lbCwgLi4ub21pdF0gPSBhcmdzXHJcbiAgICByZXR1cm4gaXBjUmVuZGVyZXIuc2VuZChjaGFubmVsLCAuLi5vbWl0KVxyXG4gIH0sXHJcbiAgaW52b2tlKC4uLmFyZ3M6IFBhcmFtZXRlcnM8dHlwZW9mIGlwY1JlbmRlcmVyLmludm9rZT4pIHtcclxuICAgIGNvbnN0IFtjaGFubmVsLCAuLi5vbWl0XSA9IGFyZ3NcclxuICAgIHJldHVybiBpcGNSZW5kZXJlci5pbnZva2UoY2hhbm5lbCwgLi4ub21pdClcclxuICB9LFxyXG5cclxuICAvLyBZb3UgY2FuIGV4cG9zZSBvdGhlciBBUFRzIHlvdSBuZWVkIGhlcmUuXHJcbiAgLy8gLi4uXHJcbn0pXHJcblxyXG4vLyAtLS0tLS0tLS0gUHJlbG9hZCBzY3JpcHRzIGxvYWRpbmcgLS0tLS0tLS0tXHJcbmZ1bmN0aW9uIGRvbVJlYWR5KGNvbmRpdGlvbjogRG9jdW1lbnRSZWFkeVN0YXRlW10gPSBbJ2NvbXBsZXRlJywgJ2ludGVyYWN0aXZlJ10pIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XHJcbiAgICBpZiAoY29uZGl0aW9uLmluY2x1ZGVzKGRvY3VtZW50LnJlYWR5U3RhdGUpKSB7XHJcbiAgICAgIHJlc29sdmUodHJ1ZSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3JlYWR5c3RhdGVjaGFuZ2UnLCAoKSA9PiB7XHJcbiAgICAgICAgaWYgKGNvbmRpdGlvbi5pbmNsdWRlcyhkb2N1bWVudC5yZWFkeVN0YXRlKSkge1xyXG4gICAgICAgICAgcmVzb2x2ZSh0cnVlKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH1cclxuICB9KVxyXG59XHJcblxyXG5jb25zdCBzYWZlRE9NID0ge1xyXG4gIGFwcGVuZChwYXJlbnQ6IEhUTUxFbGVtZW50LCBjaGlsZDogSFRNTEVsZW1lbnQpIHtcclxuICAgIGlmICghQXJyYXkuZnJvbShwYXJlbnQuY2hpbGRyZW4pLmZpbmQoZSA9PiBlID09PSBjaGlsZCkpIHtcclxuICAgICAgcmV0dXJuIHBhcmVudC5hcHBlbmRDaGlsZChjaGlsZClcclxuICAgIH1cclxuICB9LFxyXG4gIHJlbW92ZShwYXJlbnQ6IEhUTUxFbGVtZW50LCBjaGlsZDogSFRNTEVsZW1lbnQpIHtcclxuICAgIGlmIChBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbikuZmluZChlID0+IGUgPT09IGNoaWxkKSkge1xyXG4gICAgICByZXR1cm4gcGFyZW50LnJlbW92ZUNoaWxkKGNoaWxkKVxyXG4gICAgfVxyXG4gIH0sXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBodHRwczovL3RvYmlhc2FobGluLmNvbS9zcGlua2l0XHJcbiAqIGh0dHBzOi8vY29ubm9yYXRoZXJ0b24uY29tL2xvYWRlcnNcclxuICogaHR0cHM6Ly9wcm9qZWN0cy5sdWtlaGFhcy5tZS9jc3MtbG9hZGVyc1xyXG4gKiBodHRwczovL21hdGVqa3VzdGVjLmdpdGh1Yi5pby9TcGluVGhhdFNoaXRcclxuICovXHJcbmZ1bmN0aW9uIHVzZUxvYWRpbmcoKSB7XHJcbiAgY29uc3QgY2xhc3NOYW1lID0gYGxvYWRlcnMtY3NzX19zcXVhcmUtc3BpbmBcclxuICBjb25zdCBzdHlsZUNvbnRlbnQgPSBgXHJcbkBrZXlmcmFtZXMgc3F1YXJlLXNwaW4ge1xyXG4gIDI1JSB7IHRyYW5zZm9ybTogcGVyc3BlY3RpdmUoMTAwcHgpIHJvdGF0ZVgoMTgwZGVnKSByb3RhdGVZKDApOyB9XHJcbiAgNTAlIHsgdHJhbnNmb3JtOiBwZXJzcGVjdGl2ZSgxMDBweCkgcm90YXRlWCgxODBkZWcpIHJvdGF0ZVkoMTgwZGVnKTsgfVxyXG4gIDc1JSB7IHRyYW5zZm9ybTogcGVyc3BlY3RpdmUoMTAwcHgpIHJvdGF0ZVgoMCkgcm90YXRlWSgxODBkZWcpOyB9XHJcbiAgMTAwJSB7IHRyYW5zZm9ybTogcGVyc3BlY3RpdmUoMTAwcHgpIHJvdGF0ZVgoMCkgcm90YXRlWSgwKTsgfVxyXG59XHJcbi4ke2NsYXNzTmFtZX0gPiBkaXYge1xyXG4gIGFuaW1hdGlvbi1maWxsLW1vZGU6IGJvdGg7XHJcbiAgd2lkdGg6IDUwcHg7XHJcbiAgaGVpZ2h0OiA1MHB4O1xyXG4gIGJhY2tncm91bmQ6ICNmZmY7XHJcbiAgYW5pbWF0aW9uOiBzcXVhcmUtc3BpbiAzcyAwcyBjdWJpYy1iZXppZXIoMC4wOSwgMC41NywgMC40OSwgMC45KSBpbmZpbml0ZTtcclxufVxyXG4uYXBwLWxvYWRpbmctd3JhcCB7XHJcbiAgcG9zaXRpb246IGZpeGVkO1xyXG4gIHRvcDogMDtcclxuICBsZWZ0OiAwO1xyXG4gIHdpZHRoOiAxMDB2dztcclxuICBoZWlnaHQ6IDEwMHZoO1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcclxuICBiYWNrZ3JvdW5kOiAjMjgyYzM0O1xyXG4gIHotaW5kZXg6IDk7XHJcbn1cclxuICAgIGBcclxuICBjb25zdCBvU3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXHJcbiAgY29uc3Qgb0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcblxyXG4gIG9TdHlsZS5pZCA9ICdhcHAtbG9hZGluZy1zdHlsZSdcclxuICBvU3R5bGUuaW5uZXJIVE1MID0gc3R5bGVDb250ZW50XHJcbiAgb0Rpdi5jbGFzc05hbWUgPSAnYXBwLWxvYWRpbmctd3JhcCdcclxuICBvRGl2LmlubmVySFRNTCA9IGA8ZGl2IGNsYXNzPVwiJHtjbGFzc05hbWV9XCI+PGRpdj48L2Rpdj48L2Rpdj5gXHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBhcHBlbmRMb2FkaW5nKCkge1xyXG4gICAgICBzYWZlRE9NLmFwcGVuZChkb2N1bWVudC5oZWFkLCBvU3R5bGUpXHJcbiAgICAgIHNhZmVET00uYXBwZW5kKGRvY3VtZW50LmJvZHksIG9EaXYpXHJcbiAgICB9LFxyXG4gICAgcmVtb3ZlTG9hZGluZygpIHtcclxuICAgICAgc2FmZURPTS5yZW1vdmUoZG9jdW1lbnQuaGVhZCwgb1N0eWxlKVxyXG4gICAgICBzYWZlRE9NLnJlbW92ZShkb2N1bWVudC5ib2R5LCBvRGl2KVxyXG4gICAgfSxcclxuICB9XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmNvbnN0IHsgYXBwZW5kTG9hZGluZywgcmVtb3ZlTG9hZGluZyB9ID0gdXNlTG9hZGluZygpXHJcbmRvbVJlYWR5KCkudGhlbihhcHBlbmRMb2FkaW5nKVxyXG5cclxud2luZG93Lm9ubWVzc2FnZSA9IChldikgPT4ge1xyXG4gIGV2LmRhdGEucGF5bG9hZCA9PT0gJ3JlbW92ZUxvYWRpbmcnICYmIHJlbW92ZUxvYWRpbmcoKVxyXG59XHJcblxyXG5zZXRUaW1lb3V0KHJlbW92ZUxvYWRpbmcsIDQ5OTkpIl0sIm5hbWVzIjpbImNvbnRleHRCcmlkZ2UiLCJpcGNSZW5kZXJlciIsImFyZ3MiXSwibWFwcGluZ3MiOiI7O0FBR0FBLFNBQUFBLGNBQWMsa0JBQWtCLGVBQWU7QUFBQSxFQUM3QyxNQUFNLE1BQXlDO0FBQ3ZDLFVBQUEsQ0FBQyxTQUFTLFFBQVEsSUFBSTtBQUNyQixXQUFBQyxxQkFBWSxHQUFHLFNBQVMsQ0FBQyxVQUFVQyxVQUFTLFNBQVMsT0FBTyxHQUFHQSxLQUFJLENBQUM7QUFBQSxFQUM3RTtBQUFBLEVBQ0EsT0FBTyxNQUEwQztBQUMvQyxVQUFNLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSTtBQUMzQixXQUFPRCxxQkFBWSxJQUFJLFNBQVMsR0FBRyxJQUFJO0FBQUEsRUFDekM7QUFBQSxFQUNBLFFBQVEsTUFBMkM7QUFDakQsVUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUk7QUFDM0IsV0FBT0EscUJBQVksS0FBSyxTQUFTLEdBQUcsSUFBSTtBQUFBLEVBQzFDO0FBQUEsRUFDQSxVQUFVLE1BQTZDO0FBQ3JELFVBQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJO0FBQzNCLFdBQU9BLHFCQUFZLE9BQU8sU0FBUyxHQUFHLElBQUk7QUFBQSxFQUFBO0FBQUE7QUFBQTtBQUs5QyxDQUFDO0FBR0QsU0FBUyxTQUFTLFlBQWtDLENBQUMsWUFBWSxhQUFhLEdBQUc7QUFDeEUsU0FBQSxJQUFJLFFBQVEsQ0FBVyxZQUFBO0FBQzVCLFFBQUksVUFBVSxTQUFTLFNBQVMsVUFBVSxHQUFHO0FBQzNDLGNBQVEsSUFBSTtBQUFBLElBQUEsT0FDUDtBQUNJLGVBQUEsaUJBQWlCLG9CQUFvQixNQUFNO0FBQ2xELFlBQUksVUFBVSxTQUFTLFNBQVMsVUFBVSxHQUFHO0FBQzNDLGtCQUFRLElBQUk7QUFBQSxRQUFBO0FBQUEsTUFDZCxDQUNEO0FBQUEsSUFBQTtBQUFBLEVBQ0gsQ0FDRDtBQUNIO0FBRUEsTUFBTSxVQUFVO0FBQUEsRUFDZCxPQUFPLFFBQXFCLE9BQW9CO0FBQzFDLFFBQUEsQ0FBQyxNQUFNLEtBQUssT0FBTyxRQUFRLEVBQUUsS0FBSyxDQUFBLE1BQUssTUFBTSxLQUFLLEdBQUc7QUFDaEQsYUFBQSxPQUFPLFlBQVksS0FBSztBQUFBLElBQUE7QUFBQSxFQUVuQztBQUFBLEVBQ0EsT0FBTyxRQUFxQixPQUFvQjtBQUMxQyxRQUFBLE1BQU0sS0FBSyxPQUFPLFFBQVEsRUFBRSxLQUFLLENBQUEsTUFBSyxNQUFNLEtBQUssR0FBRztBQUMvQyxhQUFBLE9BQU8sWUFBWSxLQUFLO0FBQUEsSUFBQTtBQUFBLEVBQ2pDO0FBRUo7QUFRQSxTQUFTLGFBQWE7QUFDcEIsUUFBTSxZQUFZO0FBQ2xCLFFBQU0sZUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEdBT3BCLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW9CSixRQUFBLFNBQVMsU0FBUyxjQUFjLE9BQU87QUFDdkMsUUFBQSxPQUFPLFNBQVMsY0FBYyxLQUFLO0FBRXpDLFNBQU8sS0FBSztBQUNaLFNBQU8sWUFBWTtBQUNuQixPQUFLLFlBQVk7QUFDWixPQUFBLFlBQVksZUFBZSxTQUFTO0FBRWxDLFNBQUE7QUFBQSxJQUNMLGdCQUFnQjtBQUNOLGNBQUEsT0FBTyxTQUFTLE1BQU0sTUFBTTtBQUM1QixjQUFBLE9BQU8sU0FBUyxNQUFNLElBQUk7QUFBQSxJQUNwQztBQUFBLElBQ0EsZ0JBQWdCO0FBQ04sY0FBQSxPQUFPLFNBQVMsTUFBTSxNQUFNO0FBQzVCLGNBQUEsT0FBTyxTQUFTLE1BQU0sSUFBSTtBQUFBLElBQUE7QUFBQSxFQUV0QztBQUNGO0FBSUEsTUFBTSxFQUFFLGVBQWUsY0FBYyxJQUFJLFdBQVc7QUFDcEQsU0FBUyxFQUFFLEtBQUssYUFBYTtBQUU3QixPQUFPLFlBQVksQ0FBQyxPQUFPO0FBQ3RCLEtBQUEsS0FBSyxZQUFZLG1CQUFtQixjQUFjO0FBQ3ZEO0FBRUEsV0FBVyxlQUFlLElBQUk7In0=
