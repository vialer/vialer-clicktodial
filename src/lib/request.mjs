const BASE = "https://partner.voipgrid.nl/api/";

const CONFIGS = {
  contacts: {
    method: 'GET',
    useToken: true,
    path: 'phoneaccount/basic/phoneaccount/?active=true&order_by=description'
  },
  user: {
    method: 'GET',
    useToken: true,
    path: 'plugin/user/'
  },
  autologin: {
    method: 'GET',
    useToken: true,
    path: 'autologin/token/'
  },
  queues: {
    method: 'GET',
    useToken: true,
    path: 'queuecallgroup/'
  },
  clickToDial: {
    method: 'POST',
    useToken: true,
    path: 'clicktodial/',
    headers: {
      'Content-type': 'application/json'
    }
  },
  callStatus: {
    method: 'GET',
    useToken: true,
    path: '/clicktodial/',
    setCallId: true
  },
  setDestination: {
    method: 'PUT',
    useToken: true,
    path: 'selecteduserdestination/',
    headers: {
      'Content-type': 'application/json'
    }
  },
  getDestination: {
    method: 'GET',
    useToken: true,
    path: 'selecteduserdestination/'
  },
  destinations: {
    method: 'GET',
    useToken: true,
    path: 'userdestination/'
  },
  login: {
    method: 'POST',
    path: 'permission/apitoken/',
    headers: {
      'Content-type': 'application/json'
    }
  }
};

function makeRequestObject(name, options) {
  let config;

  if (name in CONFIGS) {
    config = Object.assign({}, CONFIGS[name]);
  } else {
    throw new Error(`api config '${name}' not found`);
  }

  const requestOptions = Object.assign({ headers: {} }, config, options);

  if (requestOptions.useToken) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('unauthorised');
    }
    requestOptions.headers['authorization'] = token;
  }

  if (requestOptions.id) {
    requestOptions.path += `${requestOptions.id}/`;
  }

  // To be able to make a call.
  if (requestOptions.setCallId) {
    requestOptions.path += localStorage.getItem('callid');   
  }

  if (requestOptions.params) {
    const queryString = Object.keys(requestOptions.params)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(requestOptions.params[k]))
      .join('&');

    requestOptions.path += `?${queryString}`;
  }

  if (requestOptions.body && typeof requestOptions.body === 'object') {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  const url = `${BASE}${requestOptions.path}`;

  delete requestOptions.path;
  delete requestOptions.useToken;
  delete requestOptions.params;
  delete requestOptions.id;

  return { url, requestOptions };
}

async function responseHandler(response) {
  const { status } = response;
  let json;

  if (status === 400) {
    try {
      json = await response.json();
      return Promise.reject({
        status,
        url: response.url,
        statusText: response.statusText,
        body: json
      });
    } catch (err) {
      throw new Error('bad request');
    }
  }

  if (status === 401) {
    throw new Error('unauthorised');
  }

  if (status === 403) {
    const message = await response.text();
    throw new Error(message);
  }

  if (status === 404) {
    // not found
    return undefined;
  }

  if (status === 429) {
    throw new Error('too_many_requests');
  }

  if (status === 200 || status === 201) {
    try {
      json = await response.json();
      return json;
    } catch (err) {
      return {};
    }
  }
}

export default function request(name, options) {
  const { url, requestOptions } = makeRequestObject(name, options);
  return fetch(url, requestOptions).then(responseHandler);
}
