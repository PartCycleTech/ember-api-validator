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

  assert.equal(validator.buildResponseStatus(), '200', 'buildResponseStatus returns correct value');
  assert.deepEqual(
    validator.buildResponseBody(),
    { "hello": "world" },
    'buildResponseBody returns correct value'
  );
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

  assert.equal(validator.buildResponseStatus(), '404', 'buildResponseStatus returns correct value');
  assert.deepEqual(
    validator.buildResponseBody({ flexParams: { "hello.world": "952" } }),
    { "hello": { "world": "952" } },
    'buildResponseBody returns correct value'
  );
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

  assert.equal(validator.buildResponseStatus(), '500', 'buildResponseStatus returns correct value');
  assert.deepEqual(
    validator.buildResponseBody({ flexParams: { "hello.world": "" } }),
    fixture.response.body,
    'buildResponseBody returns correct value'
  );
});

test('with links', function(assert) {
  let fixture = {
    "request": {
      "body": {
        "fred": {
          "flintstone": "foo"
        }
      }
    },
    "response": {
      "body": {
        "data": {
          "id": "3",
          "type": "orders",
          "links": {
            "self": "http://www.example.com/api/orders/123"
          },
          "relationships": {
            "credit-card": {
              "links": {
                "self": "http://www.example.com/api/orders/123/relationships/credit-card",
                "related": "http://www.example.com/api/orders/123/credit-card"
              }
            }
          }
        },
        "included": [
          {
            "id": "9",
            "type": "credit-cards",
            "links": {
              "self": "http://www.example.com/api/credit-cards/9"
            },
            "relationships": {
              "credit-card": {
                "links": {
                  "self": "http://www.example.com/api/orders/123/relationships/credit-card",
                  "related": "http://www.example.com/api/orders/123/credit-card"
                }
              }
            }
          }
        ]
      },
      "status": "200"
    }
  };
  let expectedBody = {
    "data": {
      "id": "3",
      "type": "orders",
      "relationships": {
        "credit-card": {}
      }
    },
    "included": [
      {
        "id": "9",
        "type": "credit-cards",
        "relationships": {
          "credit-card": {}
        }
      }
    ]
  }
  let validator = new ApiValidator({ fixture });

  assert.deepEqual(
    validator.buildResponseBody({ flexParams: { "hello.world": "" } }),
    expectedBody,
    'buildResponseBody returns correct value'
  );
});
