<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable,HasRoles,HasApiTokens;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'grade',
        'specialite',
        'division_id',
        'role'
    ];

    protected $hidden = ['password', 'remember_token'];

    // L'utilisateur appartient à une division
    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    // Projets dont il est le "Chef de Projet"
    public function projetsDiriges()
    {
        return $this->hasMany(Projet::class, 'chef_projet_id');
    }

    // Projets auxquels il participe en tant que membre (via table participation)
    public function projetsParticipations()
    {
        return $this->belongsToMany(Projet::class, 'participation')
                    ->withPivot('pourcentage_participation', 'qualite')
                    ->withTimestamps();
    }
    
    // Tâches dont il est responsable
    public function taches()
    {
        return $this->hasMany(Tache::class, 'responsable_id');
    }
}
