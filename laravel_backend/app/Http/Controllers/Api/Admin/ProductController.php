<?php

namespace App\Http\Controllers\Api\Admin;

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
            $products = Product::with('seller')->get();
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
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:1',
                'quantity' => 'required|integer|min:1',
                'seller_id' => 'required|exists:users,id'
            ]);

            $product = Product::create([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'quantity' => $validated['quantity'],
                'seller_id' => $validated['seller_id']
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
            $product = Product::with('seller')->findOrFail($id);
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
            $product = Product::findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'price' => 'sometimes|required|numeric|min:1',
                'quantity' => 'sometimes|required|integer|min:1',
                'seller_id' => 'sometimes|required|exists:users,id'
            ]);

            // Update only the fields that are provided
            $updateData = [];
            foreach ($validated as $field => $value) {
                if ($request->has($field)) {
                    $updateData[$field] = $value;
                }
            }

            $product->update($updateData);

            return response()->json([
                'status' => 'success',
                'message' => 'Product updated successfully',
                'data' => $product->fresh()
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
            $product = Product::findOrFail($id);
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
