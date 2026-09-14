chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

async function runExtractionLoop(tabId){
  console.log("Injecting content script(s)");
  try {
    const raw_posts = await chrome.tabs.sendMessage(tabId, {
      type: "EXTRACT_PAGE",
    });
    const response = await fetch("http://127.0.0.1:8000/api/posts", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
          data: raw_posts.data,
          extractedAt: new Date().toISOString()
      })
    });
    const extraction_response = await response.json();
    console.log("API response:", extraction_response);
    if(extraction_response.status == "success"){
      setTimeout(() => {
        runExtractionLoop(tabId);
      }, 5000);
    }
  } catch (error) {
    console.error("Could not communicate with content script:", error);
  }
};

chrome.action.onClicked.addListener(async (tab) => {
  const prevState = await chrome.action.getBadgeText({
    tabId: tab.id,
  });

  const nextState = prevState === "ON" ? "OFF" : "ON";

  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });

  if (nextState === "ON") {
    runExtractionLoop(tab.id);
  }
});