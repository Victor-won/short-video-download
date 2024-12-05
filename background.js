let connectedPorts = [];
const requestResponseMap = new Map(); // 存储请求和响应数据

// 捕获请求数据
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        // 排除插件的请求
        if (details.initiator && details.initiator.includes("chrome-extension")) {
            return;
        }

        const requestData = {
            requestId: details.requestId,
            url: details.url,
            method: details.method,
            requestBody: details.requestBody
                ? new TextDecoder().decode(details.requestBody.raw[0].bytes) // 解析请求体
                : null,
            timeStamp: details.timeStamp,
        };

        // 存储请求数据
        requestResponseMap.set(details.requestId, { request: requestData });
    },
    { urls: ['<all_urls>'] },
    ['requestBody']
);

// 捕获响应数据
chrome.webRequest.onCompleted.addListener(
    async (details) => {
        // 获取请求数据
        const existingData = requestResponseMap.get(details.requestId);
        const responseHeaders = details.responseHeaders || [];

        try {
            const response = await fetch(details.url);
            const responseBody = await response.text();

            // 关联响应数据
            const responseData = {
                statusCode: details.statusCode,
                timeStamp: details.timeStamp,
                responseBody,
                responseHeaders,
            }
            existingData.response = responseData;
            requestResponseMap.set(details.requestId, existingData);

            // 将数据发送给 DevTools 面板
            connectedPorts.forEach((port) => {
                port.postMessage({
                    type: 'requestResponse',
                    data: requestResponseMap.get(details.requestId),
                });
            });
        } catch (error) {
            console.error("Failed to fetch response body:", error);
        }
    },
    { urls: ['<all_urls>'], types: ["xmlhttprequest"] }
);

// 处理 DevTools 面板连接
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'SVD') {
        connectedPorts.push(port);

        port.onDisconnect.addListener(() => {
            connectedPorts = connectedPorts.filter((p) => p !== port);
        });
    }
});
