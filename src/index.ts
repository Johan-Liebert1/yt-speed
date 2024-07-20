const DEBUG = false;

const log = (t: "info" | "warn" | "error", ...args: any[]) => {
    if (DEBUG && t === "info") {
        return;
    }

    console[t]("[YT-SPEED]", ...args);
};

log("info", "YT-SPEED LOADED");

const DEC_SPEED_CHAR = "[";
const INC_SPEED_CHAR = "]";
const RESET_SPEED_CHAR = ")";

const MAX_PLAYBACK_RATE = 5;
const MIN_PLAYBACK_RATE = 0.1;
const PLAYBACK_UPDATE_STEP = 0.1;
const HIJACKED_KEYS = [INC_SPEED_CHAR, DEC_SPEED_CHAR, RESET_SPEED_CHAR];

let youtubeVideoElement = document.querySelector("video");

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
    if (!(youtubeVideoElement instanceof HTMLVideoElement)) {
        youtubeVideoElement = document.querySelector("video");
    }

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

document.addEventListener("keydown", listener);
