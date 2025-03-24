# 404 Not Found Test
GET http://localhost:8080/no-such-route

# We should get back an HTTP 1.1 404 response
HTTP/1.1 404

# Extra checks to perform against the response
[Asserts]
# Ensure the error object contains a message and code
jsonpath "$.error.message" == "not found"
jsonpath "$.error.code" == 404
