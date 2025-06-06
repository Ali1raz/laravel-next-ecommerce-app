<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        User::chunk(50, function ($users) {
            foreach ($users as $user) {
                if ($user->role) {
                    $spatieRole = Role::firstOrCreate(['name' => $user->role]);
                    $user->syncRoles([$spatieRole->name]);
                }
            }
        });
    }

    public function down(): void
    {
        User::all()->each(function ($user) {
            $user->syncRoles([]);
        });
    }
};
