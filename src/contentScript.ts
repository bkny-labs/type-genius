console.log('collab broskizzzzz? 4');

// Add a keyup event listener to the document to log the value of the currently focused input or textarea
document.addEventListener("keyup", () => {
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    // Check if the activeElement is an input or textarea element
    if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
    console.log(activeElement.value);
    }
});
