<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class UserRoleController extends Controller
{
    /**
     * Assign roles to a user.
     */
    public function assignRoles(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,id',
                'role_ids' => 'required|array',
                'role_ids.*' => 'exists:roles,id'
            ]);

            // Find user
            $user = User::find($request->user_id);
            if (!$user) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'User not found'
                ], 404);
            }

            // Find roles
            $roles = Role::whereIn('id', $request->role_ids)->get();
            if ($roles->isEmpty()) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'No valid roles found'
                ], 404);
            }

            // Start transaction
            DB::beginTransaction();
            try {
                // Remove existing roles
                DB::table('model_has_roles')
                    ->where('model_id', $user->id)
                    ->where('model_type', User::class)
                    ->delete();

                // Insert new roles
                $roleData = $roles->map(function ($role) use ($user) {
                    return [
                        'role_id' => $role->id,
                        'model_id' => $user->id,
                        'model_type' => User::class
                    ];
                })->toArray();

                DB::table('model_has_roles')->insert($roleData);

                DB::commit();

                // Return updated user with roles
                $user->load('roles');
                return response()->json([
                    'message' => 'success',
                    'data' => [
                        'user' => $user
                    ]
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove roles from a user.
     */
    public function removeRoles(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,id',
                'role_ids' => 'required|array',
                'role_ids.*' => 'exists:roles,id'
            ]);

            // Find user
            $user = User::find($request->user_id);
            if (!$user) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'User not found'
                ], 404);
            }

            // Remove roles
            DB::table('model_has_roles')
                ->where('model_id', $user->id)
                ->where('model_type', User::class)
                ->whereIn('role_id', $request->role_ids)
                ->delete();

            // Return updated user with roles
            $user->load('roles');
            return response()->json([
                'message' => 'success',
                'data' => [
                    'user' => $user
                ]
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's roles.
     */
    public function getUserRoles($userId)
    {
        try {
            $user = User::find($userId);
            if (!$user) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'User not found'
                ], 404);
            }

            return response()->json([
                'message' => 'success',
                'data' => [
                    'user' => $user->load('roles')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
