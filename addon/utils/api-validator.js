import _ from 'lodash';

function isValidId(value) {
  return !_.isEmpty(value);
}

function verifyRequest({ requestBody, flexParams, callback } = {}) {
  flexParams = flexParams || [];
  let expectedBody = _.cloneDeep(this.spec.request.body);
  flexParams.forEach((path) => {
    let expectedValue = _.get(expectedBody, path);
    let actualValue = _.get(requestBody, path);
    if (expectedValue === '@id') {
      if (isValidId(actualValue)) {
        _.set(expectedBody, path, actualValue);
      }
    }
  });
  callback({ expectedBody });
}

function buildResponseBody({ flexParams } = {}) {
  flexParams = flexParams || {};
  let response = _.cloneDeep(this.spec.response.body);
  _.keys(flexParams).forEach((path) => {
    let responseValue = _.get(response, path);
    let customValue = flexParams[path];
    if (responseValue === '@id') {
      if (isValidId(customValue)) {
        _.set(response, path, customValue);
      }
    }
  });
  return response;
}

function buildResponseStatus() {
  return this.spec.response.status;
}

function ApiValidator({ fixture }) {
  if (fixture) {
    this.spec = fixture;
  } else {
    throw new Error('ApiValidator: must pass in fixture');
  }
  this.verifyRequest = verifyRequest;
  this.buildResponseBody = buildResponseBody;
  this.buildResponseStatus = buildResponseStatus;
}

export { ApiValidator };
