<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionScientifique extends Model
{
    use HasFactory;
    protected $table = 'productions_scientifiques';

    protected $fillable = [
        'bilan_id',
        'type', // Publication_Inter, Communication_Nat, etc.
        'titre',
        'auteurs',
        'revue_ou_conference',
        'date_parution'
    ];

    public function bilan()
    {
        return $this->belongsTo(BilanAnnuel::class, 'bilan_id');
    }
}
