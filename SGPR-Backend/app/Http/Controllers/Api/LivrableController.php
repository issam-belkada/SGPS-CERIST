<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Livrable;
use App\Models\Projet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\Tache;
use Illuminate\Support\Str;

class LivrableController extends Controller
{
    public function index(Projet $projet)
    {
        return response()->json($projet->livrables()->with(['tache', 'depositaire'])->get());
    }

    public function store(Request $request, Projet $projet)
    {
        // Seul un membre du projet peut déposer un livrable
        if (!$projet->membres()->where('user_id', auth()->id())->exists()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'tache_id' => 'nullable|exists:taches,id',
            'titre' => 'required|string|max:255',
            'type' => 'required|in:Rapport_Technique,Manuel_Utilisateur,Code_Source,Synthese_Biblio,Expertise',
            'fichier' => 'required|file|mimes:pdf,zip,rar,doc,docx|max:20480',
        ]);

        if ($request->hasFile('fichier')) {
            $path = $request->file('fichier')->store('livrables/projet_' . $projet->id);
            
            $livrable = Livrable::create([
                'projet_id' => $projet->id,
                'tache_id' => $validated['tache_id'] ?? null,
                'titre' => $validated['titre'],
                'type' => $validated['type'],
                'fichier_path' => $path,
                'date_depot' => now(),
                'depose_par' => auth()->id()
            ]);

            return response()->json($livrable, 201);
        }
    }


    public function storeFromTache(Request $request) 
{
    // 1. Validation des données
    $request->validate([
        'tache_id' => 'required|exists:taches,id',
        'titre' => 'required|string|max:255',
        'type' => 'required|in:Rapport_Technique,Manuel_Utilisateur,Code_Source,Synthese_Biblio,Expertise,Logiciel_Code,Prototype,Publication,Brevet,Autre',
        'fichier' => 'required|file|max:20480', // Max 20Mo
    ]);

    // 2. Récupération de la tâche et du projet lié
    $tache = Tache::with('workPackage')->findOrFail($request->tache_id);
    $projetId = $tache->workPackage->projet_id;

    // 3. Stockage du fichier
    if ($request->hasFile('fichier')) {
        $path = $request->file('fichier')->store('livrables/projet_' . $projetId);

        // 4. Création de l'enregistrement
        $livrable = Livrable::create([
            'projet_id'   => $projetId,
            'tache_id'    => $tache->id,
            'titre'       => $request->titre,
            'type'        => $request->type,
            'fichier_path'=> $path,
            'date_depot'  => now(),
            'depose_par'  => auth()->id()
        ]);

        return response()->json($livrable, 201);
    }

    return response()->json(['message' => 'Fichier manquant'], 400);
}




     public function updateMissingLivrable(Request $request, $id)
{
    // 1. Validation (Titre optionnel car déjà défini par le CP, mais on laisse la liberté)
    $request->validate([
        'titre' => 'sometimes|required|string|max:255',
        'type' => 'required|in:Rapport_Technique,Manuel_Utilisateur,Code_Source,Synthese_Biblio,Expertise,Logiciel_Code,Prototype,Publication,Brevet,Autre',
        'fichier' => 'required|file|max:20480', // 20Mo
    ]);

    // 2. Trouver le livrable spécifique
    $livrable = Livrable::findOrFail($id);

    // Sécurité : Vérifier s'il appartient bien à la tâche
    if ($livrable->tache_id != $request->tache_id) {
        return response()->json(['message' => 'Action non autorisée'], 403);
    }

    // 3. Stockage du fichier
    if ($request->hasFile('fichier')) {
        // On récupère le projetId via la relation
        $projetId = $livrable->projet_id;
        $path = $request->file('fichier')->store('livrables/projet_' . $projetId);

        // 4. Mise à jour au lieu de Création
        $livrable->update([
            'titre' => $request->titre ?? $livrable->titre,
            'type' => $request->type ?? $livrable->type,
            'fichier_path' => $path,
            'date_depot' => now(),
            'depose_par' => auth()->id() // Celui qui fait l'upload devient le dépositaire
        ]);

        return response()->json($livrable, 200);
    }
}





public function destroy(Livrable $livrable)
{
    $user = auth()->user();
    $projet = $livrable->projet;

    // Vérification des droits
    $isOwner = $livrable->depose_par === $user->id;
    $isChefProjet = $projet->chef_projet_id === $user->id;

    if (!$isOwner && !$isChefProjet) {
        return response()->json([
            'message' => 'Action non autorisée. Seul l\'auteur ou le chef de projet peut supprimer ce fichier.'
        ], 403);
    }

    // Suppression physique du fichier
    if (Storage::exists($livrable->fichier_path)) {
        Storage::delete($livrable->fichier_path);
    }

    $livrable->delete();

    return response()->json(['message' => 'Livrable supprimé avec succès']);
}





    public function download(Livrable $livrable)
{
    // Debug : Vérifiez si le chemin stocké en base correspond au dossier storage/app/
    if (!Storage::exists($livrable->fichier_path)) {
        return response()->json(['error' => 'Fichier introuvable'], 404);
    }

    // Récupérer l'extension originale du fichier stocké
    $extension = pathinfo($livrable->fichier_path, PATHINFO_EXTENSION);
    
    // Nettoyer le nom du fichier pour éviter les problèmes d'espaces
    $slugTitre = Str::slug($livrable->titre);
    $fileName = $slugTitre . '.' . $extension;

    return Storage::download($livrable->fichier_path, $fileName);
}
}