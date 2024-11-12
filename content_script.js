// 监听推荐列表节点变化
function observeCallback(recordList) {
  return function (mutationList) {
    for (let mutation of mutationList) {
      if (mutation.type === "childList") {
        const newNodes = Array.from(mutation.addedNodes);
        if (newNodes.length > 0) {
          newNodes.forEach((node) => {
            recordVideo(recordList, node);
          });
        }
      }
    }
  };
}

// 判断是否是广告
function isAd(node) {
  const a = node.querySelector("a.bili-video-card__image--link");
  return !a || a.attributes["data-target-url"];
}

// 记录
function recordVideo(recordList, node) {
  if (
    node.nodeType === Node.ELEMENT_NODE &&
    node.classList.contains("feed-card") &&
    window.getComputedStyle(node).display !== "none" &&
    !isAd(node)
  ) {
    const newNode = node.cloneNode(true);
    const upIcon = newNode.querySelector(".bili-video-card__info--owner__up");
    if (upIcon) {
      const upIconParent = upIcon.parentNode;
      const newUpIcon = document.querySelector(
        ".recommended-container_floor-aside .bili-video-card__info--owner__up"
      );
      upIconParent.replaceChild(newUpIcon, upIcon);
    }
    recordList.appendChild(newNode);
  }
}

// 记录按钮
function appendRecordBtn(recordListContainer) {
  const feedBtn = document.querySelector(".feed-roll-btn");
  const recordBtn = document.createElement("button");
  const iconNode = document.querySelectorAll(".right-entry-icon");
  recordBtn.appendChild(
    iconNode.length
      ? iconNode[4].cloneNode(true)
      : document.createElement("span")
  );
  recordBtn.appendChild(document.createTextNode("历史记录"));
  const attributes = feedBtn.childNodes[0].attributes;
  // 遍历属性并复制到目标元素
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    recordBtn.setAttribute(attr.name, attr.value);
  }
  recordBtn.style = "margin-top: 8px;";
  recordBtn.classList.add("record-btn");
  recordBtn.addEventListener("click", () => {
    window.getComputedStyle(recordListContainer).right !== "0px"
      ? (recordListContainer.style.right = "0px")
      : (recordListContainer.style.right = "-300px");
  });
  feedBtn.appendChild(recordBtn);
}

// 记录抽屉
function appendRecordList() {
  const recordListContainer = document.createElement("div");
  recordListContainer.classList.add("record-list-container");
  document.body.appendChild(recordListContainer);

  // clickoutside
  const mainContainer = document.querySelector("#i_cecream");
  mainContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("record-btn")) return;
    recordListContainer.style.right = "-300px";
  });

  // 清空按钮
  const clearBtn = document.createElement("button");
  clearBtn.classList.add("clear-btn");
  clearBtn.appendChild(document.createTextNode("清空"));
  recordListContainer.appendChild(clearBtn);

  // 记录列表
  const recordList = document.createElement("div");
  recordList.classList.add("record-list");
  recordListContainer.appendChild(recordList);

  clearBtn.addEventListener("click", () => {
    recordList.innerHTML = "";
  });

  return { recordListContainer, recordList };
}

window.addEventListener("load", () => {
  const { recordListContainer, recordList } = appendRecordList();
  appendRecordBtn(recordListContainer);

  const container = document.querySelector(
    ".recommended-container_floor-aside .container"
  );

  // 先记录下第一屏
  container.querySelectorAll(".feed-card").forEach((node) => {
    recordVideo(recordList, node);
  });

  const observerOptions = {
    childList: true, // 观察目标子节点的变化，是否有添加或者删除
  };
  const observer = new MutationObserver(observeCallback(recordList));
  observer.observe(container, observerOptions);
});
