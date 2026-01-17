<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductionScientifique;
use App\Models\BilanAnnuel;
use Illuminate\Http\Request;

class ProductionScientifiqueController extends Controller
{
    /**
     * Liste des publications d'un bilan
     */
    public function index(BilanAnnuel $bilan)
    {
        return response()->json($bilan->productionsScientifiques);
    }

    /**
     * Ajouter une publication (Section 4.1 : Livres, Articles, Communications)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'bilan_id'         => 'required|exists:bilans_annuels,id',
            'type'             => 'required|in:Livre,Publication_Inter,Publication_Nat,Communication_Inter,Communication_Nat,Chapitre_Livre',
            'titre'            => 'required|string|max:255',
            'auteurs'          => 'required|string',
            'revue_conference' => 'required|string|max:255',
        ]);

        $bilan = BilanAnnuel::findOrFail($validated['bilan_id']);

        // SÉCURITÉ : Seul le Chef de Projet a la main
        if (auth()->id() !== $bilan->projet->chef_projet_id) {
            return response()->json(['error' => 'Seul le chef de projet peut ajouter des publications.'], 403);
        }

        // ÉTAT : Modification possible uniquement en Brouillon ou Rejeté
        if (!in_array($bilan->etat_validation, ['Brouillon', 'Rejeté'])) {
            return response()->json(['error' => 'Le bilan est verrouillé pour modification.'], 422);
        }

        $publication = ProductionScientifique::create(array_merge($validated, [
            'projet_id' => $bilan->projet_id,
            'user_id'   => auth()->id(),
            'annee'     => $bilan->annee // On synchronise avec l'année du bilan
        ]));

        return response()->json([
            'message' => 'Production scientifique ajoutée avec succès.',
            'data'    => $publication
        ], 201);
    }

    /**
     * Supprimer une publication
     */
    public function destroy(ProductionScientifique $production)
    {
        $bilan = BilanAnnuel::where('projet_id', $production->projet_id)
                            ->where('annee', $production->annee)
                            ->first();

        if (!$bilan || auth()->id() !== $bilan->projet->chef_projet_id) {
            return response()->json(['error' => 'Action non autorisée.'], 403);
        }

        if (!in_array($bilan->etat_validation, ['Brouillon', 'Rejeté'])) {
            return response()->json(['error' => 'Impossible de supprimer : bilan déjà transmis.'], 422);
        }

        $production->delete();

        return response()->json(['message' => 'Publication retirée du bilan.']);
    }
}
