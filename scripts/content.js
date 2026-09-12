chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "EXTRACT_PAGE") {
        const result = [];
        const interval = setInterval(() => {
            result.push(...extractPage());
        }, 5000);

        setTimeout(() => {
            clearInterval(interval);
            console.log("result: ", result);
        }, 20000);
    }
});

const scrollable = [...document.querySelectorAll('*')]
    .filter(el =>
        el.scrollHeight > el.clientHeight &&
        ['auto', 'scroll'].includes(getComputedStyle(el).overflowY)
    )
    .sort((a, b) => b.scrollHeight - a.scrollHeight)[0];


function extractPage() {
    const targetText = "more";

    const buttons = Array.from(
        document.querySelectorAll("button")
    ).filter(button =>
        button.innerText
            .trim()
            .toLowerCase()
            .includes(targetText)
    );

    const postElements = [];
    const removableParentElements = [];

    for (const button of buttons) {
        let parent = button.parentElement;

        if (parent) {
            postElements.push(parent);
        }

        while (parent != null && !parent.hasAttribute("data-lazy-mount-id")) {
            parent = parent.parentElement;
        }

        if (parent != null) {
            removableParentElements.push(parent);
            parent.remove();
        }
    }

    const texts = [];

    for (const element of postElements) {
        texts.push(element.innerText);
    }

    console.log("Extracted:", texts);

    const scrollable = [...document.querySelectorAll('*')]
        .filter(el =>
            el.scrollHeight > el.clientHeight &&
            ['auto', 'scroll'].includes(getComputedStyle(el).overflowY)
        )
        .sort((a, b) => b.scrollHeight - a.scrollHeight)[0];

    if (scrollable) {
        scrollable.scrollTop = scrollable.scrollHeight;
    }

    return texts;
}

console.log("content.js");


// console.log(scrollable);
// scrollable.scrollTop = scrollable.scrollHeight;
