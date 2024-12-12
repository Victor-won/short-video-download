chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'download') {
        chrome.downloads.download({
            url: message.url,
        });
        sendResponse({ success: true });
    }
});
