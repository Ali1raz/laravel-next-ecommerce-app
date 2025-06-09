<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function show()
    {
        try {
            $user = User::with(['roles', 'products'])->find(Auth::id());

            return response()->json([
                'status' => 'success',
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch profile'
            ], 500);
        }
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request)
    {
        try {
            $user = User::find(Auth::id());

            $request->validate([
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
                'current_password' => 'required_with:password|string',
                'password' => 'sometimes|string|min:8|confirmed'
            ]);

            if ($request->has('name')) {
                $user->name = $request->name;
            }

            if ($request->has('email')) {
                $user->email = $request->email;
            }

            if ($request->has('password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    throw ValidationException::withMessages([
                        'current_password' => ['The provided password does not match your current password.']
                    ]);
                }
                $user->password = Hash::make($request->password);
            }

            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Profile updated successfully',
                'data' => $user->load(['roles', 'products'])
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update profile'
            ], 500);
        }
    }
}
