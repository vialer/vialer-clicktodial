import { Logger } from '/lib/logging.mjs';

const logger = new Logger('i18n');

export const availableLanguages = ['nl-NL', 'en-US']; // ['en-US', 'nl-NL' ];
export let chosenLanguage = null;

export async function setChosenLanguage() {
    let chosen = await browser.storage.local.get('chosenLanguage');
    chosenLanguage = Object.keys(chosen).length !== 0 ? chosen.chosenLanguage : availableLanguages[0]; // first as default
}

export function setTranslatedTextContent(node, key = node.dataset.translationKey) {
    return translate(key).then(text => {
        node.innerText = text;
    });
}

export function setTranslatedPlaceholder(node, key = node.dataset.placeholderTranslationKey) {
    return translate(key).then(text => {
        node.setAttribute('placeholder', text);
    });
}

export function translateNodes(node = document.body) {
    console.log(chosenLanguage)
    const collection = [];
    for (const n of node.querySelectorAll('[data-translation-key]')) {
        const { translationKey } = n.dataset;
        if (translationKey) {
            collection.push(setTranslatedTextContent(n, translationKey));
        }
    }

    for (const n of node.querySelectorAll('[data-placeholder-translation-key]')) {
        const { placeholderTranslationKey } = n.dataset;
        if (placeholderTranslationKey) {
            collection.push(setTranslatedPlaceholder(n, placeholderTranslationKey));
        }
    }
    return Promise.all(collection);
}

export function setLanguage(lng) {
    if (chosenLanguage === lng) {
        return Promise.resolve();
    }
    if (!availableLanguages.includes(lng)) {
        return Promise.reject(new Error(`unsupported language ${lng}`));
    }

    return new Promise(resolve => {
        document.documentElement.setAttribute('lang', lng);
        chosenLanguage = lng;
        browser.storage.local.set({ 'chosenLanguage': lng });
        Array.from(document.getElementsByTagName('c-translate')).forEach(t => {
            t.update();
        });
        Array.from(document.getElementsByTagName('c-language-switcher')).forEach(t => {
            t.update();
        });
        translateNodes();
        resolve(chosenLanguage);
    });
}
const cache = {};
function loadLocaleFile() {
    if (cache[chosenLanguage]) {
        return cache[chosenLanguage];
    }
    const p = fetch(`/locales/${chosenLanguage}/index.json`).then(r => r.json());

    cache[chosenLanguage] = p;
    return p;
}

export function translate(key) {
    return new Promise(resolve => {
        loadLocaleFile()
            .then(translations => {
                if (!(key in translations)) {
                    console.error(new Error(`undefined_translation key: ${key}`));
                    resolve(key);
                }
                resolve(translations[key]);
            })
            .catch(err => {
                console.error(err);
                resolve(key);
            });
    });
}
