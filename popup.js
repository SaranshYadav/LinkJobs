document.getElementById('captureBtn').addEventListener('click', async() => {
  const hrs = parseInt(document.getElementById('hours').value) || 0;
  const mins = parseInt(document.getElementById('minutes').value) || 0;
  const secs = parseInt(document.getElementById('seconds').value) || 0;

  const totalMilliseconds = ((hrs * 3600) + (mins * 60) + secs) * 1000;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  document.getElementById('result').innerText = `Milliseconds: ${totalMilliseconds} ms`;

  chrome.runtime.sendMessage({
    action: "captureTime",
    milliseconds: totalMilliseconds,
    details: { hours: hrs, minutes: mins, seconds: secs },
    tabId: tab.id
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message:", chrome.runtime.lastError.message);
    } else {
      console.log("Response from background.js:", response);
    }
  });
});