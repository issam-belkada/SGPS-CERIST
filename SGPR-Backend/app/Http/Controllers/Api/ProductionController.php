<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductionScientifique;
use App\Models\ProductionTechnologique;
use App\Models\Projet;
use Illuminate\Http\Request;

class ProductionController extends Controller
{
    /**
     * Enregistrer une nouvelle Publication (Article ou Conférence)
     */
    public function storeScientifique(Request $request, Projet $projet)
    {
        // 1. Vérifier si l'utilisateur est membre du projet
        if (!$projet->membres()->where('user_id', auth()->id())->exists()) {
            return response()->json(['error' => 'Vous ne faites pas partie de ce projet.'], 403);
        }

        $validated = $request->validate([
            'type' => 'required|in:Publication_Inter,Publication_Nat,Communication_Inter,Communication_Nat,Chapitre_Livre,Livre',
            'titre' => 'required|string|max:255',
            'auteurs' => 'required|string',
            'revue_ou_conference' => 'required|string|max:255',
            'date_parution' => 'required|date',
        ]);


        $production = $projet->productionsScientifiques()->create(array_merge($validated, [
            'user_id' => auth()->id() // Celui qui a déclaré la production
        ]));

        return response()->json(['message' => 'Production scientifique enregistrée', 'data' => $production], 201);
    }

    /**
     * Enregistrer un Produit Technique (Logiciel, Prototype, Brevet)
     */
    public function storeTechnologique(Request $request, Projet $projet)
    {
        if (!$projet->membres()->where('user_id', auth()->id())->exists()) {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        $validated = $request->validate([
            'type' => 'required|in:Logiciel,Produit,Brevet,Prototype',
            'intitule' => 'required|string|max:255',
            'description' => 'nullable|string',
            'refrence' => 'nullable|string|max:255',
        ]);

        $produit = $projet->productionsTechnologiques()->create(array_merge($validated, [
            'user_id' => auth()->id()
        ]));

        return response()->json(['message' => 'Production technologique enregistrée', 'data' => $produit], 201);
    }
}
