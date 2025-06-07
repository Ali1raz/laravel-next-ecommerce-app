<!DOCTYPE html>
<html>

<head>
    <title>Order Confirmation</title>
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

        .header {
            text-align: center;
            padding: 20px 0;
            background-color: #f8f9fa;
            border-radius: 5px;
        }

        .order-details {
            margin: 20px 0;
            padding: 20px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
        }

        .order-item {
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }

        .total {
            margin-top: 20px;
            text-align: right;
            font-weight: bold;
        }

        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order! We're preparing it for delivery.</p>
        </div>

        <div class="order-details">
            <h2>Order Details</h2>
            <p>Order ID: #{{ $bill->id }}</p>
            <p>Order Date: {{ $bill->created_at->format('F j, Y') }}</p>

            <h3>Items:</h3>
            @foreach($bill->items as $item)
            <div class="order-item">
                <p><strong>{{ $item->product->title }}</strong></p>
                <p>Quantity: {{ $item->quantity }}</p>
                <p>Price: ${{ number_format($item->price_at_time, 2) }}</p>
            </div>
            @endforeach

            <div class="total">
                <p>Total Amount: ${{ number_format($bill->total_amount, 2) }}</p>
            </div>
        </div>

        <div class="footer">
            <p>Your order will be delivered soon. We'll notify you when it's on its way!</p>
            <p>Thank you for shopping with us!</p>
        </div>
    </div>
</body>

</html>