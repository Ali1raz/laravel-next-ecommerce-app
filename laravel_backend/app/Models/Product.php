<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'price',
        'quantity',
        'seller_id',
        'image'
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function billItems()
    {
        return $this->hasMany(BillItem::class);
    }
}
