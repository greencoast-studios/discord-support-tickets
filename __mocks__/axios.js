/* eslint-disable no-unused-vars */
import { PassThrough } from 'stream';

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
    data: options.responseType === 'stream' ? new PassThrough() : {}
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
