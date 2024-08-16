const LS_NAME = "myplaylists";
const DEBUG = true;

let initializedFromLS = false;

const log = (t: "info" | "warn" | "error", ...args: any[]) => {
    if (!DEBUG && t === "info") {
        return;
    }

    console[t]("[YT-SPEED]", ...args);
};

log("info", "YT-SPEED LOADED");

type Success = boolean;

const DEC_SPEED_CHAR = "[";
const INC_SPEED_CHAR = "]";
const RESET_SPEED_CHAR = ")";

const MAX_PLAYBACK_RATE = 5;
const MIN_PLAYBACK_RATE = 0.1;
const PLAYBACK_UPDATE_STEP = 0.1;
const HIJACKED_KEYS = [INC_SPEED_CHAR, DEC_SPEED_CHAR, RESET_SPEED_CHAR];

const speedText = document.createElement("div");
speedText.style.setProperty("position", "absolute");
speedText.style.setProperty("top", "50%");
speedText.style.setProperty("left", "50%");
speedText.style.setProperty("transform", "translate(-50%, -50%)");
speedText.style.setProperty("background", "black");
speedText.style.setProperty("color", "white");
speedText.style.setProperty("font-weight", "bold");
speedText.style.setProperty("text-align", "center");
speedText.style.setProperty("width", "150px");
speedText.style.setProperty("height", "150px");
speedText.style.setProperty("opacity", "0.75");
speedText.style.setProperty("border-radius", "10px");
speedText.style.setProperty("font-size", "3rem");
speedText.style.setProperty("display", "flex");
speedText.style.setProperty("justify-content", "center");
speedText.style.setProperty("align-items", "center");

let speedTextTimeout: number | null = null;

const showFinalPlaybackRateOnScreen = (playbackRate: number) => {
    speedText.innerText = `${playbackRate.toFixed(2)}x`;

    if (speedTextTimeout !== null) {
        window.clearTimeout(speedTextTimeout);
    } else {
        document.body.appendChild(speedText);
    }

    speedTextTimeout = window.setTimeout(() => {
        document.body.removeChild(speedText);
        speedTextTimeout = null;
    }, 750);
};

const listener = (e: KeyboardEvent) => {
    const youtubeVideoElement = document.querySelector("video");

    if (!HIJACKED_KEYS.includes(e.key)) {
        return;
    }

    log("info", "Pressed:", e.key);

    if (!youtubeVideoElement) {
        log("warn", "YouTube video element not found");
        return;
    }

    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    if (e.key === RESET_SPEED_CHAR) {
        log("info", "Setting playbackRate to: 1");
        youtubeVideoElement.playbackRate = 1;
        showFinalPlaybackRateOnScreen(youtubeVideoElement.playbackRate);
        return;
    }

    const currentPlaybackRate = youtubeVideoElement.playbackRate;

    if (e.key === INC_SPEED_CHAR && currentPlaybackRate + PLAYBACK_UPDATE_STEP <= MAX_PLAYBACK_RATE) {
        youtubeVideoElement.playbackRate = currentPlaybackRate + PLAYBACK_UPDATE_STEP;
    } else if (e.key === DEC_SPEED_CHAR && currentPlaybackRate - PLAYBACK_UPDATE_STEP >= MIN_PLAYBACK_RATE) {
        youtubeVideoElement.playbackRate = currentPlaybackRate - PLAYBACK_UPDATE_STEP;
    }

    log("info", "Setting playbackRate to:", currentPlaybackRate);

    showFinalPlaybackRateOnScreen(youtubeVideoElement.playbackRate);
};

const hoverDivStyles = (reset: boolean) => (e: MouseEvent) => {
    const div = e.target as HTMLDivElement | null;

    if (!div) return;

    if (!reset) {
        div.style.background = "var(--yt-spec-badge-chip-background)";
    } else {
        div.style.background = "transparent";
    }
};

const appendTheChild = (playlistUrl: string, playlistName: string, addToLs = true): Success => {
    log("info", "appendTheChild", { playlistUrl, playlistName, addToLs });

    const playlistTab = document.querySelector<HTMLDivElement>("#section-items");
    if (!playlistTab) return false;

    const child = playlistTab?.childNodes[0] as HTMLDivElement;
    if (!child) return false;

    const childAnchor = child.querySelector("a");
    if (!childAnchor) return false;

    const newChildDiv = document.createElement("div");
    newChildDiv.classList.add(...child.classList);

    newChildDiv.addEventListener("mouseover", hoverDivStyles(false));
    newChildDiv.addEventListener("mouseout", hoverDivStyles(true));

    for (const [key, value] of Object.entries(child.style)) {
        newChildDiv.style.setProperty(key, value);
    }

    const borderRadius = "10px";

    newChildDiv.style.borderRadius = borderRadius;
    newChildDiv.style.fontSize = "1.3rem";
    newChildDiv.style.boxSizing = "border-box";

    const newChildAnchor = document.createElement("a");
    newChildAnchor.classList.add(...childAnchor.classList);

    for (const [key, value] of Object.entries(childAnchor.style)) {
        newChildAnchor.style.setProperty(key, value);
    }

    newChildAnchor.style.boxSizing = "border-box";
    newChildAnchor.innerText = playlistName;
    newChildAnchor.href = playlistUrl;
    newChildAnchor.style.borderRadius = borderRadius;
    newChildAnchor.style.width = "100%";
    newChildAnchor.style.height = "100%";
    newChildAnchor.style.padding = "1rem 2rem";

    if (addToLs) {
        const myPlaylists = window.localStorage.getItem(LS_NAME);

        if (!myPlaylists) {
            window.localStorage.setItem(LS_NAME, JSON.stringify([{ playlistUrl, playlistName }]));
        } else {
            const old = JSON.parse(myPlaylists);
            window.localStorage.setItem(LS_NAME, JSON.stringify([...old, { playlistUrl, playlistName }]));
        }
    }

    newChildDiv.appendChild(newChildAnchor);
    playlistTab.appendChild(newChildDiv);

    return true;
};

const addPlaylistFromLS = (): Success => {
    const myPlaylistsFromLS = window.localStorage.getItem(LS_NAME);

    log("info", "DOMContentLoaded", { myPlaylistsFromLS });

    if (!myPlaylistsFromLS) return false;

    const myPlaylists = JSON.parse(myPlaylistsFromLS) as Playlist[];

    if (!myPlaylists) return true;

    for (const { playlistUrl, playlistName } of myPlaylists) {
        if (!appendTheChild(playlistUrl, playlistName, false)) {
            return false;
        }
    }

    return true;
};

document.addEventListener("keydown", listener);

// This refuses to work for some reason
// document.addEventListener("load", addPlaylistFromLS);

// @ts-ignore
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    log("info", "Received request", request);

    if (request.action === "addPlaylist") {
        const playlistName = request.name;
        const playlistId = request.id;

        appendTheChild(playlistId, playlistName);
    }
});

const addFromPlaylistInterval = setInterval(() => {
    if (initializedFromLS) {
        window.clearInterval(addFromPlaylistInterval);
        return;
    }

    initializedFromLS = addPlaylistFromLS();
}, 1000);
