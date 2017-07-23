import { ApiValidator } from 'api-validator/utils/api-validator';
import { module, test } from 'qunit';

module('Unit | Utility | api validator');

test('with simple fixture', function(assert) {
  let requestBody = { "fred": "flintstone" };
  let fixture = {
    "request": {
      "body": {
        "fred": "flintstone"
      }
    },
    "response": {
      "body": {
        "hello": "world"
      },
      "status": "200"
    }
  };
  let validator = new ApiValidator({ fixture });

  validator.verifyRequest({
    requestBody,
    callback: ({ expectedBody }) => {
      assert.deepEqual(
        expectedBody,
        requestBody,
        'verifyRequest sends correct expected body to callback'
      )
    }
  });

  validator.buildResponse({
    callback: ({ response, status }) => {
      assert.equal(status, '200', 'buildResponse sends correct status to callback');
      assert.deepEqual(
        response,
        { "hello": "world" },
        'buildResponse sends correct response to callback'
      );
    }
  });
});

test('with flex params in fixture and valid substitutions', function(assert) {
  let requestBody = {
    "fred": {
      "flintstone": "11"
    }
  };
  let fixture = {
    "request": {
      "body": {
        "fred": {
          "flintstone": "@id"
        }
      }
    },
    "response": {
      "body": {
        "hello": {
          "world": "@id"
        }
      },
      "status": "404"
    }
  };
  let validator = new ApiValidator({ fixture });

  validator.verifyRequest({
    requestBody,
    flexParams: ['fred.flintstone'],
    callback: ({ expectedBody }) => {
      assert.deepEqual(
        expectedBody,
        requestBody,
        'sends correct expected body to callback'
      );
    }
  });

  validator.buildResponse({
    flexParams: { "hello.world": "952" },
    callback: ({ response, status }) => {
      assert.equal(status, '404', 'buildResponse sends correct status to callback');
      assert.deepEqual(
        response,
        { "hello": { "world": "952" } },
        'buildResponse sends correct response to callback'
      );
    }
  });
});

test('with flex params in fixture but invalid substitutions', function(assert) {
  let requestBody = {
    "fred": {
      "flintstone": ""
    }
  };
  let fixture = {
    "request": {
      "body": {
        "fred": {
          "flintstone": "@id"
        }
      }
    },
    "response": {
      "body": {
        "hello": {
          "world": "@id"
        }
      },
      "status": "500"
    }
  };
  let validator = new ApiValidator({ fixture });

  validator.verifyRequest({
    requestBody,
    flexParams: ['fred.flintstone'],
    callback: ({ expectedBody }) => {
      assert.deepEqual(
        expectedBody,
        fixture.request.body,
        'sends correct expected body to callback'
      );
    }
  });

  validator.buildResponse({
    flexParams: { "hello.world": "" },
    callback: ({ response, status }) => {
      assert.equal(status, '500', 'buildResponse sends correct status to callback');
      assert.deepEqual(
        response,
        fixture.response.body,
        'buildResponse sends correct response to callback'
      );
    }
  });
});
