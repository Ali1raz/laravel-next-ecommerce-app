<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function index()
    {
        $cart = Cart::firstOrCreate(['user_id' => Auth::id()]);
        $items = $cart->items()->with('product.seller')->get();

        return response()->json([
            'status' => 'success',
            'data' => $items
        ]);
    }

    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $product = Product::findOrFail($request->product_id);

        // Check if user is trying to add their own product
        if ($product->seller_id === Auth::id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot add your own product to cart'
            ], 403);
        }

        // Check if enough quantity is available
        if ($product->quantity < $request->quantity) {
            return response()->json([
                'status' => 'error',
                'message' => 'Not enough quantity available'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $cart = Cart::firstOrCreate(['user_id' => Auth::id()]);

            $cartItem = $cart->items()->where('product_id', $product->id)->first();

            if ($cartItem) {
                // Update quantity if item already exists
                $newQuantity = $cartItem->quantity + $request->quantity;
                if ($product->quantity < $newQuantity) {
                    throw new \Exception('Not enough quantity available');
                }
                $cartItem->update(['quantity' => $newQuantity]);
            } else {
                // Create new cart item
                $cart->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $request->quantity
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Product added to cart successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function removeFromCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $cart = Cart::where('user_id', Auth::id())->first();

        if (!$cart) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cart not found'
            ], 404);
        }

        $cart->items()->where('product_id', $request->product_id)->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Product removed from cart successfully'
        ]);
    }

    public function updateQuantity(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->quantity < $request->quantity) {
            return response()->json([
                'status' => 'error',
                'message' => 'Not enough quantity available'
            ], 422);
        }

        $cart = Cart::where('user_id', Auth::id())->first();

        if (!$cart) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cart not found'
            ], 404);
        }

        $cartItem = $cart->items()->where('product_id', $request->product_id)->first();

        if (!$cartItem) {
            return response()->json([
                'status' => 'error',
                'message' => 'Product not found in cart'
            ], 404);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json([
            'status' => 'success',
            'message' => 'Cart quantity updated successfully'
        ]);
    }
}
