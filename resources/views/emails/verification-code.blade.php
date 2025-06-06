<!DOCTYPE html>
<html>
<head>
    <title>Email Verification</title>
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
            font-size: 32px;
            font-weight: bold;
            color: #4a5568;
            text-align: center;
            padding: 20px;
            background: #f7fafc;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #718096;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Email Verification</h2>
        <p>Thank you for registering! Please use the following code to verify your email address:</p>
        
        <div class="code">
            {{ $code }}
        </div>

        <p>This code will expire in 24 hours.</p>
        
        <p>If you didn't request this verification code, please ignore this email.</p>

        <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html> 