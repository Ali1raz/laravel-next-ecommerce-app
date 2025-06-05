<?php

use App\Http\Controllers\Api\AuthController;
use GuzzleHttp\Psr7\Request;
use Illuminate\Support\Facades\Route;

Route::get("ping", function () {
    return response()->json(["message" => "pong"]);
});

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);


Route::middleware('api', 'auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);

    Route::middleware('role:admin')->get('admin/dashboard', function () {
        return 'Hello Admin';
    });
    Route::middleware('role:seller')->get('seller/dashboard', function () {
        return 'Hello seller';
    });
    Route::middleware('role:buyer')->get('buyer/dashboard', function () {
        return 'Hello buyer';
    });
});
