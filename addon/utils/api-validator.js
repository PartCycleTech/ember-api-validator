import _ from 'lodash';

function isValidId(value) {
  return !_.isEmpty(value);
}

function removeLinksFromRelationships(record) {
  let relationships = _.get(record, "relationships") || {};
  _.keys(relationships).forEach((key) => {
    if (relationships[key]["links"]) {
      delete relationships[key]["links"];
    }
  });
}

function removeLinks(response) {
  if (_.get(response, "data.links")) {
    delete _.get(response, "data")["links"];
  }
  removeLinksFromRelationships(response["data"]);

  let included_arr = _.get(response, "included") || [];
  included_arr.forEach((included_record) => {
    if (included_record["links"]) {
      delete included_record["links"];
    }
    removeLinksFromRelationships(included_record);
  });
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
  removeLinks(response);
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
