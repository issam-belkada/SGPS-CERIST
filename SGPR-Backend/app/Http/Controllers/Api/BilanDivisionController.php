<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BilanDivision;
use App\Models\BilanAnnuel;
use App\Models\Division;
use App\Models\User;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class BilanDivisionController extends Controller
{
    /**
     * Préparer/Générer le bilan de division (Mode Brouillon)
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        // Sécurité : Seul un Chef de Division peut créer ce type de bilan
        if (!$user->hasRole('ChefDivision')) {
            return response()->json(['error' => 'Action réservée aux chefs de division.'], 403);
        }

        $validated = $request->validate([
            'annee' => 'required|integer',
            'formation_qualifiante' => 'nullable|string',
            'sejours_etranger' => 'nullable|string',
            'animation_scientifique' => 'nullable|string',
            'cooperation_partenariat' => 'nullable|string',
        ]);

        // 1. Calculer automatiquement le potentiel chercheur (Statistiques Personnel)
        // On compte les grades des membres rattachés à cette division
        $statsPersonnel = User::where('division_id', $user->division_id)
            ->groupBy('grade')
            ->selectRaw('grade, count(*) as total')
            ->pluck('total', 'grade')
            ->toArray();

        // 2. Créer ou mettre à jour le bilan de division
        $bilanDivision = BilanDivision::updateOrCreate(
            ['division_id' => $user->division_id, 'annee' => $validated['annee']],
            array_merge($validated, [
                'statistiques_personnel' => $statsPersonnel,
                'chef_division_id' => $user->id,
                'etat' => 'Brouillon'
            ])
        );

        // 3. Attacher automatiquement tous les bilans de projets "Validés" de la division pour cette année
        $bilansProjetsIds = BilanAnnuel::where('annee', $validated['annee'])
            ->where('etat_validation', 'Validé') // Uniquement ceux validés par le chef de division
            ->whereHas('projet', function($q) use ($user) {
                $q->where('division_id', $user->division_id);
            })
            ->pluck('id');

        $bilanDivision->bilansProjets()->sync($bilansProjetsIds);

        return response()->json([
            'message' => 'Bilan de division généré avec succès.',
            'data' => $bilanDivision->load('bilansProjets.projet')
        ], 201);
    }

    /**
     * Transmettre le bilan consolidé au Conseil Scientifique (CS)
     */
    public function transmettreAuCS(BilanDivision $bilanDivision)
    {
        if (auth()->id() !== $bilanDivision->chef_division_id) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $bilanDivision->update(['etat' => 'Transmis_au_CS']);

        return response()->json(['message' => 'Bilan de division transmis au Conseil Scientifique.']);
    }


    public function telechargerPDF(BilanDivision $bilanDivision)
    {
        // Chargement des relations pour éviter les requêtes N+1
        $bilanDivision->load([
            'division',
            'chefDivision',
            'bilansProjets.projet.chefProjet',
            'bilansProjets.projet.membres'
        ]);
    
        // Préparation des données pour le PDF
        $pdf = Pdf::loadView('pdfs.bilan_division', [
            'bilan' => $bilanDivision,
            'projets' => $bilanDivision->bilansProjets,
            'stats' => $bilanDivision->statistiques_personnel
        ]);
    
        // Format A4 Paysage souvent préférable pour les tableaux de synthèse
        return $pdf->setPaper('a4', 'portrait')
                   ->download("Bilan_Division_{$bilanDivision->division->acronyme}_{$bilanDivision->annee}.pdf");
    }
}
