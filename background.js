chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {
    frame: "none",
    bounds: {
      
      width: 1115,
      height: 768
    },
    minWidth: 1115,
    minHeight:768,
    maxWidth: 1115,
    maxHeight:768,
  });
});