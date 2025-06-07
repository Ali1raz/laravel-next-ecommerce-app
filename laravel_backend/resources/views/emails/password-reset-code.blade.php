<!DOCTYPE html>
<html>

<head>
    <title>Password Reset Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .code {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            text-align: center;
            padding: 20px;
            background: #f3f4f6;
            border-radius: 8px;
            margin: 20px 0;
        }

        .expiry {
            color: #666;
            font-size: 14px;
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="container">
        <h2>Password Reset Code</h2>
        <p>You have requested to reset your password. Please use the following code to reset your password:</p>

        <div class="code">{{ $code }}</div>

        <p class="expiry">This code will expire in 1 hour.</p>

        <p>If you did not request a password reset, please ignore this email.</p>

        <p>Best regards,<br>Your App Team</p>
    </div>
</body>

</html>