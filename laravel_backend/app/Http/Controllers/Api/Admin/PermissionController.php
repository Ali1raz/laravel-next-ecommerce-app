<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $permissions = Permission::with('roles')->get();
            return response()->json([
                'message' => 'success',
                'data' => $permissions
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
                'name' => 'required|string|max:255|unique:permissions'
            ]);

            // Convert name to slug
            $slug = strtolower(str_replace(' ', '-', $request->name));

            $permission = Permission::create([
                'name' => $slug,
                'guard_name' => 'web'
            ]);

            return response()->json([
                'message' => 'success',
                'data' => $permission
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
            $permission = Permission::findById($id, 'web');
            if (!$permission) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'Permission not found'
                ], 404);
            }

            return response()->json([
                'message' => 'success',
                'data' => $permission->load('roles')
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
            $permission = Permission::findById($id, 'web');
            if (!$permission) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'Permission not found'
                ], 404);
            }

            $request->validate([
                'name' => 'required|string|max:255|unique:permissions,name,' . $id
            ]);

            // Convert name to slug
            $slug = strtolower(str_replace(' ', '-', $request->name));

            $permission->update(['name' => $slug]);

            return response()->json([
                'message' => 'success',
                'data' => $permission->load('roles')
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
            $permission = Permission::findById($id, 'web');
            if (!$permission) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'Permission not found'
                ], 404);
            }

            // Check if permission is assigned to any roles
            $rolesWithPermission = DB::table('role_has_permissions')
                ->where('permission_id', $id)
                ->count();

            if ($rolesWithPermission > 0) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'Cannot delete permission that is assigned to roles',
                    'roles_count' => $rolesWithPermission
                ], 422);
            }

            $permission->delete();
            return response()->json(['message' => 'success']);
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
     * Assign permissions to a role.
     */
    public function assignToRole(Request $request)
    {
        try {
            $request->validate([
                'role_id' => 'required|exists:roles,id',
                'permission_ids' => 'required|array',
                'permission_ids.*' => 'exists:permissions,id'
            ]);

            // Find role
            $role = Role::find($request->role_id);
            if (!$role) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'Role not found'
                ], 404);
            }

            // Find permissions
            $permissions = Permission::whereIn('id', $request->permission_ids)->get();
            if ($permissions->isEmpty()) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'No valid permissions found'
                ], 404);
            }

            // Start transaction
            DB::beginTransaction();
            try {
                // Remove existing permissions
                DB::table('role_has_permissions')
                    ->where('role_id', $role->id)
                    ->delete();

                // Insert new permissions
                $permissionData = $permissions->map(function ($permission) use ($role) {
                    return [
                        'permission_id' => $permission->id,
                        'role_id' => $role->id
                    ];
                })->toArray();

                DB::table('role_has_permissions')->insert($permissionData);

                DB::commit();

                // Return updated role with permissions
                $role->load('permissions');
                return response()->json([
                    'message' => 'success',
                    'data' => [
                        'role' => $role
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
     * Remove permissions from a role.
     */
    public function removeFromRole(Request $request)
    {
        try {
            $request->validate([
                'role_id' => 'required|exists:roles,id',
                'permission_ids' => 'required|array',
                'permission_ids.*' => 'exists:permissions,id'
            ]);

            // Find role
            $role = Role::find($request->role_id);
            if (!$role) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'Role not found'
                ], 404);
            }

            // Remove permissions
            DB::table('role_has_permissions')
                ->where('role_id', $role->id)
                ->whereIn('permission_id', $request->permission_ids)
                ->delete();

            // Return updated role with permissions
            $role->load('permissions');
            return response()->json([
                'message' => 'success',
                'data' => [
                    'role' => $role
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
}
