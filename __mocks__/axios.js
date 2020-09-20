/* eslint-disable no-unused-vars */
import Stream from 'stream';

export const successfulResponseMock = {
  config: {
    url: 'test.png'
  }
};

export const failedResponseMock = {
  response: {
    status: 500
  }
};

export const getResolvedMock = (url, options) => Promise.resolve(
  {
    ...successfulResponseMock,
    data: options.responseType === 'stream' ? new Stream() : {}
  }
);

export const getRejectedMock = (url, options) => Promise.reject(
  {
    ...failedResponseMock
  }
);

export default {
  get: jest.fn((url, options) => {
    if (url === 'invalid') {
      return getRejectedMock(url, options);
    }
    return getResolvedMock(url, options);
  })
};
