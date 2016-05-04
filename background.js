chrome.commands.onCommand.addListener(function ( command ) {
    playerTabAction(function (playerTab) {
        if (command === "player-search") {
            chrome.tabs.highlight({
              windowId: playerTab.windowId,
              tabs: playerTab.index 
            });
        }
        else if (command === "tab-switch") {
            chrome.tabs.query({active: true, windowId: playerTab.windowId}, function (activeTabs) {
                var activeTab = activeTabs[0];
                if (activeTab.id == playerTab.id) {
                    chrome.storage.local.get("lastVisitedTab", 
                        function (items) {
                            if (items["lastVisitedTab"]) {
                                chrome.tabs.get(items["lastVisitedTab"],
                                    function ( lastTab ) {
                                        chrome.tabs.highlight({
                                            windowId: lastTab.windowId,
                                            tabs: lastTab.index
                                        });
                                    }
                                );
                            }
                        }
                    )
                }
                else {
                    chrome.tabs.highlight({ tabs: playerTab.index });
                }
            });
        }
        chrome.tabs.sendMessage(playerTab.id, {command: command})
    });
});

chrome.tabs.onActivated.addListener(function ( activeInfo ) {
    playerTabAction( function ( tab ) { 
        if (activeInfo.tabId !== tab.id) {
            saveLastVisitedTab(activeInfo.tabId);
        }
    });
});

chrome.runtime.onInstalled.addListener(function () {
    playerTabAction( function ( tab ) {
        saveLastVisitedTab(tab.id);
        chrome.tabs.reload(tab.id);
    });
});

/**
 * Retrieves player tab and executes callback, passing in the tab.
 *
 * callback: function( tab ) { ... };
 */
function playerTabAction( callback ) {
    chrome.storage.local.get("playerTab", function ( items ) {
        if (items["playerTab"]) {
            chrome.tabs.get(items["playerTab"], function ( tab ) {
                // TODO: Check if tab is youtube
                if (tab) {
                    callback(tab);
                }
                else {
                    bindPlayerTab(callback);
                }
            });
        }
        else {
            bindPlayerTab(callback);
        }
    });
}

/**
 *  Creates a new player tab unless there is already a pinned youtube
 *  tab. 
 *
 *  Definition of bound: storage local at key 'playerTab' has player's
 *  tabid, and a tab corresponds to that tabid.
 *
 * callback: function ( tab ) { ... };
 */
function bindPlayerTab( callback ) {
    chrome.tabs.query({
        pinned: true,
        url: "https://*.youtube.com/*"
    }, function ( tabs ) {
        if (tabs.length === 0) {
            chrome.tabs.create({
                index: 0,
                url: "https://www.youtube.com",
                pinned: true,
                active: false
            }, function ( createdTab ) {
                chrome.storage.local.set({
                    playerTab: createdTab.id
                }, callback.bind(null, createdTab));
            });
        }
        else {
            chrome.storage.local.set({
                playerTab: tabs[0].id
            }, callback.bind(null, tabs[0]));
        }
    });
}

function saveLastVisitedTab(tabId) {
  chrome.storage.local.set( 
  {
      "lastVisitedTab": tabId
  });
}