
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

/**
 * hides a DOM node.
 * @param node - the node that needs to be hidden
 */
export function hide(n) {
    n.setAttribute('hidden', '');
  }
  
  /**
   * shows a DOM node.
   * @param node - the node that needs to be shown.
   */
  export function show(n) {
    n.removeAttribute('hidden');
  }

  /**
 * disables a DOM node.
 * @param node - the node that needs to be disabled.
 */
export function disable(n) {
    n.setAttribute('disabled', '');
  }
  
  /**
   * enable a DOM node.
   * @param node - the node that needs to be enabled.
   */
  export function enable(n) {
    n.removeAttribute('disabled');
  }
