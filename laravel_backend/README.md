# Shopping App API Documentation

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

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

Authorization: Bearer <your_token>

````

## Endpoints

### Health Check

```http
GET /ping
````

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
    "token": "access_token_here",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "buyer"
    }
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

#### Reset Password

```http
POST /reset-password
```

Request:

```json
{
    "email": "john@example.com",
    "token": "reset_token",
    "password": "new_password",
    "password_confirmation": "new_password"
}
```

### Protected Routes

#### Logout

```http
POST /logout
```

#### Profile

```http
GET /profile
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
        "role": "buyer"
    }
}
```

#### Update Profile

```http
PUT /profile
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "John Updated",
    "email": "john.updated@example.com",
    "current_password": "current_password",
    "password": "new_password",
    "password_confirmation": "new_password"
}
```

Request:

```json
{
    "name": "John Doe",
    "email": "john@example.com",
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
            "title": "Product Name",
            "description": "Product Description",
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
    "message": "Role created successfully",
    "data": {
        "id": 1,
        "title": "Product Name",
        "description": "Product Description",
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
POST /seller/products
```

Request:

```json
{
    "title": "Product Name",
    "description": "Product Description",
    "price": 99.99,
    "quantity": 10
}
```

Response:

```json
{
    "status": "success",
    "message": "Product created successfully",
    "data": {
        "id": 1,
        "title": "Product Name",
        "description": "Product Description",
        "price": 99.99,
        "quantity": 10,
        "seller_id": 2
    }
}
```

#### Update Product (Admin/Seller only)

```http
PUT /admin/products/{id}
PUT /seller/products/{id}
```

Request:

```json
{
    "title": "Updated Product Name",
    "description": "Updated Description",
    "price": 89.99,
    "quantity": 5
}
```

#### Delete Product (Admin/Seller only)

```http
DELETE /admin/products/{id}
DELETE /seller/products/{id}
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
                "title": "Product Name",
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
                        "title": "Product Name",
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

#### Checkout

```http
POST /checkout
```

Response:

```json
{
    "status": "success",
    "message": "Checkout completed successfully",
    "data": {
        "id": 1,
        "total_amount": 199.98,
        "items": [
            {
                "id": 1,
                "quantity": 2,
                "price_at_time": 99.99,
                "product": {
                    "id": 1,
                    "title": "Product Name",
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
    "errors": {
        "field": ["Error details"]
    }
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

-   Admin: Full access to all endpoints
-   Seller: Can manage their own products and use cart/bill features
-   Buyer: Can view products and use cart/bill features
