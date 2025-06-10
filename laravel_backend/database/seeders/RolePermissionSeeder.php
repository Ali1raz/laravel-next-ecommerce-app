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
        $adminRole = Role::create(['name' => 'admin', 'guard_name' => 'sanctum']);
        $sellerRole = Role::create(['name' => 'seller', 'guard_name' => 'sanctum']);
        $buyerRole = Role::create(['name' => 'buyer', 'guard_name' => 'sanctum']);

        // Create permissions
        $permissions = [
            // Product permissions
            'view products',
            'create products',
            'edit products',
            'delete products',

            // Cart permissions
            'view cart',
            'add to cart',
            'remove from cart',

            // Bill permissions
            'view bills'
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'sanctum']);
        }

        // Assign permissions to roles
        $adminRole->givePermissionTo($permissions);

        $sellerRole->givePermissionTo([
            'view products',
            'create products',
            'edit products',
            'delete products',
            'view cart',
            'add to cart',
            'remove from cart',
            'view bills'
        ]);

        $buyerRole->givePermissionTo([
            'view products',
            'view cart',
            'add to cart',
            'remove from cart',
            'view bills'
        ]);
    }
}
