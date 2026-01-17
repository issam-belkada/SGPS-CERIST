<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Nettoyer le cache de Spatie
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // --- 1. DÉFINITION DE TOUTES LES PERMISSIONS POSSIBLES ---

        $perms = [
            // GESTION DES PROJETS (Cycle de vie)
            'proposer-projet',
            'modifier-propre-projet',     // Chef de Projet : modifie avant validation
            'lancer-projet-approuve',     // Chef de Projet : passage de 'Nouveau' à 'En cours'
            'annuler-projet',             // Chef de Projet ou Admin
            
            // VALIDATIONS HIÉRARCHIQUES
            'valider-projet-division',    // Chef Division : étape 1
            'approuver-projet-cs',        // Chef CS : étape 2 (devient 'Nouveau')
            'voir-statistiques-division',
            
            // OPÉRATIONS SUR PROJET (En cours)
            'gerer-equipe',               // Chef de Projet : ajouter/retirer des membres
            'creer-wp-taches',            // Chef de Projet : planification
            'modifier-taches',            // Chercheur (ses tâches) / Chef de projet (toutes)
            'deposer-livrable',           // Tous les membres du projet
            
            // BILANS ET PRODUCTIONS
            'remplir-production-science', // Chercheur : publications, communications
            'remplir-production-tech',    // Chercheur : logiciels, brevets
            'remplir-encadrement',        // Chercheur : thèses, masters
            'soumettre-bilan-annuel',     // Chef de Projet : envoi à la division
            'evaluer-bilan-annuel',       // Chef Division : donner un avis sur le bilan
            
            // SYNTHÈSE ET CONSEIL SCIENTIFIQUE
            'generer-bilan-division',     // Chef Division : synthèse de tous les projets
            'organiser-session-cs',       // Chef CS : créer les réunions
            'saisir-decision-cs',         // Chef CS : verdict final sur les projets
            'generer-rapport-annuel-cs',  // Chef CS : bilan global du CERIST
            
            // ADMINISTRATION SYSTÈME
            'gerer-utilisateurs',
            'gerer-divisions',
            'gerer-roles-permissions',
        ];

        foreach ($perms as $p) {
            Permission::create(['name' => $p]);
        }


        // ROLE : CHERCHEUR (Base)
        $chercheur = Role::create(['name' => 'Chercheur']);
        $chercheur->givePermissionTo([
            'proposer-projet',
            'modifier-taches',
            'deposer-livrable',
            'remplir-production-science',
            'remplir-production-tech',
            'remplir-encadrement'
        ]);

        // ROLE : CHEF DE PROJET (Chercheur + Supervision)
        $chefProjet = Role::create(['name' => 'ChefProjet']);
        $chefProjet->givePermissionTo([
            'proposer-projet', 'modifier-taches', 'deposer-livrable',
            'remplir-production-science', 'remplir-production-tech', 'remplir-encadrement', // Droits chercheur
            'modifier-propre-projet',
            'lancer-projet-approuve',
            'gerer-equipe',
            'creer-wp-taches',
            'soumettre-bilan-annuel'
        ]);

        // ROLE : CHEF DE DIVISION (Validation et Synthèse)
        $chefDiv = Role::create(['name' => 'ChefDivision']);
        $chefDiv->givePermissionTo([
            'valider-projet-division',
            'evaluer-bilan-annuel',
            'generer-bilan-division',
            'voir-statistiques-division'
        ]);

        // ROLE : CHEF CS (Direction Scientifique)
        $chefCS = Role::create(['name' => 'ChefCS']);
        $chefCS->givePermissionTo([
            'approuver-projet-cs',
            'organiser-session-cs',
            'saisir-decision-cs',
            'generer-rapport-annuel-cs'
        ]);

        // ROLE : ADMIN
        $admin = Role::create(['name' => 'Admin']);
        $admin->givePermissionTo(Permission::all());
    }
}
