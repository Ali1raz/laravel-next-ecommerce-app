<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// 🔁 Health check endpoint
Route::get('/ping', fn() => response()->json(['message' => 'pong']));

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/dashboard', fn() => response()->json(['message' => 'Hello Admin']));
    });

    Route::prefix('seller')->middleware('role:seller')->group(function () {
        Route::get('/dashboard', fn() => response()->json(['message' => 'Hello Seller']));
    });

    Route::prefix('buyer')->middleware('role:buyer')->group(function () {
        Route::get('/dashboard', fn() => response()->json(['message' => 'Hello Buyer']));
    });
});
