<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductionTechnologique;
use App\Models\BilanAnnuel;
use Illuminate\Http\Request;

class ProductionTechnologiqueController extends Controller
{
    /**
     * Liste des produits/logiciels d'un bilan
     */
    public function index(BilanAnnuel $bilan)
    {
        return response()->json($bilan->productionsTechnologiques);
    }

    /**
     * Ajouter un produit, logiciel ou brevet (Section 4.2)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'bilan_id'  => 'required|exists:bilans_annuels,id',
            'type'      => 'required|in:Produit,Logiciel,Brevet,Prototype',
            'intitule'  => 'required|string|max:255',
            'description' => 'nullable|string',
            'reference'   => 'nullable|string|max:255', // ex: N° de dépôt de brevet
        ]);

        $bilan = BilanAnnuel::findOrFail($validated['bilan_id']);

        // SÉCURITÉ : Seul le Chef de Projet peut ajouter
        if (auth()->id() !== $bilan->projet->chef_projet_id) {
            return response()->json(['error' => 'Seul le chef de projet peut ajouter des produits.'], 403);
        }

        // VERROUILLAGE : Uniquement si c'est un brouillon
        if (!in_array($bilan->etat_validation, ['Brouillon', 'Rejeté'])) {
            return response()->json(['error' => 'Le bilan est verrouillé.'], 422);
        }

        $produit = ProductionTechnologique::create(array_merge($validated, [
            'projet_id' => $bilan->projet_id,
            'user_id'   => auth()->id(),
            'annee'     => $bilan->annee
        ]));

        return response()->json([
            'message' => 'Production technologique ajoutée',
            'data' => $produit
        ], 201);
    }

    /**
     * Supprimer un produit
     */
    public function destroy(ProductionTechnologique $production)
    {
        // On récupère le bilan lié pour vérifier l'état
        $bilan = BilanAnnuel::where('projet_id', $production->projet_id)
                            ->where('annee', $production->annee)
                            ->first();

        if (!$bilan || auth()->id() !== $bilan->projet->chef_projet_id) {
            return response()->json(['error' => 'Action non autorisée.'], 403);
        }

        if (!in_array($bilan->etat_validation, ['Brouillon', 'Rejeté'])) {
            return response()->json(['error' => 'Bilan verrouillé.'], 422);
        }

        $production->delete();

        return response()->json(['message' => 'Produit supprimé avec succès.']);
    }
}
