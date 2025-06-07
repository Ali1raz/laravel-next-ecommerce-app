<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            // Get total counts
            $totalUsers = User::count();
            $totalRoles = Role::count();
            $totalPermissions = Permission::count();

            // Get users by role
            $usersByRole = DB::table('model_has_roles')
                ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                ->select('roles.name', DB::raw('count(*) as total'))
                ->groupBy('roles.name')
                ->get();

            // Get recent users (last 5)
            $recentUsers = User::with('roles')
                ->latest()
                ->take(5)
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'analytics' => [
                        'total_users' => $totalUsers,
                        'total_roles' => $totalRoles,
                        'total_permissions' => $totalPermissions,
                        'users_by_role' => $usersByRole,
                    ],
                    'recent_users' => $recentUsers
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
