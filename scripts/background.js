chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

let allowExtraction = true;

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
    if(extraction_response.status == "success" && allowExtraction){
      setTimeout(() => {
        runExtractionLoop(tabId);
      }, 5000);
    }
  } catch (error) {
    console.error("Could not communicate with content script:", error);
  }
};

chrome.runtime.onMessage.addListener(async(request, sender, sendResponse) => {
  if (request.action === "captureTime") {
    const tabId = request.tabId;

    console.log(`Time in Milliseconds: ${request.milliseconds} ms`);
    console.log(`Breakdown:`, request.details);

    await chrome.action.setBadgeText({
      tabId: tabId,
      text: "ON",
    });
    runExtractionLoop(tabId);
    setTimeout(() => {
      allowExtraction = false;
      chrome.action.setBadgeText({
        tabId: tabId,
        text: "OFF",
      });
    }, request.milliseconds);
  }
});