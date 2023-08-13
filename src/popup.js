const GREEN = "#0ab264";
const BLUE = "#0095ff";
const API_URL = "http://localhost:9000/summarize";

async function summarize(url, apiKey, organizationId) {
    const requestBody = { url, apiKey, organizationId };
    return fetch(API_URL, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
    .then((response) => {
        if (response.ok) {
            return response.json();
        } else if (response.status === 404) {
            return null;
        }
    })
    .then((data) => {
        return data ? data["data"] : null;
    });
}

async function handleSummarizedPolicy(summarizedPolicy) {
    if (summarizedPolicy !== null) {
        chrome.storage.local.set({ "data": summarizedPolicy });
        summarizeButton.innerText = "View";
        summarizeButton.style.backgroundColor = GREEN;
        summarizeButton.onclick = () => {
            summarizeButton.innerText = "Summarize Policy";
            summarizeButton.style.backgroundColor = BLUE;
            chrome.tabs.create({ url: "src/results.html" });
        }
    } else {
        summarizeButton.innerText = "Summarize Policy";
        alert("The webpage does not contain a privacy policy");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const summarizeButton = document.getElementById("summarizeButton");
    summarizeButton.onclick = () => {
        const apiKey = document.getElementById("apiKey").value;
        const organizationId = document.getElementById("organizationId").value;
        summarizeButton.innerText = "Loading...";
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            summarize(tabs[0].url, apiKey, organizationId)
                .then((summarizedPolicy) => handleSummarizedPolicy(summarizedPolicy))
                .catch((error) => {
                    summarizeButton.innerText = "Summarize Policy";
                    alert(`Failed to summarize the given privacy policy - ${error}`);
                });
        });
    };
});
