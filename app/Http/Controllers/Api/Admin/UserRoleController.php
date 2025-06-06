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
     * Assign a role to a user
     */
    public function assignRole(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,id',
                'role_id' => 'required|exists:roles,id'
            ]);

            $user = User::findOrFail($request->user_id);
            $role = Role::findOrFail($request->role_id);

            // Start transaction
            DB::beginTransaction();

            try {
                // Remove all existing roles
                $user->roles()->detach();

                // Assign the new role
                $user->assignRole($role);

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Role assigned successfully',
                    'data' => [
                        'user' => $user->load('roles')
                    ]
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to assign role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove role from a user
     */
    public function removeRole(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required|exists:users,id'
            ]);

            $user = User::findOrFail($request->user_id);

            // Start transaction
            DB::beginTransaction();

            try {
                // Remove all roles
                $user->roles()->detach();

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Role removed successfully',
                    'data' => [
                        'user' => $user->load('roles')
                    ]
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's role
     */
    public function getUserRole($userId)
    {
        try {
            $user = User::findOrFail($userId);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'user' => $user->load('roles')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get user role',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
