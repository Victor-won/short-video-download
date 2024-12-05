const port = chrome.runtime.connect({ name: 'SVD' });
const requestList = document.getElementById('request-list');
const requestDetail = document.getElementById('request-detail');

let requestStore = []; // 存储所有捕获的数据

// 接收来自 background.js 的消息
port.onMessage.addListener((message) => {
    if (message.type === 'requestResponse') {
        const requestData = message.data.request;
        const responseData = message.data.response;

        // 存储到请求列表
        requestStore.push({ requestData, responseData });

        // 更新列表
        const requestItem = document.createElement('div');
        requestItem.className = 'request-item';
        requestItem.textContent = `[${requestData.method || 'GET'}] ${requestData.url}`;
        requestList.appendChild(requestItem);

        // 点击显示详细信息
        requestItem.addEventListener('click', () => {
            const details = `
### Request
URL: ${requestData.url}
Method: ${requestData.method || 'GET'}
Timestamp: ${new Date(requestData.timeStamp).toLocaleString()}
Request Body: ${JSON.stringify(JSON.parse(requestData.requestBody) || {}, null, 2)}

### Response
Status Code: ${responseData.statusCode || 'Unknown'}
Timestamp: ${new Date(responseData.timeStamp).toLocaleString()}
`;
            requestDetail.textContent = details;
        });
    }
});
