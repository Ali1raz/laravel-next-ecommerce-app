<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class ProductPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Product permissions
        Permission::create(['name' => 'view products']);
        Permission::create(['name' => 'create products']);
        Permission::create(['name' => 'edit products']);
        Permission::create(['name' => 'delete products']);

        // Cart permissions
        Permission::create(['name' => 'view cart']);
        Permission::create(['name' => 'add to cart']);
        Permission::create(['name' => 'remove from cart']);

        // Bill permissions
        Permission::create(['name' => 'view bills']);
    }
}
