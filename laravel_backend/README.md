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

### Users

#### List Users

```
GET /admin/users
Authorization: Bearer {token}
```

Response

```json
{
    "status": "success",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "name": "Admin User",
                "email": "admin@example.com",
                "email_verified_at": "2025-06-07T19:08:28.000000Z",
                "created_at": "2025-06-07T19:08:28.000000Z",
                "updated_at": "2025-06-07T19:08:28.000000Z",
                "roles": [
                    {
                        "id": 1,
                        "name": "admin",
                        "guard_name": "web",
                        "created_at": "2025-06-07T19:08:27.000000Z",
                        "updated_at": "2025-06-07T19:08:27.000000Z",
                        "pivot": {
                            "model_type": "App\\Models\\User",
                            "model_id": 1,
                            "role_id": 1
                        }
                    }
                ]
            },
            {
                "id": 2,
                "name": "users",
                "email": "user2@gmail.com",
                "email_verified_at": "2025-06-07T19:20:25.000000Z",
                "created_at": "2025-06-07T19:19:46.000000Z",
                "updated_at": "2025-06-07T21:02:36.000000Z",
                "roles": [
                    {
                        "id": 2,
                        "name": "seller",
                        "guard_name": "web",
                        "created_at": "2025-06-07T19:08:27.000000Z",
                        "updated_at": "2025-06-07T19:08:27.000000Z",
                        "pivot": {
                            "model_type": "App\\Models\\User",
                            "model_id": 2,
                            "role_id": 2
                        }
                    }
                ]
            },
            {
                "id": 3,
                "name": "User 3",
                "email": "user3@example.com",
                "email_verified_at": "2025-06-07T20:26:07.000000Z",
                "created_at": "2025-06-07T20:26:07.000000Z",
                "updated_at": "2025-06-08T03:57:28.000000Z",
                "roles": [
                    {
                        "id": 3,
                        "name": "buyer",
                        "guard_name": "web",
                        "created_at": "2025-06-07T19:08:27.000000Z",
                        "updated_at": "2025-06-07T19:08:27.000000Z",
                        "pivot": {
                            "model_type": "App\\Models\\User",
                            "model_id": 3,
                            "role_id": 3
                        }
                    }
                ]
            }
        ],
        "first_page_url": "http://127.0.0.1:8000/api/admin/users?page=1",
        "from": 1,
        "last_page": 1,
        "last_page_url": "http://127.0.0.1:8000/api/admin/users?page=1",
        "links": [
            {
                "url": null,
                "label": "&laquo; Previous",
                "active": false
            },
            {
                "url": "http://127.0.0.1:8000/api/admin/users?page=1",
                "label": "1",
                "active": true
            },
            {
                "url": null,
                "label": "Next &raquo;",
                "active": false
            }
        ],
        "next_page_url": null,
        "path": "http://127.0.0.1:8000/api/admin/users",
        "per_page": 10,
        "prev_page_url": null,
        "to": 3,
        "total": 3
    }
}
```

#### Add User

```http
POST /admin/users
Authorization: Bearer {token}
Content-Type: application/json
```

Request:

```json
{
    "name": "Ali Raza",
    "email": "ali@gmail.com",
    "password": "12345678",
    "password_confirmation": "12345678",
    "role": "buyer"
}
```

Response:

```json
{
    "status": "success",
    "message": "User created successfully",
    "data": {
        "name": "Ali Raza",
        "email": "ali@gmail.com",
        "email_verified_at": "2025-06-09T03:51:51.000000Z",
        "updated_at": "2025-06-09T03:51:51.000000Z",
        "created_at": "2025-06-09T03:51:51.000000Z",
        "id": 4,
        "roles": [
            {
                "id": 3,
                "name": "buyer",
                "guard_name": "web",
                "created_at": "2025-06-07T19:08:27.000000Z",
                "updated_at": "2025-06-07T19:08:27.000000Z",
                "pivot": {
                    "model_type": "App\\Models\\User",
                    "model_id": 4,
                    "role_id": 3
                }
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
```

Request:

```json
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

### Products

Note:

-   buyers can list products, get product,
-   admins can crud all products
-   sellers can crud thier own products
-   Admins can add to cart products from sellers
-   Sellers can add to cart products from other sellers and admins
-   Buyers can add to cart products from both admins and sellers
-   No one can add to cart their own products

#### List Products (Buyer)

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

#### Get Product (Buyer)

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

#### Create Product (Seller)

```http
POST /seller/products
```

Request:

```json
{
    "title": "LED",
    "description": "Amoled, 32' long description",
    "price": "10.00",
    "quantity": 4
}
```

Response:

```json
{
    "status": "success",
    "message": "Product created successfully",
    "data": {
        "title": "LED",
        "description": "Amoled, 32' long description",
        "price": "10.00",
        "quantity": 4,
        "seller_id": 2,
        "updated_at": "2025-06-09T04:52:03.000000Z",
        "created_at": "2025-06-09T04:52:03.000000Z",
        "id": 9
    }
}
```

#### Update Product (Seller)

```http
PUT /seller/products/{id}
```

Request:

```json
{
    "quantity": 7
}
```

Response:

```json
{
    "status": "success",
    "message": "Product updated successfully",
    "data": {
        "id": 9,
        "title": "LED",
        "description": "Amoled, 32' long description",
        "price": "10.00",
        "quantity": 7,
        "seller_id": 2,
        "created_at": "2025-06-09T04:52:03.000000Z",
        "updated_at": "2025-06-09T05:13:24.000000Z"
    }
}
```

#### Delete Product (Seller)

```http
DELETE /seller/products/{id}
```

#### Admin Product Management

```http
GET /admin/products
POST /admin/products
GET /admin/products/{id}
PUT /admin/products/{id}
DELETE /admin/products/{id}
```

request:

```json
{
    "title": "New Product",
    "description": "Product description",
    "price": 99.99,
    "quantity": 10
}
```

### Product Management Rules

1. **Admin**

-   Can manage all products of sellers or their own

2. **Seller**

    - Can only manage their own products
    - Cannot modify other sellers' products
    - seller_id is automatically set to their account

3. **Buyer**
    - Can only view available products (quantity > 0)
    - Cannot modify products

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

response:

```json
{
    "status": "success",
    "message": "Product added to cart successfully"
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

Response:

```json
{
    "status": "success",
    "message": "Cart quantity updated successfully"
}
```

#### Checkout

```http
POST /checkout
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
