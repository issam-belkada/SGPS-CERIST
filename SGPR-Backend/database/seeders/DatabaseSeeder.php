<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Division;
use App\Models\Projet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Initialiser les droits
        $this->call(PermissionsSeeder::class);


        User::create([
            'nom' => 'Admin', 'prenom' => 'SGPR',
            'email' => 'admin@cerist.dz',
            'password' => Hash::make('adminpassword'),
            'grade' => 'DR',
            'specialite' => 'Informatique',
        ]);

        // 2. Création des divisions
        $dsi = Division::create(['nom' => 'Division Systèmes d’Information', 'acronyme' => 'DSI']);

        // 3. Création des utilisateurs types
        
        // Un Chef CS
        $userCS = User::create([
            'nom' => 'Aissani', 'prenom' => 'Djamil',
            'email' => 'cs@cerist.dz',
            'password' => Hash::make('password'),
            'grade' => 'PR', 'specialite' => 'Recherche',
            'division_id' => $dsi->id,
        ]);
        $userCS->assignRole('ChefCS');

        // Un Chef de Division
        $userChefDiv = User::create([
            'nom' => 'Brahimi', 'prenom' => 'Amine',
            'email' => 'chef.div@cerist.dz',
            'password' => Hash::make('password'),
            'grade' => 'DR', 'specialite' => 'Informatique',
            'division_id' => $dsi->id,
        ]);
        $userChefDiv->assignRole('ChefDivision');

        // Un chercheur qui est actuellement Chef de Projet (déjà un projet en cours)
        $userCP = User::create([
            'nom' => 'Mansouri', 'prenom' => 'Lamine',
            'email' => 'chef.projet@cerist.dz',
            'password' => Hash::make('password'),
            'grade' => 'MRA', 'specialite' => 'IA',
            'division_id' => $dsi->id,
        ]);
        $userCP->assignRole('ChefProjet');

        // Un simple chercheur (Porteur potentiel)
        $userChercheur = User::create([
            'nom' => 'Zidani', 'prenom' => 'Sara',
            'email' => 'chercheur@cerist.dz',
            'password' => Hash::make('password'),
            'grade' => 'CR', 'specialite' => 'Data Science',
            'division_id' => $dsi->id,
        ]);
        $userChercheur->assignRole('Chercheur');

        // 4. Création d'un projet "En cours"
        Projet::create([
            'titre' => 'Analyse des données massives',
            'nature' => 'Recherche',
            'type' => 'PNR',
            'resume' => 'Résumé du projet de Big Data...', // CHAMP AJOUTÉ
            'problematique' => 'Comment traiter les pétaoctets ?', // CHAMP AJOUTÉ
            'objectifs' => 'Optimiser les algorithmes de tri.', // CHAMP AJOUTÉ
            'duree_mois' => 24,
            'statut' => 'enCours',
            'chef_projet_id' => $userCP->id,
            'division_id' => $dsi->id,
            'date_debut' => now()->subYear(),
        ]);
        
        // 5. Création d'un projet "Proposé"
        Projet::create([
            'titre' => 'Nouvelle plateforme IoT',
            'nature' => 'Développement',
            'type' => 'Interne',
            'resume' => 'Plateforme pour capteurs intelligents...', // CHAMP AJOUTÉ
            'problematique' => 'Interopérabilité des capteurs.', // CHAMP AJOUTÉ
            'objectifs' => 'Connecter 1000 capteurs.', // CHAMP AJOUTÉ
            'duree_mois' => 12,
            'statut' => 'Proposé',
            'chef_projet_id' => $userChercheur->id,
            'division_id' => $dsi->id,
        ]);
    }
}
