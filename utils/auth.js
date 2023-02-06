const Buffer = require('buffer').Buffer;

function BasicAuth(header) {
  if (!header) throw new Error('Authorization header is missing auth.js');
  const [type, payload] = header.split(' ');
  if (type !== 'Basic') throw new Error('Authorization header is not of type Basic auth.js');
  const [username, password] = Buffer.from(payload, 'base64').toString().split(':');
  if (!username || !password) throw new Error('Invalid authorization header - auth.js');
  return { username, password };
}

module.exports = { BasicAuth };
