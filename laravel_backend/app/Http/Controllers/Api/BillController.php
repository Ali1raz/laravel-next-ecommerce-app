<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class BillController extends Controller
{
    public function index()
    {
        $bills = Bill::with(['items.product.seller'])
            ->where('user_id', Auth::id())
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $bills
        ]);
    }

    public function checkout()
    {
        $cart = Cart::where('user_id', Auth::id())->first();

        if (!$cart || $cart->items()->count() === 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cart is empty'
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Calculate total amount
            $totalAmount = 0;
            $cartItems = $cart->items()->with('product')->get();

            foreach ($cartItems as $item) {
                $product = $item->product;

                // Check if enough quantity is still available
                if ($product->quantity < $item->quantity) {
                    throw new \Exception("Not enough quantity available for product: {$product->title}");
                }

                $totalAmount += $product->price * $item->quantity;
            }

            // Create bill
            $bill = Bill::create([
                'user_id' => Auth::id(),
                'total_amount' => $totalAmount
            ]);

            // Create bill items and update product quantities
            foreach ($cartItems as $item) {
                $product = $item->product;

                BillItem::create([
                    'bill_id' => $bill->id,
                    'product_id' => $product->id,
                    'quantity' => $item->quantity,
                    'price_at_time' => $product->price
                ]);

                // Update product quantity
                $product->update([
                    'quantity' => $product->quantity - $item->quantity
                ]);
            }

            // Clear cart
            $cart->items()->delete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Checkout completed successfully',
                'data' => $bill->load('items.product.seller')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function show(Bill $bill)
    {
        // Check if user owns the bill
        if ($bill->user_id !== Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $bill->load('items.product.seller')
        ]);
    }
}
