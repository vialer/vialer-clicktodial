/**
 * takes a string as argument and returns a template with that string set as innerHTML.
 * @param templateString - the content of the template to set.
 * @returns {templateNode} - a template with the content set.
 */
export function createTemplate(templateString) {
  const template = document.createElement("template");
  template.innerHTML = templateString;
  return template;
}

const templateCache = new Map();
const templateTypeMapping = {
  c: "components",
  p: "pages"
};
export function loadTemplate(component) {
  if (templateCache.has(component)) {
    return Promise.resolve(templateCache.get(component));
  }
}

Array.from(document.querySelectorAll("template")).forEach(templateNode => {
  const { component } = templateNode.dataset;
  templateCache.set(component, templateNode);
});

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
  n.setAttribute("hidden", "");
}

/**
 * shows a DOM node.
 * @param node - the node that needs to be shown.
 */
export function show(n) {
  n.removeAttribute("hidden");
}

/**
 * returns true of the DOM node is hidden.
 * @param node - the node that needs to be checked.
 */
export function isHidden(n) {
  return n.hasAttribute("hidden");
}

/**
 * disables a DOM node.
 * @param node - the node that needs to be disabled.
 */
export function disable(n) {
  n.setAttribute("disabled", "");
}

/**
 * enable a DOM node.
 * @param node - the node that needs to be enabled.
 */
export function enable(n) {
  n.removeAttribute("disabled");
}

/**
 * select a DOM node.
 * @param node - the node that needs to be enabled.
 */
export function select(n) {
  n.setAttribute("selected", "");
}

const iconCache = new Map();
export function loadIcon(id) {
  if (iconCache.has(id)) {
    return Promise.resolve(iconCache.get(id));
  }

  const p = fetch(`${id}.svg`).then(r => {
    if (r.status !== 200) {
      return Promise.reject(new Error(`icon ${id} ${r.statusText}`));
    }

    return r.text().then(svg => {
      const template = document.createElement("template");
      template.innerHTML = svg;

      return template;
    });
  });
  iconCache.set(id, p);

  return p;
}
