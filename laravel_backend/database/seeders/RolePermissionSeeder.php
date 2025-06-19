<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $sellerRole = Role::firstOrCreate(['name' => 'seller']);
        $buyerRole = Role::firstOrCreate(['name' => 'buyer']);

        // Create permissions
        $permissions = [
            // User permissions
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',

            // Role permissions
            'view-roles',
            'change-roles',

            // Permission permissions
            'view-permissions',
            'change-permissions',

            // Product permissions
            'view-products',
            'create-products',
            'edit-products',
            'delete-products',

            // Cart permissions
            'view-cart',
            'add-to-cart',
            'remove-from-cart',

            // Bill permissions
            'view-bills'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign permissions to roles
        $adminRole->givePermissionTo($permissions);

        $sellerRole->givePermissionTo([
            'view-products',
            'create-products',
            'edit-products',
            'delete-products',
            'view-cart',
            'add-to-cart',
            'remove-from-cart',
            'view-bills'
        ]);

        $buyerRole->givePermissionTo([
            'view-products',
            'view-cart',
            'add-to-cart',
            'remove-from-cart',
            'view-bills'
        ]);
    }
}
