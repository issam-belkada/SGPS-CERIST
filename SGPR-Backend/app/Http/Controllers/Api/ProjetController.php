<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Projet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProjetController extends Controller
{
    /**
     * Liste des projets filtrée selon les permissions de l'utilisateur.
     */
    public function index()
    {
        $user = Auth::user();

        // 1. Admin ou Chef CS voient tous les projets du centre
        if ($user->hasRole(['Admin', 'ChefCS'])) {
            $projets = Projet::with(['chefProjet', 'division'])->get();
        } 
        // 2. Le Chef de Division voit les projets de sa division uniquement
        elseif ($user->hasRole('ChefDivision')) {
            $projets = Projet::where('division_id', $user->division_id)
                ->with(['chefProjet'])
                ->get();
        } 
        // 3. Le Chercheur/Chef de Projet voit ses propres projets (supervisés ou membre)
        else {
            $projets = Projet::where('chef_projet_id', $user->id)
                ->orWhereHas('membres', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->with(['division', 'chefProjet'])
                ->get();
        }

        return response()->json($projets);
    }


    public function myProjects(Request $request) {
    // Récupère les projets où l'utilisateur est soit le chef soit un membre
    return $request->user()->projets()->withCount('membres')->get();
    }




    /**
     * Soumission d'une nouvelle proposition (Règle : 1 seul projet supervisé actif).
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // RÈGLE MÉTIER : Vérifier si l'utilisateur supervise déjà un projet actif
        $dejaSuperviseur = Projet::where('chef_projet_id', $user->id)
            ->whereIn('statut', ['Proposé', 'Valide_Division', 'Nouveau', 'enCours'])
            ->exists();

        if ($dejaSuperviseur) {
            return response()->json([
                'error' => 'Action refusée : Vous supervisez déjà un projet actif (en cours ou en validation).'
            ], 403);
        }

        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'nature' => 'required|string',
            'type' => 'required|string',
            'resume' => 'required|string',
            'problematique' => 'required|string',
            'objectifs' => 'required|string',
            'duree_mois' => 'required|integer|min:6|max:48',
        ]);

        // Création avec les infos de l'utilisateur connecté
        $projet = Projet::create(array_merge($validated, [
            'chef_projet_id' => $user->id,
            'division_id' => $user->division_id,
            'statut' => 'Proposé' // Statut initial par défaut
        ]));

        // Auto-ajouter le porteur comme membre de l'équipe à 100%
        $projet->membres()->attach($user->id, [
            'pourcentage_participation' => 100,
            'qualite' => 'permanent'
        ]);

        return response()->json(['message' => 'Proposition soumise avec succès.', 'projet' => $projet], 201);
    }

    /**
     * Détails d'un projet spécifique.
     */
    public function show(Projet $projet)
    {
        // On charge les relations nécessaires pour React (Équipe, WPs, Tâches)
        $projet->load(['chefProjet', 'division', 'membres', 'workPackages.taches']);
        return response()->json($projet);
    }

    /**
     * Étape 1 : Validation par le Chef de Division.
     */
    public function validerParDivision(Projet $projet)
    {
        if ($projet->statut !== 'Proposé') {
            return response()->json(['error' => 'Le projet n\'est pas en attente de validation division.'], 400);
        }

        $projet->update(['statut' => 'Valide_Division']);
        return response()->json(['message' => 'Projet validé par la division.']);
    }

    /**
     * Étape 2 : Approbation finale par le Conseil Scientifique.
     */
    public function approuverParCS(Projet $projet)
    {
        if ($projet->statut !== 'Valide_Division') {
            return response()->json(['error' => 'Le projet doit d\'abord être validé par la division.'], 400);
        }

        $projet->update(['statut' => 'Nouveau']);
        return response()->json(['message' => 'Projet approuvé par le CS. En attente de lancement par le chercheur.']);
    }

    /**
     * Étape 3 : Lancement du projet par le Chercheur (Chef de Projet).
     */
    public function lancerProjet(Projet $projet)
    {
        $user = Auth::user();

        if ($projet->chef_projet_id !== $user->id) {
            return response()->json(['error' => 'Seul le porteur du projet peut le lancer.'], 403);
        }

        if ($projet->statut !== 'Nouveau') {
            return response()->json(['error' => 'Le projet n\'est pas encore approuvé pour lancement.'], 400);
        }

        $dateDebut = now();
        $dateFin = $dateDebut->copy()->addMonths($projet->duree_mois);

        $projet->update([
            'statut' => 'enCours',
            'date_debut' => $dateDebut,
            'date_fin' => $dateFin
        ]);

        // Mise à jour automatique du rôle de l'utilisateur si nécessaire
        if (!$user->hasRole('ChefProjet')) {
            $user->assignRole('ChefProjet');
        }

        return response()->json(['message' => 'Le projet est maintenant officiellement en cours.']);
    }


    /**
     * Ajouter un chercheur à l'équipe du projet.
     */
    public function ajouterMembre(Request $request, Projet $projet)
    {
        // 1. Sécurité : Seul le chef de projet peut modifier son équipe
        if (auth()->id() !== $projet->chef_projet_id && !auth()->user()->hasRole('Admin')) {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'pourcentage_participation' => 'required|integer|min:1|max:100',
            'qualite' => 'required|in:permanent,associe',
        ]);

        // 2. Vérifier si le membre est déjà dans l'équipe
        if ($projet->membres()->where('user_id', $validated['user_id'])->exists()) {
            return response()->json(['error' => 'Ce chercheur fait déjà partie de l\'équipe.'], 422);
        }

        // 3. Attachement dans la table pivot
        $projet->membres()->attach($validated['user_id'], [
            'pourcentage_participation' => $validated['pourcentage_participation'],
            'qualite' => $validated['qualite']
        ]);

        return response()->json(['message' => 'Membre ajouté avec succès.']);
    }

    /**
     * Retirer un membre de l'équipe.
     */
    public function retirerMembre(Projet $projet, $userId)
    {
        if (auth()->id() !== $projet->chef_projet_id && !auth()->user()->hasRole('Admin')) {
            return response()->json(['error' => 'Non autorisé.'], 403);
        }

        // On ne peut pas retirer le chef de projet de sa propre équipe
        if ((int)$userId === $projet->chef_projet_id) {
            return response()->json(['error' => 'Le chef de projet ne peut pas être retiré.'], 422);
        }

        $projet->membres()->detach($userId);

        return response()->json(['message' => 'Membre retiré de l\'équipe.']);
    }

}