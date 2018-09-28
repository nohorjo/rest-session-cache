# A simple server that stores session data that can be accessed using REST

## Endpoints

__NOTE all requests require query param__ `otp` __with the one-time-password created with__ [otplib](https://www.npmjs.com/package/otplib)

Type|Endpoint|params|Description
---|---|---|---
GET|/||Gets all sessions
GET|/`sid`|`sid`: session id|Gets a session
DELETE|/`sid`|`sid`: session id|Deletes a session
DELETE|/||Deletes all sessions
POST|/`sid`|`sid`: session id, `body`: the session data|Sets or creates a session. Data is merged.

## Environment params

* `PORT`: The port to run on
* `SECRET`: The secret to encrypt with
