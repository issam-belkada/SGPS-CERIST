<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Encadrement;
use App\Models\BilanAnnuel;
use Illuminate\Http\Request;

class EncadrementController extends Controller
{
    /**
     * Liste des encadrements d'un bilan spécifique
     */
    public function index(BilanAnnuel $bilan)
    {
        return response()->json($bilan->encadrements);
    }

    /**
     * Ajouter un nouvel étudiant encadré (Section 4.3)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'bilan_id' => 'required|exists:bilans_annuels,id',
            'nom_etudiant' => 'required|string|max:255',
            'type_diplome' => 'required|in:Doctorat,Master,Magister,PFE,Licence',
            'sujet' => 'required|string',
            'etablissement' => 'required|string',
            'etat_avancement' => 'required|in:En cours,Soutenu',
        ]);

        // Vérification : Seul le chef de projet peut ajouter des données au bilan
        $bilan = BilanAnnuel::findOrFail($validated['bilan_id']);
        if (auth()->id() !== $bilan->projet->chef_projet_id) {
            return response()->json(['error' => 'Action non autorisée'], 403);
        }

        // Empêcher l'ajout si le bilan est déjà soumis ou validé
        if ($bilan->etat_validation !== 'Brouillon') {
            return response()->json(['error' => 'Le bilan est verrouillé (déjà soumis ou validé)'], 422);
        }

        $encadrement = Encadrement::create($validated);

        return response()->json([
            'message' => 'Étudiant ajouté avec succès',
            'encadrement' => $encadrement
        ], 201);
    }

    /**
     * Supprimer un encadrement
     */
    public function destroy(Encadrement $encadrement)
    {
        $bilan = $encadrement->bilan;

        if (auth()->id() !== $bilan->projet->chef_projet_id) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        if ($bilan->etat_validation !== 'Brouillon') {
            return response()->json(['error' => 'Modification impossible sur un bilan soumis'], 422);
        }

        $encadrement->delete();

        return response()->json(['message' => 'Encadrement supprimé']);
    }
}
