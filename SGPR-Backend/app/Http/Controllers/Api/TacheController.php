<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tache;
use App\Models\WorkPackage;
use Illuminate\Http\Request;

class TacheController extends Controller
{
    // Créer une tâche dans un WP
    public function store(Request $request, WorkPackage $workPackage)
    {
        // Vérifier si l'utilisateur est le chef du projet lié au WP
        if (auth()->id() !== $workPackage->projet->chef_projet_id) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'responsable_id' => 'required|exists:users,id',
            'etat' => 'required|in:A faire,En cours,Terminé',
        ]);

        $tache = $workPackage->taches()->create($validated);
        return response()->json($tache, 201);
    }

    // Mettre à jour l'état ou les infos d'une tâche
    public function update(Request $request, Tache $tache)
    {
        $user = auth()->user();
        $isChef = $user->id === $tache->workPackage->projet->chef_projet_id;
        $isResponsable = $user->id === $tache->responsable_id;

        if (!$isChef && !$isResponsable) {
            return response()->json(['error' => 'Vous n\'avez pas le droit de modifier cette tâche'], 403);
        }

        $rules = $isChef ? [
            'nom' => 'string',
            'etat' => 'in:A faire,En cours,Terminé',
            'responsable_id' => 'exists:users,id'
        ] : [
            'etat' => 'required|in:A faire,En cours,Terminé'
        ];

        $validated = $request->validate($rules);
        $tache->update($validated);

        return response()->json($tache);
    }
}
