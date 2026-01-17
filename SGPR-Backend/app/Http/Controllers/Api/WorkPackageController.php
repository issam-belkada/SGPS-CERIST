<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkPackage;
use App\Models\Projet;
use Illuminate\Http\Request;

class WorkPackageController extends Controller
{
    /**
     * Ajouter un WP à un projet
     */
    public function store(Request $request, Projet $projet)
    {
        // Seul le chef de projet peut planifier
        if (auth()->id() !== $projet->chef_projet_id) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'code_wp' => 'required|string|max:10', // ex: WP1, WP2
            'titre' => 'required|string|max:255',
            'objectifs' => 'nullable|string',
        ]);

        $wp = $projet->workPackages()->create($validated);

        return response()->json([
            'message' => 'Work Package ajouté',
            'work_package' => $wp
        ], 201);
    }

    /**
     * Ajouter une tâche à un Work Package
     */
    public function ajouterTache(Request $request, WorkPackage $wp)
    {
        $projet = $wp->projet;

        if (auth()->id() !== $projet->chef_projet_id) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'responsable_id' => 'required|exists:users,id', // Un membre de l'équipe
        ]);

        // Vérifier si le responsable fait bien partie de l'équipe du projet
        $estMembre = $projet->membres()->where('user_id', $validated['responsable_id'])->exists();
        if (!$estMembre) {
            return response()->json(['error' => 'Le responsable doit être membre de l\'équipe'], 422);
        }

        $tache = $wp->taches()->create(array_merge($validated, ['etat' => 'En attente']));

        return response()->json($tache, 201);
    }
}
