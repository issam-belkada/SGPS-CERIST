<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BilanAnnuelCs;
use App\Models\SessionCs;
use App\Models\BilanDivision;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class BilanAnnuelCsController extends Controller
{
    /**
     * Créer ou mettre à jour le bilan d'une session
     */
    public function storeOrUpdate(Request $request, SessionCs $session)
    {
        $validated = $request->validate([
            'introduction_generale' => 'required|string',
            'synthese_nationale_scientifique' => 'required|string',
            'recommandations_strategiques' => 'required|string',
            'etat' => 'required|in:Brouillon,Soumis',
        ]);

        $annee = date('Y', strtotime($session->date_session));

        $bilan = BilanAnnuelCs::updateOrCreate(
            ['session_id' => $session->id],
            [
                'annee' => $annee,
                'introduction_generale' => $validated['introduction_generale'],
                'synthese_nationale_scientifique' => $validated['synthese_nationale_scientifique'],
                'recommandations_strategiques' => $validated['recommandations_strategiques'],
                'etat' => $validated['etat'],
                'responsable_cs_id' => Auth::id(),
            ]
        );

        // Liaison automatique des bilans de divisions éligibles
        $divisionsIds = BilanDivision::where('annee', $annee)
            ->where('etat', 'Transmis_au_CS')
            ->pluck('id');
            
        $bilan->bilansDivisions()->sync($divisionsIds);

        return response()->json([
            'message' => $bilan->etat === 'Soumis' ? 'Bilan finalisé et soumis.' : 'Brouillon enregistré.',
            'bilan' => $bilan
        ]);
    }

    /**
     * Consulter le bilan via la session
     */
    public function showBySession(SessionCs $session)
    {
        $bilan = $session->bilanAnnuelGlobal; // Assurez-vous que la relation est définie dans SessionCs

        if (!$bilan) {
            return response()->json(['exists' => false], 404);
        }

        return response()->json([
            'exists' => true,
            'bilan' => $bilan->load(['responsableCs', 'bilansDivisions.division'])
        ]);
    }

    /**
     * Génération du PDF via Blade
     */
    public function telechargerPDF(SessionCs $session)
    {
        $bilan = $session->bilanAnnuelGlobal;

        if (!$bilan) {
            return response()->json(['error' => 'Bilan introuvable'], 404);
        }

        $bilan->load(['bilansDivisions.division', 'responsableCs', 'sessionCs']);

        $pdf = Pdf::loadView('pdfs.bilan_annuel_cs', [
            'bilan' => $bilan,
            'session' => $session,
            'date_generation' => now()->format('d/m/Y')
        ]);

        return $pdf->download("Rapport_Final_CS_{$bilan->annee}.pdf");
    }
}