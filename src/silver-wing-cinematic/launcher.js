ObjC.import('Cocoa');ObjC.import('WebKit');
var win,view,handler,delegate,clock,target,phase='idle',began=0;
function log(s){$.NSLog($('SilverWingCinematic: '+s));}
function now(){return $.NSDate.date.timeIntervalSince1970;}
function status(s){log(s);if(win)win.title=s;}
function prepare(){
 var url=$.NSWorkspace.sharedWorkspace.URLForApplicationWithBundleIdentifier('com.openai.codex');
 if(!url||url.isNil()){status('未找到 Codex，请先安装官方客户端');log('TARGET_MISSING');return false;}
 var error=Ref();
 target=$.NSWorkspace.sharedWorkspace.launchApplicationAtURLOptionsConfigurationError(url,512,$({}),error);
 if(!target||target.isNil()){status('无法打开 Codex，请保留当前窗口并手动打开');log('TARGET_LAUNCH_FAILED');return false;}
 log('TARGET_PREPARED_WITHOUT_ACTIVATION');return true;
}
function handoff(){if(phase==='waiting'||phase==='fading')return;if(!target&&!prepare())return;phase='waiting';began=now();status('等待 Codex 启动，当前画面保持显示…');log('HANDOFF_REQUESTED');}
ObjC.registerSubclass({name:'SilverWingCinematicBridge',protocols:['WKScriptMessageHandler'],methods:{
 'userContentController:didReceiveScriptMessage:':{types:['void',['id','id']],implementation:function(c,m){var msg=ObjC.unwrap(m.body);log('WEB '+msg);if(msg==='handoff')handoff();if(msg==='reset'){phase='idle';win.alphaValue=1;}}},
 'tick:':{types:['void',['id']],implementation:function(t){
  if(phase==='waiting'){
   if(target.terminated){phase='idle';status('Codex 已退出；点击进入 Codex可重试');target=null;return;}
   if(target.finishedLaunching){if(!target.activateWithOptions(2)){phase='idle';status('无法激活 Codex；保留预览窗口');return;}phase='settling';began=now();log('TARGET_ACTIVATION_ACCEPTED');}
   else if(now()-began>15){phase='idle';status('Codex 启动超时；保留当前画面，可手动重试');log('TARGET_TIMEOUT');}
  }else if(phase==='settling'&&now()-began>.8){phase='fading';began=now();log('NATIVE_FADE_BEGIN');}
  else if(phase==='fading'){var p=Math.min(1,(now()-began)/1.25);win.alphaValue=1-(p*p*(3-2*p));if(p>=1){log('NATIVE_FADE_COMPLETE');$.NSApplication.sharedApplication.terminate(null);}}
 }}
}});
ObjC.registerSubclass({name:'SilverWingCinematicWindowDelegate',protocols:['NSWindowDelegate'],methods:{'windowWillClose:':{types:['void',['id']],implementation:function(){log('CANCELLED');$.NSApplication.sharedApplication.terminate(null);}}}});
function run(){
 var app=$.NSApplication.sharedApplication;app.setActivationPolicy(0);
 var resources=$.NSBundle.mainBundle.resourcePath;
 var cfg=$.WKWebViewConfiguration.alloc.init;cfg.mediaTypesRequiringUserActionForPlayback=0;
 var debugScript="window.addEventListener('error',function(e){window.webkit.messageHandlers.cinematic.postMessage('JS_ERROR '+e.message)});window.addEventListener('unhandledrejection',function(){window.webkit.messageHandlers.cinematic.postMessage('JS_PROMISE_ERROR')});";
 cfg.userContentController.addUserScript($.WKUserScript.alloc.initWithSourceInjectionTimeForMainFrameOnly(debugScript,0,true));
 handler=$.SilverWingCinematicBridge.alloc.init;cfg.userContentController.addScriptMessageHandlerName(handler,'cinematic');
 var frame=$.NSScreen.mainScreen.visibleFrame;var rect=$.NSMakeRect(0,0,Math.min(1200,frame.size.width-60),Math.min(800,frame.size.height-70));
 win=$.NSWindow.alloc.initWithContentRectStyleMaskBackingDefer(rect,15,2,false);win.title='龙翼少女 · 镜头转场预览（人物动画待补充）';win.level=3;
 delegate=$.SilverWingCinematicWindowDelegate.alloc.init;win.delegate=delegate;
 view=$.WKWebView.alloc.initWithFrameConfiguration(rect,cfg);view.autoresizingMask=18;win.contentView=view;
 view.loadFileURLAllowingReadAccessToURL($.NSURL.fileURLWithPath(resources.stringByAppendingPathComponent('web/index.html')),$.NSURL.fileURLWithPath(resources));
 var menu=$.NSMenu.alloc.init;var item=$.NSMenuItem.alloc.init;menu.addItem(item);var sub=$.NSMenu.alloc.init;sub.addItemWithTitleActionKeyEquivalent('退出启动器','terminate:','q');item.submenu=sub;app.mainMenu=menu;
 win.center;win.makeKeyAndOrderFront(null);app.activateIgnoringOtherApps(true);
 clock=$.NSTimer.scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(.025,handler,'tick:',null,true);
 log('WINDOW_READY');prepare();app.run;
}
