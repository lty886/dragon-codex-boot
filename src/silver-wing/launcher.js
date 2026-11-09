ObjC.import('Cocoa');
ObjC.import('WebKit');
var application = Application.currentApplication();
application.includeStandardAdditions = true;
var window, webView, bridge, windowDelegate;
var launched = false;
function enterCodex() {
  if (launched) return;
  $.NSLog($('DragonLauncher: animation completed, opening Codex'));
  var targetURL = $.NSWorkspace.sharedWorkspace.URLForApplicationWithBundleIdentifier('com.openai.codex');
  if (!targetURL || targetURL.isNil()) {
    var alert = $.NSAlert.alloc.init;
    alert.messageText = '未找到 Codex 应用';
    alert.informativeText = '请先安装应用标识为 com.openai.codex 的桌面客户端。启动器没有修改官方应用。';
    alert.runModal;
    return;
  }
  var success = $.NSWorkspace.sharedWorkspace.launchApplication(ObjC.unwrap(targetURL.path));
  if (success) {
    launched = true;
    $.NSLog($('DragonLauncher: Codex launch accepted; closing animation window'));
    $.NSApplication.sharedApplication.terminate(null);
  } else {
    var alert = $.NSAlert.alloc.init;
    alert.messageText = '无法打开 Codex';
    alert.informativeText = '请从 Dock 打开原应用。';
    alert.runModal;
  }
}
ObjC.registerSubclass({
  name: 'DragonLaunchBridge',
  protocols: ['WKScriptMessageHandler'],
  methods: {
    'userContentController:didReceiveScriptMessage:': {
      types: ['void', ['id', 'id']],
      implementation: function(controller, message) {
        if (ObjC.unwrap(message.body) === 'enter-codex') enterCodex();
      }
    }
  }
});
ObjC.registerSubclass({
  name: 'DragonWindowDelegate',
  protocols: ['NSWindowDelegate'],
  methods: {
    'windowWillClose:': {
      types: ['void', ['id']],
      implementation: function(notification) { $.NSApplication.sharedApplication.terminate(null); }
    }
  }
});
function run() {
  $.NSLog($('DragonLauncher: starting native animation window'));
  var app = $.NSApplication.sharedApplication;
  app.setActivationPolicy($.NSApplicationActivationPolicyRegular);
  var resource = $.NSBundle.mainBundle.resourcePath;
  var file = resource.stringByAppendingPathComponent('web/index.html');
  var config = $.WKWebViewConfiguration.alloc.init;
  bridge = $.DragonLaunchBridge.alloc.init;
  config.userContentController.addScriptMessageHandlerName(bridge, 'dragonLauncher');
  var script = `(function(){
    let sent=false;
    function launch(){if(sent)return;sent=true;window.webkit.messageHandlers.dragonLauncher.postMessage('enter-codex');}
    const enter=document.querySelector('#enter');
    // Replace the web-only destination with a native launch action.
    enter.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();launch();},true);
    document.querySelector('#status').textContent='动画结束后将自动打开 Codex';
    const footer=document.querySelector('footer span:last-child');
    footer.textContent='独立启动器 · 动画结束后进入真正的 Codex';
    let pending;
    const stage=document.querySelector('#app');
    function sync(){clearTimeout(pending);if(stage.classList.contains('ready'))pending=setTimeout(launch,350);}
    new MutationObserver(sync).observe(stage,{attributes:true,attributeFilter:['class']});
    sync();
  })();`;
  var userScript = $.WKUserScript.alloc.initWithSourceInjectionTimeForMainFrameOnly(script, $.WKUserScriptInjectionTimeAtDocumentEnd, true);
  config.userContentController.addUserScript(userScript);
  var screen = $.NSScreen.mainScreen.visibleFrame;
  var width = Math.min(1120, screen.size.width - 60);
  var height = Math.min(760, screen.size.height - 70);
  var rect = $.NSMakeRect(0, 0, width, height);
  window = $.NSWindow.alloc.initWithContentRectStyleMaskBackingDefer(rect,
    $.NSWindowStyleMaskTitled | $.NSWindowStyleMaskClosable | $.NSWindowStyleMaskMiniaturizable | $.NSWindowStyleMaskResizable,
    $.NSBackingStoreBuffered, false);
  window.title = 'Codex 龙翼少女启动器';
  window.setContentMinSize($.NSMakeSize(390, 500));
  windowDelegate = $.DragonWindowDelegate.alloc.init;
  window.delegate = windowDelegate;
  webView = $.WKWebView.alloc.initWithFrameConfiguration(rect, config);
  webView.autoresizingMask = $.NSViewWidthSizable | $.NSViewHeightSizable;
  window.contentView = webView;
  webView.loadFileURLAllowingReadAccessToURL($.NSURL.fileURLWithPath(file), $.NSURL.fileURLWithPath(resource));
  window.center;
  window.makeKeyAndOrderFront(null);
  var menu = $.NSMenu.alloc.init;
  var item = $.NSMenuItem.alloc.init;
  menu.addItem(item);
  var submenu = $.NSMenu.alloc.init;
  submenu.addItemWithTitleActionKeyEquivalent('退出龙翼少女启动器', 'terminate:', 'q');
  item.submenu = submenu;
  app.mainMenu = menu;
  app.activateIgnoringOtherApps(true);
  app.run;
}
