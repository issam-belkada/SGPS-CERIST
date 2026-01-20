<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tache;
use App\Models\WorkPackage;
use Illuminate\Http\Request;

class TacheController extends Controller
{
    // Créer une tâche dans un WP
    public function store(Request $request)
{
    $validated = $request->validate([
        'nom' => 'required|string|max:255',
        'description' => 'nullable|string',
        'date_debut' => 'required|date',
        'date_fin' => 'required|date|after_or_equal:date_debut',
        'responsable_id' => 'required|exists:users,id',
        'work_package_id' => 'required|exists:work_packages,id',
        'livrables' => 'nullable|array',
        'livrables.*.titre' => 'required|string|max:255',
        'livrables.*.type' => 'required|string',
    ]);

    try {
        return \DB::transaction(function () use ($validated) {
            // 1. Création de la tâche
            $tache = Tache::create([
                'nom' => $validated['nom'],
                'description' => $validated['description'] ?? '',
                'date_debut' => $validated['date_debut'],
                'date_fin' => $validated['date_fin'],
                'responsable_id' => $validated['responsable_id'],
                'work_package_id' => $validated['work_package_id'],
                'etat' => 'A faire', // État initial par défaut
            ]);

            // 2. Création des livrables "vides" associés
            if (!empty($validated['livrables'])) {
                foreach ($validated['livrables'] as $livrableData) {
                    $tache->livrables()->create([
                        'titre' => $livrableData['titre'],
                        'type' => $livrableData['type'],
                        'fichier_path' => 'waiting_upload', // Marqueur pour le front-end
                        'date_depot' => null,
                    ]);
                }
            }

            return response()->json([
                'message' => 'Tâche et livrables créés avec succès',
                'tache' => $tache->load('livrables')
            ], 201);
        });
    } catch (\Exception $e) {
        return response()->json(['message' => 'Erreur lors de la création : ' . $e.getMessage()], 500);
    }
}


    public function show($id)
{
    // Suppression du 'l' inutile qui causait l'erreur 500
    $tache = Tache::with([
        'workPackage.projet', 
        'livrables.depositaire', 
        'responsable'
    ])->find($id);

    if (!$tache) {
        return response()->json(['message' => 'Tâche non trouvée'], 404);
    }

    return response()->json($tache);
}

    // Mettre à jour l'état ou les infos d'une tâche
    public function update(Request $request, Tache $tache)
{
    $user = auth()->user();
    // On vérifie si l'utilisateur est responsable de la tâche ou chef de projet
    if ($user->id !== $tache->responsable_id && $user->id !== $tache->workPackage->projet->chef_projet_id) {
        return response()->json(['error' => 'Non autorisé'], 403);
    }

    $validated = $request->validate([
        'etat' => 'required|in:En attente,En cours,Terminé,A faire',
        'livrable_titre' => 'nullable|string|max:255'
    ]);

    $tache->update(['etat' => $request->etat]);

    // Si un titre de livrable est fourni, on le crée
    if ($request->filled('livrable_titre')) {
        $tache->livrables()->create([
            'titre' => $request->livrable_titre,
            'projet_id' => $tache->workPackage->projet_id,
            'chercheur_id' => $user->id,
            'date_depot' => now(),
            'type' => 'Document de travail',
            'chemin_fichier' => 'draft'
        ]);
    }

    return response()->json($tache->load('livrables'));
}

    public function mesTaches()
{
    // Récupère les tâches assignées à l'utilisateur avec les infos du projet
    return Tache::where('responsable_id', auth()->id())
        ->with(['workPackage.projet'])
        ->orderBy('date_fin', 'asc')
        ->get();
}



    public function updateStatus(Request $request, $id)
{
    $tache = Tache::findOrFail($id);
    $user = auth()->user();

    // DEBUG : Vérifiez vos logs si ça bloque encore
    // \Log::info("User ID: " . $user->id . " | Responsable ID: " . $tache->responsable_id);

    // 1. Vérification Responsable (Utilisez == pour éviter les soucis de type)
    if ($user->id != $tache->responsable_id) {
        return response()->json(['message' => 'Action interdite : Vous n\'êtes pas le responsable.'], 403);
    }

    // 2. Vérification Projet en cours
    if ($tache->workPackage->projet->statut !== 'enCours') {
        return response()->json(['message' => 'Le projet doit être "en cours".'], 422);
    }

    $validated = $request->validate([
        'etat' => 'required|in:A faire,En cours,Terminé',
    ]);

    $tache->update(['etat' => $request->etat]);

    return response()->json($tache);
}







}
