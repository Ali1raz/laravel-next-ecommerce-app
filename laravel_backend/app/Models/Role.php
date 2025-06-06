<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;
use App\Models\User;

class Role extends SpatieRole
{
    protected $fillable = ['name', 'guard_name'];

    /**
     * Get the users that belong to this role.
     */
    public function users()
    {
        return $this->morphedByMany(
            User::class,
            'model',
            config('permission.table_names.model_has_roles'),
            'role_id',
            config('permission.column_names.model_morph_key')
        );
    }
}
