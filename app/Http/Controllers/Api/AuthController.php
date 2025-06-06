<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $req)
    {
        $req->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Generate verification code
        $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = now()->addHours(24);

        $user = \App\Models\User::create([
            'name' => $req->name,
            'email' => $req->email,
            'role' => 'buyer',
            'password' => Hash::make($req->password),
            'verification_code' => $verificationCode,
            'verification_code_expires_at' => $expiresAt,
        ]);

        // Send verification email
        \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\VerificationCodeMail($verificationCode));

        return response()->json([
            'message' => 'Registration successful. Please check your email for verification code.',
            'email' => $user->email
        ], 201);
    }

    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6'
        ]);

        $user = \App\Models\User::where('email', $request->email)
            ->where('verification_code', $request->code)
            ->where('verification_code_expires_at', '>', now())
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Invalid or expired verification code'
            ], 400);
        }

        $user->markEmailAsVerified();
        $user->verification_code = null;
        $user->verification_code_expires_at = null;
        $user->save();

        return response()->json([
            'message' => 'Email verified successfully'
        ]);
    }

    public function resendVerificationCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $user = \App\Models\User::where('email', $request->email)
            ->whereNull('email_verified_at')
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found or already verified'
            ], 404);
        }

        // Generate new verification code
        $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = now()->addHours(24);

        $user->verification_code = $verificationCode;
        $user->verification_code_expires_at = $expiresAt;
        $user->save();

        // Send new verification email
        \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\VerificationCodeMail($verificationCode));

        return response()->json([
            'message' => 'New verification code sent to your email'
        ]);
    }

    public function login(Request $req)
    {
        $req->validate([
            'email' => 'required|string|email',
            'password' => 'required|string|min:8',
        ]);

        $user = \App\Models\User::where('email', $req->email)->first();

        if (!$user || !Hash::check($req->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Please verify your email address first.',
                'email' => $user->email
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}
