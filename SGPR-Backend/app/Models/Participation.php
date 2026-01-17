<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class Participation extends Pivot
{
    // On étend 'Pivot' au lieu de 'Model' pour les tables de liaison
    protected $table = 'participation';

    protected $fillable = [
        'projet_id',
        'user_id',
        'pourcentage_participation',
        'qualite' // permanent, associé, collaborateur, étudiant
    ];

    // Optionnel : Vous pouvez ajouter des relations si vous voulez
    // accéder directement au projet ou à l'utilisateur depuis cet objet
    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}