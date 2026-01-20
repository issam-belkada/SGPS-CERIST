<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionTechnologique extends Model
{
    use HasFactory;

    protected $table = 'productions_technologiques';
    protected $fillable = [
        'bilan_id',
        'type', // Logiciel, Produit, Brevet, Prototype
        'intitule',
        'description',
        'reference' // ex: N° de brevet ou version
    ];

    public function bilan()
    {
        return $this->belongsTo(BilanAnnuel::class, 'bilan_id');
    }
}
