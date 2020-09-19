/* eslint-disable no-unused-vars */
import Stream from 'stream';

export const successfulResponseMock = {
  config: {
    url: 'test.png'
  }
};

export const failedResponseMock = {
  response: {}
};

export const getResolvedMock = (url, options) => {
  return new Promise((resolve, reject) => {
    resolve({
      ...successfulResponseMock,
      data: options.responseType === 'stream' ? new Stream() : {}
    });
  });
};

export const getRejectedMock = (url, options) => {
  return new Promise((resolve, reject) => {
    reject({
      ...failedResponseMock
    });
  });
};

export default {
  get: jest.fn(getResolvedMock)
};
