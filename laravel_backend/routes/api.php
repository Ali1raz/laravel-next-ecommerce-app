<?php

use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\PermissionController;
use App\Http\Controllers\Api\Admin\UserRoleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PasswordResetController;

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

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/dashboard', fn() => response()->json(['message' => 'Hello Admin']));

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
    });

    Route::prefix('seller')->middleware('role:seller')->group(function () {
        Route::get('/dashboard', fn() => response()->json(['message' => 'Hello Seller']));
    });

    Route::prefix('buyer')->middleware('role:buyer')->group(function () {
        Route::get('/dashboard', fn() => response()->json(['message' => 'Hello Buyer']));
    });
});
