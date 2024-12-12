const videoList = document.getElementById('video-list');

function renderResources(item) {
    const cardEl = document.createElement('div');
    cardEl.classList.add('video-card');
    cardEl.dataset.download = item.url;
    cardEl.innerHTML = `<div class="video-cover">
        <img src="${item.cover}" alt="${item.title}">
    </div>
    <div class="video-info">
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
    </div>`;
    videoList.appendChild(cardEl);
}

function getParentNode(el, className) {
    while (el && el.parentNode) {
        el = el.parentNode;
        if (el && el.classList && el.classList.contains(className)) {
            return el;
        }
    }
    return null;
}

videoList.addEventListener(
    'click',
    function (e) {
        const target = getParentNode(e.target, 'video-card');

        if (target) {
            const downloadUrl = target.dataset.download;
            console.log("downloadUrl, " + downloadUrl);
            chrome.runtime.sendMessage({ type: "download", url: downloadUrl });
        }

        e.preventDefault();
        e.stopPropagation();
    },
    false
);

videoList.innerHTML = '';

chrome.devtools.network.onRequestFinished.addListener(function (res) {
    const requestUrl = res.request.url;

    if (requestUrl.indexOf('/aweme/v1/web/aweme/post') === -1) return;

    res.getContent(function (content) {
        if (!content) return;

        try {
            const videoList = JSON.parse(content);
            ((videoList && videoList.aweme_list) || []).forEach((resource) => {
                if (resource.media_type === 4) {
                    const videoLen = resource.video.play_addr.url_list.length;
                    renderResources({
                        title: resource.item_title,
                        desc: resource.desc,
                        resId: resource.aweme_id,
                        cover: resource.video.cover.url_list[0],
                        width: resource.video.width,
                        height: resource.video.height,
                        url: resource.video.play_addr.url_list[videoLen - 1],
                    });
                }
            });
        } catch (error) {
            console.error('Invalid JSON', error);
            return;
        }
    });
});
