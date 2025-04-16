# 1. POST a new JSON fragment to http://localhost:8080 as an authorized user. 
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
`{"service": "DynamoDB"}`

# 2. Confirm that the server returns a 201, and capture the Location header value to a variable named url
HTTP/1.1 201

[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragments.id" matches "^([0-9a-fA-F]{32}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$"
jsonpath "$.fragments.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragments.created" isString
jsonpath "$.fragments.updated" isString
jsonpath "$.fragments.type" == "application/json"
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragments.id"


# 3. GET the fragment you just created using the url as an authorized user.
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1


HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment1_id}}
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString





#4 Post a Second Markdown Fragment as the same user
POST http://localhost:8080/v1/fragments
Content-Type:  text/markdown
[BasicAuth]
user1@email.com:password1
`DynamoDB is **great**.`




# 5 Confirm that the server returns a 201
HTTP/1.1 201

[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragments.id" matches "^([0-9a-fA-F]{32}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$"
jsonpath "$.fragments.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragments.created" isString
jsonpath "$.fragments.updated" isString
jsonpath "$.fragments.type" == "text/markdown"
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragments.id"



# 6. GET the fragment you just created using the url as an authorized user.
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1


HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment2_id}}
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString





#7 GET all of the fragments for the same authorized user without expanding them 
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

# We expect to get back an HTTP 200
HTTP/1.1 200

#  confirm that the list of fragments includes the two id 
[Asserts]
jsonpath "$.fragments" includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}

# 8. DELETE the first fragment
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

# We expect to get back an HTTP 200
HTTP/1.1 200

# 10. Try to GET the first fragment again using the url as an authorized user.
GET {{fragment1_url}}

[BasicAuth]
user1@email.com:password1

# 11. Confirm that the server returns error
HTTP/1.1 404

# 12. GET all of the fragments for the same authorized user without expanding them
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

# We expect to get back an HTTP 200
HTTP/1.1 200

# confirm that the first id is NOT included but that the second id is
[Asserts]
jsonpath "$.fragments" not includes "{{fragment1_id}}"
jsonpath "$.fragments" includes {{fragment2_id}}