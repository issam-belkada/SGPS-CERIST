<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Encadrement extends Model
{
    use HasFactory;

    protected $fillable = [
        'bilan_id',
        'nom_etudiant',
        'type_diplome', 
        'sujet',
        'etablissement',
        'etat_avancement' // En cours, Soutenu
    ];

    public function bilan()
    {
        return $this->belongsTo(BilanAnnuel::class, 'bilan_id');
    }
}
