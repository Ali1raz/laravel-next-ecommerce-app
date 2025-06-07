# Shopping App API Documentation

## Base URL

```
http://your-domain.com/api
```

## Authentication

All API endpoints (except public ones) require authentication using Laravel Sanctum tokens.

### Register

```http
POST /register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "user@example.com",
    "password": "password",
    "password_confirmation": "password"
}
```

Response (201 Created):

```json
{
    "message": "Registration successful. Please check your email for verification code.",
    "email": "user@example.com"
}
```

A 6-digit code is sent to email which is used to register account.

Validation Rules:

-   name: required, string, max 255 characters
-   email: required, valid email, max 255 characters, unique
-   password: required, string, min 8 characters, must be confirmed

### Verify Email

```http
POST /verify-code
Content-Type: application/json

{
    "email": "user@example.com",
    "code": "123456"
}
```

Response (200 OK):

```json
{
    "message": "Email verified successfully"
}
```

Error Response (400 Bad Request):

```json
{
    "message": "Invalid or expired verification code"
}
```

Validation Rules:

-   email: required, valid email
-   code: required, string, exactly 6 characters

### Resend Verification Code

```http
POST /resend-verification-code
Content-Type: application/json

{
    "email": "user@example.com"
}
```

Response (200 OK):

```json
{
    "message": "New verification code sent to your email"
}
```

Error Response (404 Not Found):

```json
{
    "message": "User not found or already verified"
}
```

Validation Rules:

-   email: required, valid email

### Login

(must verify email before login)

```http
POST /login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password"
}
```

Response (200 OK):

```json
{
    "message": "Login successful",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "user@example.com",
        "email_verified_at": "2024-03-20T10:00:00.000000Z",
        "role": "buyer"
    },
    "token": "access_token_here"
}
```

Error Responses:

-   401 Unauthorized:

```json
{
    "message": "Invalid credentials"
}
```

-   403 Forbidden:

```json
{
    "message": "Please verify your email address first.",
    "email": "user@example.com"
}
```

Validation Rules:

-   email: required, valid email
-   password: required, string, min 8 characters

### Logout

```http
POST /logout
Authorization: Bearer {token}
```

Response (200 OK):

```json
{
    "message": "Logged out"
}
```

### Forgot Password

```http
POST /forgot-password
Content-Type: application/json

{
    "email": "user@example.com"
}
```

### Reset Password

```http
POST /reset-password
Content-Type: application/json

{
    "email": "user@example.com",
    "token": "reset_token",
    "password": "new_password",
    "password_confirmation": "new_password"
}
```

## Admin Endpoints

All admin endpoints require the 'admin' role and authentication token.

### Dashboard

```http
GET /admin/dashboard
Authorization: Bearer {token}
```

Response (200 OK):

```json
{
    "status": "success",
    "data": {
        "analytics": {
            "total_users": 123,
            "total_roles": 3,
            "total_permissions": 15,
            "users_by_role": [
                {
                    "name": "admin",
                    "total": 1
                },
                {
                    "name": "seller",
                    "total": 45
                },
                {
                    "name": "buyer",
                    "total": 73
                }
            ]
        },
        "recent_users": [
            {
                "id": 123,
                "name": "John Doe",
                "email": "john@example.com",
                "roles": [
                    {
                        "id": 1,
                        "name": "buyer"
                    }
                ]
            }
        ]
    }
}
```

Error Response (500 Internal Server Error):

```json
{
    "status": "error",
    "message": "Failed to fetch dashboard data",
    "error": "Error details"
}
```

### Role Management

#### List Roles

```http
GET /admin/roles
Authorization: Bearer {token}
```

Response (200 OK):

```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "admin",
            "permissions": [
                {
                    "id": 1,
                    "name": "manage-users"
                }
            ]
        }
    ]
}
```

#### Create Role

```http
POST /admin/roles
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "editor"
}
```

Response (201 Created):

```json
{
    "status": "success",
    "message": "Role created successfully",
    "data": {
        "id": 2,
        "name": "editor",
        "permissions": []
    }
}
```

Validation Rules:

-   name: required, string, unique

#### Get Role

```http
GET /admin/roles/{id}
Authorization: Bearer {token}
```

Response (200 OK):

```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "admin",
        "permissions": [
            {
                "id": 1,
                "name": "manage-users"
            }
        ]
    }
}
```

#### Update Role

```http
PUT /admin/roles/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "senior-editor"
}
```

Response (200 OK):

```json
{
    "status": "success",
    "message": "Role updated successfully",
    "data": {
        "id": 1,
        "name": "senior-editor",
        "permissions": [
            {
                "id": 1,
                "name": "manage-users"
            }
        ]
    }
}
```

Validation Rules:

-   name: required, string, unique

#### Delete Role

```http
DELETE /admin/roles/{id}
Authorization: Bearer {token}
```

Response (200 OK):

```json
{
    "status": "success",
    "message": "Role deleted successfully"
}
```

### Permission Management

#### List Permissions

```http
GET /admin/permissions
Authorization: Bearer {token}
```

Response (200 OK):

```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "name": "manage-users"
        }
    ]
}
```

#### Create Permission

```http
POST /admin/permissions
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "edit-posts"
}
```

Response (201 Created):

```json
{
    "status": "success",
    "message": "Permission created successfully",
    "data": {
        "id": 2,
        "name": "edit-posts"
    }
}
```

Validation Rules:

-   name: required, string, unique

#### Get Permission

```http
GET /admin/permissions/{id}
Authorization: Bearer {token}
```

Response (200 OK):

```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "manage-users"
    }
}
```

#### Update Permission

```http
PUT /admin/permissions/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "manage-posts"
}
```

Response (200 OK):

```json
{
    "status": "success",
    "message": "Permission updated successfully",
    "data": {
        "id": 1,
        "name": "manage-posts"
    }
}
```

Validation Rules:

-   name: required, string, unique

#### Delete Permission

```http
DELETE /admin/permissions/{id}
Authorization: Bearer {token}
```

Response (200 OK):

```json
{
    "status": "success",
    "message": "Permission deleted successfully"
}
```

#### Assign Permissions to Role

```http
POST /admin/permissions/assign-to-role
Authorization: Bearer {token}
Content-Type: application/json

{
    "role_id": 1,
    "permission_ids": [1, 2, 3]
}
```

Response (200 OK):

```json
{
    "status": "success",
    "message": "Permissions assigned to role successfully"
}
```

Validation Rules:

-   role_id: required, exists in roles table
-   permission_ids: required, array of existing permission IDs

#### Remove Permissions from Role

```http
POST /admin/permissions/remove-from-role
Authorization: Bearer {token}
Content-Type: application/json

{
    "role_id": 1,
    "permission_ids": [1, 2]
}
```

Response (200 OK):

```json
{
    "status": "success",
    "message": "Permissions removed from role successfully"
}
```

Validation Rules:

-   role_id: required, exists in roles table
-   permission_ids: required, array of existing permission IDs

### User Role Management

#### Assign Role to User

```http
POST /admin/users/assign-role
Authorization: Bearer {token}
Content-Type: application/json

{
    "user_id": 1,
    "role_id": 1
}
```

Response (200 OK):

```json
{
    "status": "success",
    "message": "Role assigned to user successfully"
}
```

Validation Rules:

-   user_id: required, exists in users table
-   role_id: required, exists in roles table

#### Remove Role from User

```http
POST /admin/users/remove-role
Authorization: Bearer {token}
Content-Type: application/json

{
    "user_id": 1
}
```

Response (200 OK):

```json
{
    "status": "success",
    "message": "Role removed from user successfully"
}
```

Validation Rules:

-   user_id: required, exists in users table

#### Get User's Role

```http
GET /admin/users/{userId}/role
Authorization: Bearer {token}
```

Response (200 OK):

```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "admin",
        "permissions": [
            {
                "id": 1,
                "name": "manage-users"
            }
        ]
    }
}
```

### User Management

#### List Users

```http
GET /admin/users
Authorization: Bearer {token}
```

Response (200 OK):

```json
{
    "status": "success",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "email_verified_at": "2024-03-20T10:00:00.000000Z",
                "roles": [
                    {
                        "id": 1,
                        "name": "buyer"
                    }
                ]
            }
        ],
        "per_page": 10,
        "total": 1
    }
}
```

#### Create User

```http
POST /admin/users
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password",
    "password_confirmation": "password",
    "role": "buyer"
}
```

Response (201 Created):

```json
{
    "status": "success",
    "message": "User created successfully",
    "data": {
        "id": 2,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "email_verified_at": "2024-03-20T10:00:00.000000Z",
        "roles": [
            {
                "id": 1,
                "name": "buyer"
            }
        ]
    }
}
```

Validation Rules:

-   name: required, string, max 255 characters
-   email: required, valid email, max 255 characters, unique
-   password: required, string, min 8 characters, must be confirmed
-   role: required, string, exists in roles table

#### Get User

```http
GET /admin/users/{id}
Authorization: Bearer {token}
```

Response (200 OK):

```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "email_verified_at": "2024-03-20T10:00:00.000000Z",
        "roles": [
            {
                "id": 1,
                "name": "buyer"
            }
        ]
    }
}
```

#### Update User

```http
PUT /admin/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "John Updated",
    "email": "john.updated@example.com",
    "password": "new_password",
    "password_confirmation": "new_password",
    "role": "seller"
}
```

Response (200 OK):

```json
{
    "status": "success",
    "message": "User updated successfully",
    "data": {
        "id": 1,
        "name": "John Updated",
        "email": "john.updated@example.com",
        "email_verified_at": "2024-03-20T10:00:00.000000Z",
        "roles": [
            {
                "id": 2,
                "name": "seller"
            }
        ]
    }
}
```

Validation Rules:

-   name: required, string, max 255 characters
-   email: required, valid email, max 255 characters, unique (except for current user)
-   password: optional, string, min 8 characters, must be confirmed if provided
-   role: required, string, exists in roles table

#### Delete User

```http
DELETE /admin/users/{id}
Authorization: Bearer {token}
```

Response (200 OK):

```json
{
    "status": "success",
    "message": "User deleted successfully"
}
```

Note: Admins cannot delete their own account. Attempting to do so will result in a 403 Forbidden response.

## Seller Endpoints

### Dashboard

```http
GET /seller/dashboard
Authorization: Bearer {token}
```

Response (200 OK):

```json
{
    "message": "Hello Seller"
}
```

## Buyer Endpoints

### Dashboard

```http
GET /buyer/dashboard
Authorization: Bearer {token}
```

Response (200 OK):

```json
{
    "message": "Hello Buyer"
}
```

## Response Format

All API responses follow this format:

```json
{
    "status": "success|error",
    "message": "Optional message",
    "data": {
        // Response data
    }
}
```

## Error Responses

```json
{
    "status": "error",
    "message": "Error message",
    "errors": {
        // Validation errors
    }
}
```

## Status Codes

-   200: Success
-   201: Created
-   400: Bad Request
-   401: Unauthorized
-   403: Forbidden
-   404: Not Found
-   422: Validation Error
-   500: Server Error

## Rate Limiting

API requests are limited to 60 requests per minute per IP address.

## CORS

The API supports CORS and can be accessed from any origin.

## Security

-   All endpoints (except public ones) require authentication
-   Tokens expire after 30 days
-   Passwords are hashed using bcrypt
-   CSRF protection is disabled for API routes
