import '../components/c-click-to-dial-button.mjs';

import { Logger } from '../lib/logging.mjs';
import { Walker } from './walker.js';

import parsers from './parser.js';
import browser from '../vendor/browser-polyfill.js';

const logger = new Logger('observer');

/**
 * The Observer module. Injected in all tabs and all its frames.
 */
export class ObserverModule {
  constructor() {
    this.hasUI = false;
    this.parsers = [parsers];
    this.walker = new Walker();
    // Search and insert icons after mutations.
    this.observer = null;
    this.handleMutationsTimeout = null;
    this.parkedNodes = [];

    document.body.addEventListener('click', e => {
      if (e.target.nodeName === 'A' && e.target.href.substring(0, 4) === 'tel:') {
        // Don't do anything with this click in the actual page.
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Shift away focus from the window.
        window.blur();

        const bNumber = e.target.href.substring(4);
        browser.runtime.sendMessage(null, { b_number: bNumber }).then(() => {
          logger.info(`Trying to call ${bNumber}`);
        });
      }
    });
  }

  doInsert(root) {
    let pause = !!root;
    if (pause) this.stopObserver();
    root = root || document.body;

    // Walk the DOM looking for elements to parse, but block reasonably
    // sized pages to prevent locking the page.
    let childrenLength = root.querySelectorAll('*').length; // no lookup costs
    if (childrenLength < 2001) {
      logger.debug(`${this}scanning ${childrenLength} elements`);
      this.walker.walkTheDOM(root, currentNode => {
        // Scan using every available parser.
        this.parsers.forEach(localeParser => {
          let parser = localeParser;
          // Transform Text node to HTML-capable node, to
          // - deal with html-entities (&nbsp;, &lt;, etc.) since
          // they mess up the start/end from matches when reading
          // from node.data, and
          // - enable inserting the icon html
          // (doesn't work with a text node)
          let replacementNode = document.createElement('span');
          let originalHTML = this.escapeHTML(currentNode.data);

          let matches = parser().parse(originalHTML);
          if (matches.length) {
            if (
              !parser().isBlockingNode(currentNode.previousElementSibling) &&
              !parser().isBlockingNode(currentNode.parentNode.previousElementSibling)
            ) {
              matches.reverse().forEach(match => {
                let numberIconElement = document.createElement('c-click-to-dial-button');
                let before = document.createElement('span');
                before.textContent = originalHTML.slice(0, match.start);
                let after = document.createElement('span');
                after.textContent = originalHTML.slice(match.end);
                let originalNumber = document.createElement('span');
                originalNumber.textContent = originalHTML.slice(match.start, match.end);

                numberIconElement.contactDetails = match.number;
                replacementNode.appendChild(before);
                replacementNode.appendChild(originalNumber);
                replacementNode.appendChild(numberIconElement);
                replacementNode.appendChild(after);
              });
              currentNode.parentNode.insertBefore(replacementNode, currentNode);
              currentNode.parentNode.removeChild(currentNode);
            }
          }
        });
      });
    } else {
      logger.debug(`${this}not scanning ${childrenLength} elements`);
    }

    if (pause) {
      this.observePage();
    }
  }

  /**
   * Injects icons in the page and start observing the page for changes.
   */
  processPage() {
    logger.debug(`${this}start observing`);
    // Insert icons.
    const before = new Date().getTime();
    this.doInsert();
    logger.debug(`${this}doInsert (processPage) took`, new Date().getTime() - before);
    // Start listening to DOM mutations.
    this.observePage();
  }

  /**
   * Escape HTML chars when assigning text to innerHTML.
   * @param {String} str - The string to escape html from.
   * @returns {String} - The HTML escaped string.
   */
  escapeHTML(str) {
    const replacements = {
      '"': '&quot;',
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    };
    return str.replace(/[&"<>]/g, m => replacements[m]);
  }

  /**
   * Process parked DOM mutations.
   */
  handleMutations() {
    // Copy and clear parkedNodes.
    let _parkedNodes = this.parkedNodes.slice();
    this.parkedNodes = [];
    // Handle mutations if it probably isn't too much to handle
    // (current limit is totally random).
    if (_parkedNodes.length < 151) {
      logger.debug(`${this}processing ${_parkedNodes.length} parked nodes.`);
      let batchSize = 40; // random size
      for (let i = 0; i < Math.ceil(_parkedNodes.length / batchSize); i++) {
        (index => {
          setTimeout(() => {
            for (let j = index * batchSize; j < (index + 1) * batchSize; j++) {
              let node = _parkedNodes[j];
              let stillInDocument = document.contains(node); // no lookup costs
              if (stillInDocument) {
                let before = new Date().getTime();
                this.doInsert(node);
                logger.debug(`${this}doInsert (handleMutations) took`, new Date().getTime() - before);
              } else {
                logger.debug(`${this}doInsert (handleMutations) took 0 - removed node`);
              }
            }
          }, 0); // Push back execution to the end on the current event stack.
        })(i);
      }
    }
  }

  /**
   * Observer start: listen for DOM mutations and let `handleMutations`
   * process them.
   */
  observePage() {
    if (!this.observer) {
      this.observer = new MutationObserver(mutations => {
        if (this.handleMutationsTimeout) {
          // Don't handle the mutations yet after all.
          clearTimeout(this.handleMutationsTimeout);
        }

        mutations.forEach(mutation => {
          // Filter mutations to park.
          if (mutation.addedNodes.length) {
            Array.from(mutation.addedNodes).forEach((index, addedNode) => {
              if (!this.walker.skipNode(addedNode)) {
                this.parkedNodes.push(addedNode);
              }
            });
          } else if (!mutation.removedNodes.length && mutation.target) {
            if (!this.walker.skipNode(mutation.target)) {
              this.parkedNodes.push(mutation.target);
            }
          }
        });

        // Assuming nothing happens, scan the nodes in 500 ms - after
        // this the page should've been done dealing with the mutations.
        if (this.parkedNodes.length) {
          this.handleMutationsTimeout = setTimeout(this.handleMutations.bind(this), 500);
        }
      });
    }

    if (this.observer) {
      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  /**
   * Observer stop: simply stop listening to DOM mutations.
   */
  stopObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  /**
   * Restore the original numbers by replacing all ctd nodes with a new
   * text node containing the phonenumber.
   */
  restorePhonenumbers() {
    document.querySelectorAll('c-click-to-dial-wrapper').forEach(el => {
      el.parentNode.replaceChild(document.createTextNode(el.textContent), el);
    });
  }
}
