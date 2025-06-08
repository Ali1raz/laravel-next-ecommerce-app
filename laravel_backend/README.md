# Shopping App API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

All endpoints except `/register`, `/login`, `/verify-code`, `/resend-verification-code`, `/forgot-password`, `/reset-password`, and `/ping` require authentication using Laravel Sanctum.

Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Endpoints

### Health Check

```http
GET /ping
```

Response:

```json
{
    "message": "pong"
}
```

### Authentication

#### Register

```http
POST /register
```

Request:

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

Response:

```json
{
    "message": "Registration successful. Please check your email for verification code.",
    "email": "john@example.com"
}
```

#### Login

```http
POST /login
```

if not verified email, use post <a href="#verify-code">verify-code first</a>:

```json
{
    "message": "Please verify your email address first.",
    "email": "john@example.com"
}
```

if verfified email already:

Request:

```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

Response:

```json
{
    "message": "Login successful",
    "user": {
        "id": 1,
        "name": "Name of user",
        "email": "john@example.com",
        "email_verified_at": "2025-06-07T03:15:22.000000Z",
        "created_at": "2025-06-07T03:15:22.000000Z",
        "updated_at": "2025-06-07T03:15:22.000000Z"
    },
    "token": "34|JKWBof9uxBKutDPdpt7TkAK7Ffe8GgtQNATXOa25afc404d6"
}
```

#### Verify Code

```http
POST /verify-code
```

Request:

```json
{
    "email": "john@example.com",
    "code": "123456"
}
```

#### Resend Verification Code

```http
POST /resend-verification-code
```

Request:

```json
{
    "email": "john@example.com"
}
```

#### Forgot Password

```http
POST /forgot-password
```

Request:

```json
{
    "email": "john@example.com"
}
```

Response:

```json
{
    "status": "success",
    "message": "Password reset code has been sent to your email"
}
```

#### Reset Password

```http
POST /reset-password
```

Request:

```json
{
    "email": "john@example.com",
    "code": "123456",
    "password": "newpassword123",
    "password_confirmation": "newpassword123"
}
```

Response:

```json
{
    "status": "success",
    "message": "Password has been reset successfully"
}
```

#### Logout

```http
POST /logout
```

### Profile

#### Get Profile

```http
GET /profile
```

Response:

```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com",
        "email_verified_at": "2025-06-07T03:15:22.000000Z",
        "roles": [
            {
                "id": 1,
                "name": "admin",
                "permissions": [
                    {
                        "id": 4,
                        "name": "view-products"
                    },
                    {
                        "id": 5,
                        "name": "add-products"
                    },
                    {
                        "id": 6,
                        "name": "delete-products"
                    }
                ]
            }
        ]
    }
}
```

#### Update Profile

```http
PUT /profile
```

Request:

```json
{
    "name": "John Updated",
    "email": "john.updated@example.com",
    "current_password": "current_password",
    "password": "new_password",
    "password_confirmation": "new_password"
}
```

### Products

#### List Products

```http
GET /products
```

Response:

```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "title": "Product 1",
            "description": "Description 1",
            "price": 99.99,
            "quantity": 10,
            "seller": {
                "id": 2,
                "name": "Seller Name",
                "email": "seller@example.com"
            }
        }
    ]
}
```

#### Get Product

```http
GET /products/{id}
```

Response:

```json
{
    "status": "success",
    "data": {
        "id": 1,
        "title": "Product 1",
        "description": "Description 1",
        "price": 99.99,
        "quantity": 10,
        "seller": {
            "id": 2,
            "name": "Seller Name",
            "email": "seller@example.com"
        }
    }
}
```

#### Create Product (Admin/Seller only)

```http
POST /admin/products
```

Request:

```json
{
    "title": "New Product",
    "description": "Product description",
    "price": 99.99,
    "quantity": 10
}
```

#### Update Product (Admin/Seller only)

```http
PUT /admin/products/{id}
```

Request:

```json
{
    "title": "Updated Product",
    "description": "Updated description",
    "price": 89.99,
    "quantity": 5
}
```

#### Delete Product (Admin/Seller only)

```http
DELETE /admin/products/{id}
```

### Cart

#### View Cart

```http
GET /cart
```

Response:

```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "quantity": 2,
            "product": {
                "id": 1,
                "title": "Product 1",
                "price": 99.99,
                "seller": {
                    "id": 2,
                    "name": "Seller Name"
                }
            }
        }
    ]
}
```

#### Add to Cart

```http
POST /cart/add
```

Request:

```json
{
    "product_id": 1,
    "quantity": 2
}
```

#### Remove from Cart

```http
POST /cart/remove
```

Request:

```json
{
    "product_id": 1
}
```

#### Update Cart Quantity

```http
PUT /cart/update-quantity
```

Request:

```json
{
    "product_id": 1,
    "quantity": 3
}
```

### Bills

#### List Bills

```http
GET /bills
```

Response:

```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "total_amount": 199.98,
            "created_at": "2024-03-19T12:00:00Z",
            "items": [
                {
                    "id": 1,
                    "quantity": 2,
                    "price_at_time": 99.99,
                    "product": {
                        "id": 1,
                        "title": "Product 1",
                        "seller": {
                            "id": 2,
                            "name": "Seller Name"
                        }
                    }
                }
            ]
        }
    ]
}
```

#### Get Bill

```http
GET /bills/{id}
```

Response:

```json
{
    "status": "success",
    "data": {
        "id": 1,
        "total_amount": 199.98,
        "created_at": "2024-03-19T12:00:00Z",
        "items": [
            {
                "id": 1,
                "quantity": 2,
                "price_at_time": 99.99,
                "product": {
                    "id": 1,
                    "title": "Product 1",
                    "seller": {
                        "id": 2,
                        "name": "Seller Name"
                    }
                }
            }
        ]
    }
}
```

#### Checkout

```http
POST /checkout
```

## Error Responses

All error responses follow this format:

```json
{
    "status": "error",
    "message": "Error message here",
    "errors": {} // Optional validation errors
}
```

Common HTTP Status Codes:

-   200: Success
-   201: Created
-   400: Bad Request
-   401: Unauthorized
-   403: Forbidden
-   404: Not Found
-   422: Validation Error
-   500: Server Error

## Role-Based Access

-   **Admin**: Full access to all endpoints
-   **Seller**: Can manage their own products and use cart/bill features
-   **Buyer**: Can view products and use cart/bill features

### Role Management Restrictions

1. **Predefined Roles Only**

    - Only the seeded roles (admin, seller, buyer) are available
    - New roles cannot be created
    - Existing roles cannot be modified or deleted

2. **Role Assignment Rules**
    - Admins can assign roles to other users
    - Admins cannot change their own role
    - Admins cannot remove their own role
    - Users are automatically assigned the "buyer" role on first login after email verification

### Permission Naming Convention

When creating or updating permissions, the name will be automatically converted to a slug format:

-   All lowercase
-   Spaces replaced with dashes
-   No special characters

Example:

-   Input: "View Products" → Saved as: "view-products"
-   Input: "Add New Product" → Saved as: "add-new-product"
-   Input: "Delete User Account" → Saved as: "delete-user-account"
