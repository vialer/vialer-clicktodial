import { execSync } from 'child_process';
import pkg from '../../package.json';

/**
 * Return a string containing the latest version of the app and
 * the short hash of the latest commit.
 * @returns {string} - the formatted string.
 */
export default function getLatestVersionString() {
  try {
    const hash = execSync('git rev-parse --short HEAD')
          .toString()
          .trim();
    const release = pkg.config.release_stage;
    const version = pkg.version;
    return `${release} ${version} (${hash})`;
  } catch (err) {
    // TODO this catch is only for the Docker, which doesn't have the git meta
    // files. However, for the Docker the version could be pre-computed and put in
    // the environment somewhere.
    return 'unknown version';
  }
}
