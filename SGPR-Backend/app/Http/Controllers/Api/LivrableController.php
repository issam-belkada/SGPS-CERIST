<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Livrable;
use App\Models\Projet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

    public function download(Livrable $livrable)
    {
        return Storage::download($livrable->fichier_path, $livrable->titre);
    }
}