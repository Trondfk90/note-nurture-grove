window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

// Add IPC exposure to window object
contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
  saveNote: (path, content) => ipcRenderer.invoke('file:writeFile', path, content),
  readNote: (path) => ipcRenderer.invoke('file:readFile', path),
});
