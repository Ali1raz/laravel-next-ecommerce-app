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

### Verify Email

```http
POST /verify-code
Content-Type: application/json

{
    "email": "user@example.com",
    "code": "123456"
}
```

### Resend Verification Code

```http
POST /resend-verification-code
Content-Type: application/json

{
    "email": "user@example.com"
}
```

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

### Logout

```http
POST /logout
Authorization: Bearer {token}
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

### Dashboard

```http
GET /admin/dashboard
Authorization: Bearer {token}
```

### Role Management

#### List Roles

```http
GET /admin/roles
Authorization: Bearer {token}
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

#### Get Role

```http
GET /admin/roles/{id}
Authorization: Bearer {token}
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

#### Delete Role

```http
DELETE /admin/roles/{id}
Authorization: Bearer {token}
```

### Permission Management

#### List Permissions

```http
GET /admin/permissions
Authorization: Bearer {token}
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

#### Get Permission

```http
GET /admin/permissions/{id}
Authorization: Bearer {token}
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

#### Delete Permission

```http
DELETE /admin/permissions/{id}
Authorization: Bearer {token}
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

#### Remove Role from User

```http
POST /admin/users/remove-role
Authorization: Bearer {token}
Content-Type: application/json

{
    "user_id": 1
}
```

#### Get User's Role

```http
GET /admin/users/{userId}/role
Authorization: Bearer {token}
```

### User Management

#### List Users

```http
GET /admin/users
Authorization: Bearer {token}
```

Response:

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

Response:

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

#### Get User

```http
GET /admin/users/{id}
Authorization: Bearer {token}
```

Response:

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

Response:

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

#### Delete User

```http
DELETE /admin/users/{id}
Authorization: Bearer {token}
```

Response:

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

## Buyer Endpoints

### Dashboard

```http
GET /buyer/dashboard
Authorization: Bearer {token}
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
