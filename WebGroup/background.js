chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { // 监听标签页更新事件，当标签页加载完成时，注入脚本以监听悬停事件。
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    const domain = url.hostname;
    chrome.storage.sync.get(domain, function(data) {
      if (data[domain]) {
        const { groupName, color } = data[domain];

        // 获取所有标签页
        chrome.tabs.query({}, function(tabs) {
          let groupId = null;
          let sameDomainTabExists = false;

          // 遍历所有标签页，找到匹配的分组
          for (const tab of tabs) {
            if (tab.groupId !== -1) {
              // 检查分组信息
              const tabUrl = new URL(tab.url);
              if (tabUrl.hostname === domain) {
                sameDomainTabExists = true;
                groupId = tab.groupId;
                break;
              }
            }
          }
          if (groupId && sameDomainTabExists) {
            // 如果找到现有分组并且分组中有相同域名的标签页，则将新标签页添加到该分组
            chrome.tabs.group({ tabIds: tabId, groupId: groupId}, function(newGroupId) {
              chrome.tabGroups.update(newGroupId, { title: groupName, color: color });
            });
          } else {
            // 如果没有找到现有分组或分组中没有相同域名的标签页，则创建新的分组
            chrome.tabs.group({ tabIds: tabId }, function(newGroupId) {
              chrome.tabGroups.update(newGroupId, { title: groupName, color: color });
            });
          }
        });
      }
    });
  }
});
