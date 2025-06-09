<?php

namespace App\Http\Controllers\Api\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Bill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Cart;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();

            // Get buyer's cart items count
            $cart = Cart::firstOrCreate(['user_id' => $user->id]);
            $cartItemsCount = $cart->items()->count();

            // Get buyer's total spent
            $totalSpent = Bill::where('user_id', $user->id)
                ->where('status', 'completed')
                ->sum('total_amount');

            // Get buyer's recent orders
            $recentOrders = Bill::where('user_id', $user->id)
                ->with(['items.product.seller'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            // Get buyer's favorite products (most bought)
            $favoriteProducts = Product::select('products.*', DB::raw('COUNT(bill_items.id) as purchase_count'))
                ->join('bill_items', 'products.id', '=', 'bill_items.product_id')
                ->join('bills', 'bill_items.bill_id', '=', 'bills.id')
                ->where('bills.user_id', $user->id)
                ->where('bills.status', 'completed')
                ->groupBy(
                    'products.id',
                    'products.title',
                    'products.description',
                    'products.price',
                    'products.quantity',
                    'products.seller_id',
                    'products.created_at',
                    'products.updated_at'
                )
                ->orderBy('purchase_count', 'desc')
                ->take(5)
                ->get();

            // Get recommended products (products from sellers the buyer has bought from)
            $recommendedProducts = Product::whereIn('seller_id', function ($query) use ($user) {
                $query->select('products.seller_id')
                    ->from('products')
                    ->join('bill_items', 'products.id', '=', 'bill_items.product_id')
                    ->join('bills', 'bill_items.bill_id', '=', 'bills.id')
                    ->where('bills.user_id', $user->id)
                    ->where('bills.status', 'completed');
            })
                ->where('quantity', '>', 0)
                ->whereNotIn('id', function ($query) use ($user) {
                    $query->select('product_id')
                        ->from('bill_items')
                        ->join('bills', 'bill_items.bill_id', '=', 'bills.id')
                        ->where('bills.user_id', $user->id);
                })
                ->take(5)
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'cart_items_count' => $cartItemsCount,
                    'total_spent' => $totalSpent,
                    'recent_orders' => $recentOrders,
                    'favorite_products' => $favoriteProducts,
                    'recommended_products' => $recommendedProducts
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
