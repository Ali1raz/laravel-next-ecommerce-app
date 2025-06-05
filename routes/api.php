<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::get("ping", function () {
    return response()->json(["message" => "pong"]);
});
