<?php

namespace App\Http\Controllers\Api\Seller;

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
            $products = Product::where('seller_id', Auth::id())->get();
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

    public function store(Request $request)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:1',
                'quantity' => 'required|integer|min:1',
                'image' => 'nullable|string|url|max:2048'
            ]);

            $product = Product::create([
                'title' => $request->title,
                'description' => $request->description,
                'price' => $request->price,
                'quantity' => $request->quantity,
                'seller_id' => Auth::id(),
                'image' => $request->image ?? null
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Product created successfully',
                'data' => $product
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function show($id)
    {
        try {
            $product = Product::where('seller_id', Auth::id())
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

    public function update(Request $request, $id)
    {
        try {
            $product = Product::where('seller_id', Auth::id())
                ->findOrFail($id);

            $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'price' => 'sometimes|numeric|min:1',
                'quantity' => 'sometimes|integer|min:1',
                'image' => 'nullable|string|url|max:2048'
            ]);

            $updateData = [];
            if ($request->has('title')) {
                $updateData['title'] = $request->title;
            }
            if ($request->has('description')) {
                $updateData['description'] = $request->description;
            }
            if ($request->has('price')) {
                $updateData['price'] = $request->price;
            }
            if ($request->has('quantity')) {
                $updateData['quantity'] = $request->quantity;
            }
            if ($request->has('image')) {
                $updateData['image'] = $request->image;
            }

            $product->update($updateData);
            $product = $product->fresh();

            return response()->json([
                'status' => 'success',
                'message' => 'Product updated successfully',
                'data' => $product
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => "Product with ID $id not found"
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Throwable $e) {
            return $this->handleException($e);
        }
    }

    public function destroy($id)
    {
        try {
            $product = Product::where('seller_id', Auth::id())
                ->findOrFail($id);

            $product->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Product deleted successfully'
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
