# Shopping App API

## Authentication API

### Register

```http
POST /api/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

Response: `201 Created`

```json
{
    "message": "Registration successful. Please check your email for verification code.",
    "email": "john@example.com"
}
```

### Verify Email

```http
POST /api/verify-code
Content-Type: application/json

{
    "email": "john@example.com",
    "code": "123456"
}
```

Response: `200 OK`

```json
{
    "message": "Email verified successfully"
}
```

### Resend Verification Code

```http
POST /api/resend-verification-code
Content-Type: application/json

{
    "email": "john@example.com"
}
```

Response: `200 OK`

```json
{
    "message": "New verification code sent to your email"
}
```

### Login

```http
POST /api/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

Response: `200 OK`

```json
{
    "message": "Login successful",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "buyer"
    },
    "token": "access_token_here"
}
```

### Logout

```http
POST /api/logout
Authorization: Bearer {token}
```

Response: `200 OK`

```json
{
    "message": "Logged out"
}
```

## Development Setup

1. Clone the repository
2. Install dependencies:

```bash
composer install
```

3. Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

4. Set up database:

```bash
php artisan migrate
```

5. Email Setup (Development):

-   Sign up for a free Mailtrap account at https://mailtrap.io
-   Go to Email Testing → Inboxes → SMTP Settings
-   Update your `.env` file with Mailtrap credentials:

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

    - All emails will be caught by Mailtrap and can be viewed in your Mailtrap inbox

6. Start the server:

```bash
php artisan serve
```

7. Test API endpoints using Postman or curl:

```bash
# Register
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","password_confirmation":"password123"}'

# Check verification code in Mailtrap inbox

# Verify email
curl -X POST http://localhost:8000/api/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
