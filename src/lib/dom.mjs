
export function toggleVisibility(node) {
    if (node.hasAttribute("hidden")) {
        node.removeAttribute("hidden");
    } else {
        node.setAttribute("hidden", "");
    }
}

export function empty(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}


export function getFormValues(form) {
    return Array.from(form).reduce((prev, { name, value }) => {
        if (name && value) {
            return Object.assign(prev, {
                [name]: value
            });
        } else {
            return prev;
        }
    }, {});
}
