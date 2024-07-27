type Playlist = { playlistUrl: string; playlistName: string };

const onClick = () => {
    console.log("clicked");

    const playlistIdInput = document.querySelector<HTMLInputElement>("#playlist-id-input");
    const playlistNameInput = document.querySelector<HTMLInputElement>("#playlist-name-input");

    console.log(playlistIdInput);
    console.log(playlistNameInput);


    const playlistUrl = playlistIdInput!.value;
    const playlistName = playlistNameInput!.value;

    // Send message to content script
    // @ts-ignore
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log(tabs);
        // @ts-ignore
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "addPlaylist",
            name: playlistName,
            id: playlistUrl,
        });
    });
};

document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector("#playlist-add-button");

    if (button) {
        button.addEventListener("click", onClick);
    }
});
