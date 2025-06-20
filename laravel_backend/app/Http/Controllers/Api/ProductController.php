<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class ProductController extends Controller
{
    public function index()
    {
        try {
            // Get all products with quantity > 0
            $products = Product::with('seller')
                ->where('quantity', '>', 0)
                ->when(Auth::user()->roles->contains('name', 'admin'), function ($query) {
                    // Admin can see all products
                    return $query;
                })
                ->when(Auth::user()->roles->contains('name', 'seller'), function ($query) {
                    // Seller can see all products except their own
                    return $query->where('seller_id', '!=', Auth::id());
                })
                ->get();
            foreach ($products as $product) {
                $product->image = $product->image ? asset('storage/' . $product->image) : null;
            }
            return response()->json([
                'status' => 'success',
                'data' => $products
            ]);
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function show($id)
    {
        try {
            $product = Product::with('seller')
                ->when(Auth::user()->roles->contains('name', 'seller'), function ($query) {
                    // Seller can't view their own products here
                    return $query->where('seller_id', '!=', Auth::id());
                })
                ->findOrFail($id);
            $product->image = $product->image ? asset('storage/' . $product->image) : null;
            return response()->json([
                'status' => 'success',
                'data' => $product
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => "Product with ID $id not found"
            ], 404);
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    protected function handleException(Throwable $e)
    {
        if ($e instanceof HttpException) {
            $status = $e->getStatusCode();
        } else {
            $status = 500;
        }

        return response()->json([
            'status' => 'error',
            'message' => app()->isProduction() ? 'Something went wrong' : $e->getMessage(),
            'trace' => app()->isProduction() ? null : $e->getTrace()
        ], $status);
    }
}
