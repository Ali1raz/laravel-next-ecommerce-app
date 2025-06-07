<?php

use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\PermissionController;
use App\Http\Controllers\Api\Admin\UserRoleController;
use App\Http\Controllers\Api\Admin\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\BillController;

// 🔁 Health check endpoint
Route::get('/ping', fn() => response()->json(['message' => 'pong']));

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-code', [AuthController::class, 'verifyCode']);
Route::post('/resend-verification-code', [AuthController::class, 'resendVerificationCode']);
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // Product routes
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);

    // Cart routes
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'addToCart']);
    Route::post('/cart/remove', [CartController::class, 'removeFromCart']);
    Route::put('/cart/update-quantity', [CartController::class, 'updateQuantity']);

    // Bill routes
    Route::get('/bills', [BillController::class, 'index']);
    Route::get('/bills/{bill}', [BillController::class, 'show']);
    Route::post('/checkout', [BillController::class, 'checkout']);

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // Role management
        Route::apiResource('roles', RoleController::class);

        // Permission management
        Route::apiResource('permissions', PermissionController::class);
        Route::post('permissions/assign-to-role', [PermissionController::class, 'assignToRole']);
        Route::post('permissions/remove-from-role', [PermissionController::class, 'removeFromRole']);

        // User role management
        Route::post('users/assign-role', [UserRoleController::class, 'assignRole']);
        Route::post('users/remove-role', [UserRoleController::class, 'removeRole']);
        Route::get('users/{userId}/role', [UserRoleController::class, 'getUserRole']);

        // User management
        Route::apiResource('users', UserController::class);

        // Product management
        Route::apiResource('products', ProductController::class);
    });

    Route::prefix('seller')->middleware('role:seller')->group(function () {
        Route::get('/dashboard', fn() => response()->json(['message' => 'Hello Seller']));

        // Product management
        Route::apiResource('products', ProductController::class);
    });

    Route::prefix('buyer')->middleware('role:buyer')->group(function () {
        Route::get('/dashboard', fn() => response()->json(['message' => 'Hello Buyer']));
    });
});
