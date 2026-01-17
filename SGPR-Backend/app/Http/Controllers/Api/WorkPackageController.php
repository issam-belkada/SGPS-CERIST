<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkPackage;
use App\Models\Projet;
use Illuminate\Http\Request;

class WorkPackageController extends Controller
{
    // Lister les WP d'un projet avec leurs tâches
    public function index(Projet $projet)
    {
        return response()->json($projet->workPackages()->with('taches.responsable')->get());
    }

    // Créer un WP (Chef de projet uniquement)
    public function store(Request $request, Projet $projet)
    {
        if (auth()->id() !== $projet->chef_projet_id) {
            return response()->json(['error' => 'Seul le chef de projet peut créer des WP'], 403);
        }

        $validated = $request->validate([
            'code_wp' => 'required|string|max:10',
            'titre' => 'required|string|max:255',
            'objectifs' => 'nullable|string',
        ]);

        $wp = $projet->workPackages()->create($validated);
        return response()->json($wp, 201);
    }

    public function destroy(WorkPackage $workPackage)
    {
        if (auth()->id() !== $workPackage->projet->chef_projet_id) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }
        $workPackage->delete();
        return response()->json(['message' => 'WP supprimé']);
    }
}
