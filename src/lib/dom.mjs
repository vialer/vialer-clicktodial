
export function  toggleVisibility(node) {
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
  