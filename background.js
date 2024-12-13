chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'download') {
        chrome.downloads.download({
            url: message.url,
            filename: `${message.name}.mp4`
        });
        sendResponse({ success: true });
    }
});
