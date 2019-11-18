import { Analytics } from "/lib/segment-api.mjs";
// import { isReplaced } from '/utils/env.mjs';
import { hexString, digestMessage } from "/utils/crypto.mjs";
import { Logger } from "/lib/logging.mjs";
// import { BRAND, VERSION } from '/lib/constants.mjs';

const SEGMENT_API_URL = "https://api.segment.io";
const SEGMENT_WRITE_KEY = "";

const logger = new Logger("segment");

let segmentApi;
let segmentUserId;

export function isEnabled() {
  return true; //isReplaced(SEGMENT_WRITE_KEY);
}

function init() {
  if (!isEnabled()) {
    logger.warn("Telemetry disabled, API key missing");
    return;
  }

  try {
    segmentApi = new Analytics(SEGMENT_WRITE_KEY, { host: SEGMENT_API_URL });
  } catch (e) {
    logger.error("init failed", e);
  }
}

async function _setUserId(email) {
  if (!email) {
    segmentUserId = undefined;
    return;
  }

  const userHash = hexString(await digestMessage(email));
  // Set user id only if it has changed. It's volatile on purpose. On every page
  // load the `identify` message is sent to Segment.
  // https://segment.com/docs/spec/identify/
  if (userHash === segmentUserId) {
    return;
  }

  logger.verbose(`setting user to ${userHash}`);
  segmentUserId = userHash;

  if (segmentApi) {
    segmentApi.identify({
      userId: userHash
      // traits: {
      //   brand: BRAND,
      //   version: VERSION
      // }
    });
  }
}

export function setUserId(email) {
  _setUserId(email).catch(logger.error);
}

async function trackEvent(event, properties) {
  try {
    if (!segmentUserId) {
      logger.debug("trying to track event without user!");
      return;
    }

    logger.debug(
      `tracking event ${event} with properties: ${JSON.stringify(properties)}`
    );
    if (segmentApi) {
      segmentApi.track({
        userId: segmentUserId,
        event,
        properties
      });
    }
  } catch (e) {
    logger.error(e);
  }
}

function tr(event, properties) {
  return () => trackEvent(event, properties);
}

export const track = {
  login: tr("login"),
  callContact: tr("call_contact"),
  logout: tr("logout"),
  toggleDnd: tr("dnd_toggle"),
  updateAvailability: tr("availability_update"),
  clickedToDial: tr("click_to_dial")
};

init();
