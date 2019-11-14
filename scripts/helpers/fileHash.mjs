import { createReadStream } from 'fs';
import { createHash } from 'crypto';

// https://gist.github.com/GuillermoPena/9233069#gistcomment-2364896
// Algorithm depends on availability of OpenSSL on platform
// Example algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
export default function fileHash(filename, algorithm) {
  return new Promise((resolve, reject) => {
    const h = createHash(algorithm);
    try {
      const s = createReadStream(filename);
      s.on('data', function(data) {
        h.update(data);
      });
      s.on('end', function() {
        return resolve(h.digest('hex'));
      });
    } catch (error) {
      reject(error);
    }
  });
}
