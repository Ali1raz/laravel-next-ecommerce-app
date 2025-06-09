<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Bill;
use App\Models\BillItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();

            // Get seller's total products
            $totalProducts = Product::where('seller_id', $user->id)->count();

            // Get seller's total sales
            $totalSales = BillItem::whereHas('product', function ($query) use ($user) {
                $query->where('seller_id', $user->id);
            })
                ->join('products', 'bill_items.product_id', '=', 'products.id')
                ->join('bills', 'bill_items.bill_id', '=', 'bills.id')
                ->sum(DB::raw('bill_items.quantity * products.price'));

            // Get seller's total orders
            $totalOrders = Bill::whereHas('items.product', function ($query) use ($user) {
                $query->where('seller_id', $user->id);
            })
                ->where('status', 'completed')
                ->count();

            // Get seller's recent orders
            $recentOrders = Bill::whereHas('items.product', function ($query) use ($user) {
                $query->where('seller_id', $user->id);
            })
                ->with(['items.product', 'user'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            // Get seller's top selling products
            $topSellingProducts = Product::select('products.*', DB::raw('SUM(bill_items.quantity) as total_sold'))
                ->join('bill_items', 'products.id', '=', 'bill_items.product_id')
                ->join('bills', 'bill_items.bill_id', '=', 'bills.id')
                ->where('products.seller_id', $user->id)
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
                ->orderBy('total_sold', 'desc')
                ->take(5)
                ->get();

            // Get seller's low stock products
            $lowStockProducts = Product::where('seller_id', $user->id)
                ->where('quantity', '<=', 5)
                ->where('quantity', '>', 0)
                ->take(5)
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_products' => $totalProducts,
                    'total_sales' => $totalSales,
                    'total_orders' => $totalOrders,
                    'recent_orders' => $recentOrders,
                    'top_selling_products' => $topSellingProducts,
                    'low_stock_products' => $lowStockProducts
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
