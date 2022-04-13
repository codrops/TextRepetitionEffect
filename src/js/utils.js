/**
 * Preload fonts
 * @param {String} id
 */
const preloadFonts = id => {
    return new Promise((resolve) => {
        WebFont.load({
            typekit: {
                id: id
            },
            active: resolve
        });
    });
};

/**
 * Gets the height of an element without counting with the padding
 * @param {Element} el
 */
const getHeight = el => {
    const computedStyle = getComputedStyle(el);

    let elementHeight = el.clientHeight;  // height with padding
    elementHeight -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
    return elementHeight;
}

export {
    preloadFonts,
    getHeight
};