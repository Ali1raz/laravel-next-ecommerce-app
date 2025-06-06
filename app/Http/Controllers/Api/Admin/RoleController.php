<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $roles = Role::with('permissions')->get();
            return response()->json([
                'message' => 'success',
                'data' => $roles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:roles'
            ]);

            $role = Role::create(['name' => $request->name]);

            return response()->json([
                'message' => 'success',
                'data' => $role
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'error',
                'errors' => $e->errors()
            ], 422);
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $role = Role::findById($id);
            if (!$role) {
                return response()->json([
                    'message' => 'Role not found',
                    'id' => $id
                ], 404);
            }

            return response()->json([
                'message' => 'success',
                'data' => $role->load('permissions')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            $role = Role::findById($id);
            if (!$role) {
                return response()->json([
                    'message' => 'Role not found',
                    'id' => $id
                ], 404);
            }

            $request->validate([
                'name' => 'required|string|max:255|unique:roles,name,' . $id
            ]);

            $role->update(['name' => $request->name]);

            return response()->json([
                'message' => 'success',
                'data' => $role->load('permissions')
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'error',
                'errors' => $e->errors()
            ], 422);
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            // First check if role exists
            $role = DB::table('roles')->where('id', $id)->first();
            if (!$role) {
                return response()->json([
                    'message' => 'Role not found',
                    'id' => $id
                ], 404);
            }

            // Check if any users have this role
            $usersWithRole = DB::table('model_has_roles')
                ->where('role_id', $id)
                ->count();

            if ($usersWithRole > 0) {
                return response()->json([
                    'message' => 'Cannot delete role that is assigned to users',
                    'users_count' => $usersWithRole
                ], 422);
            }

            // Start transaction
            DB::beginTransaction();
            try {
                // Delete role permissions first
                DB::table('role_has_permissions')
                    ->where('role_id', $id)
                    ->delete();

                // Delete the role
                DB::table('roles')
                    ->where('id', $id)
                    ->delete();

                DB::commit();
                return response()->json(['message' => 'success']);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
