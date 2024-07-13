"use strict";
const MAX_PLAYBACK_RATE = 5;
const MIN_PLAYBACK_RATE = 0.1;
const PLAYBACK_UPDATE_STEP = 0.1;
const HIJACKED_KEYS = [",", ".", ")"];
const youtubeVideoElement = document.querySelector("video");
const showFinalPlaybackRateOnScreen = (playbackRate) => {
    const div = document.createElement("div");
    div.style.setProperty("position", "absolute");
    div.style.setProperty("top", "50%");
    div.style.setProperty("left", "50%");
    div.style.setProperty("transform", "translate(-50%, -50%)");
    div.style.setProperty("background", "black");
    div.style.setProperty("color", "white");
    div.style.setProperty("font-weight", "bold");
    div.style.setProperty("text-align", "center");
    div.style.setProperty("width", "150px");
    div.style.setProperty("height", "150px");
    div.style.setProperty("opacity", "0.75");
    div.style.setProperty("border-radius", "10px");
    div.style.setProperty("font-size", "3rem");
    div.style.setProperty("display", "flex");
    div.style.setProperty("justify-content", "center");
    div.style.setProperty("align-items", "center");
    div.innerText = `${playbackRate.toFixed(2)}x`;
    document.body.appendChild(div);
    setTimeout(() => {
        document.body.removeChild(div);
    }, 750);
};
const listener = (e) => {
    if (!HIJACKED_KEYS.includes(e.key))
        return;
    if (!youtubeVideoElement)
        return;
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();
    if (e.key === ")" && e.shiftKey) {
        youtubeVideoElement.playbackRate = 1;
        showFinalPlaybackRateOnScreen(youtubeVideoElement.playbackRate);
        return;
    }
    const currentPlaybackRate = youtubeVideoElement.playbackRate;
    if (currentPlaybackRate >= MAX_PLAYBACK_RATE || currentPlaybackRate < MIN_PLAYBACK_RATE)
        return;
    if (e.key === ".") {
        youtubeVideoElement.playbackRate = currentPlaybackRate + PLAYBACK_UPDATE_STEP;
    }
    else if (e.key === ",") {
        youtubeVideoElement.playbackRate = currentPlaybackRate - PLAYBACK_UPDATE_STEP;
    }
    showFinalPlaybackRateOnScreen(youtubeVideoElement.playbackRate);
};
document.addEventListener("keydown", listener);
//# sourceMappingURL=index.js.map