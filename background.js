function onCreated(n) {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

if (browser.i18n.getMessage("extensionName") == "Close Tabs to the Right") {
    const menuItemParams = {
      id: "close_right",
      title: browser.i18n.getMessage("contextItemTitle"),
      contexts: ["tab"]
    };
    browser.contextMenus.create(menuItemParams, onCreated);
} else if (browser.i18n.getMessage("extensionName") == "Close Other Tabs") {
    const menuItemParams = {
      id: "close_other_tabs",
      title: browser.i18n.getMessage("contextItemTitleCloseOtherTabs"),
      contexts: ["tab"]
    };
    browser.contextMenus.create(menuItemParams, onCreated);
}

function closeTabs(sender, tabs) {
    var senderFound = false;
    for (var tab of tabs) {
        if (tab.id == sender.id) {
            senderFound = true;
            continue;
        }
        if (!tab.pinned && senderFound) {
            browser.tabs.remove(tab.id);
        }
    }
}

function closeOtherTabs(sender, tabs) {
    for (var tab of tabs) {
        if (tab.id == sender.id) {
            continue;
        } else if (!tab.pinned) {
            browser.tabs.remove(tab.id);
        }
    }
}

browser.contextMenus.onClicked.addListener(function(info, sender) {
    var querying = browser.tabs.query({currentWindow: true});

    if (info.menuItemId == "close_right") {
        querying.then(closeTabs.bind(null, sender));
    } else if (info.menuItemId == "close_other_tabs") {
        querying.then(closeOtherTabs.bind(null, sender));
    }
});


// supports Tree Style Tab's fake context menu
// https://addons.mozilla.org/firefox/addon/tree-style-tab/
function registerToTST() {
    browser.runtime.sendMessage("treestyletab@piro.sakura.ne.jp", {
        type: "fake-contextMenu-create",
        params: menuItemParams
    }).then(onCreated, onCreated);
}
browser.runtime.onMessageExternal.addListener((message, sender) => {
    switch (sender.id) {
        case "treestyletab@piro.sakura.ne.jp":
            switch (message.type) {
                case "ready":
                    registerToTST();
                    return;
                case "fake-contextMenu-click":
                    browser.tabs.query({currentWindow: true})
                        .then(tabs => closeTabs(message.tab, tabs));
                    return;
            }
    }
});
registerToTST();