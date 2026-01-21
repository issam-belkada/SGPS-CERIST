<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BilanAnnuel;
use App\Models\Projet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;



class BilanController extends Controller
{


    public function index($projetId)
{
    // Sécurité au cas où le JS envoie "undefined" comme chaîne
    if ($projetId === 'undefined') {
        return response()->json(['error' => 'ID Projet non fourni'], 400);
    }

    $projet = Projet::findOrFail($projetId);

    $bilans = BilanAnnuel::where('projet_id', $projet->id)
        ->with(['productionsScientifiques', 'productionsTechnologiques', 'encadrements'])
        ->orderBy('annee', 'desc')
        ->get();

    return response()->json($bilans);
}






    
    public function storeOuUpdate(Request $request, Projet $projet)
{
    if (auth()->id() !== $projet->chef_projet_id) {
        return response()->json(['error' => 'Non autorisé'], 403);
    }

    $validated = $request->validate([
    'annee' => 'required|integer',
    'avancement_physique' => 'nullable|numeric|min:0|max:100',
    'objectifs_realises' => 'nullable|string',
    'collaborations' => 'nullable|string',
    'difficultes_scientifiques' => 'nullable|string',
    'difficultes_materielles' => 'nullable|string',
    'difficultes_humaines' => 'nullable|string',
    'autres_resultats' => 'nullable|string',
    'productions_sci' => 'array',
    'productions_tech' => 'array',
    'encadrements' => 'array',
]);

    return DB::transaction(function () use ($projet, $validated) {
        // 1. Mise à jour ou création du bilan (Sections 3, 5, 6)
        $bilan = BilanAnnuel::updateOrCreate(
            ['projet_id' => $projet->id, 'annee' => $validated['annee']],
            array_merge($validated, ['etat_validation' => 'Brouillon'])
        );

        // 2. Mise à jour des productions (Section 4)
        // On synchronise les données en supprimant les anciennes pour cette année/bilan
        if (isset($validated['productions_sci'])) {
            $bilan->productionsScientifiques()->delete();
            $bilan->productionsScientifiques()->createMany($validated['productions_sci']);
        }

        if (isset($validated['productions_tech'])) {
            $bilan->productionsTechnologiques()->delete();
            $bilan->productionsTechnologiques()->createMany($validated['productions_tech']);
        }

        if (isset($validated['encadrements'])) {
            $bilan->encadrements()->delete();
            $bilan->encadrements()->createMany($validated['encadrements']);
        }

        return response()->json(['message' => 'Bilan et résultats enregistrés', 'bilan' => $bilan->load(['productionsScientifiques', 'productionsTechnologiques', 'encadrements'])]);
    });
}

    /**
     * Soumettre définitivement le bilan.
     * Change l'état de 'Brouillon' à 'Soumis'.
     */
    public function soumettre(BilanAnnuel $bilan)
    {
        // Vérification que l'utilisateur est bien le chef du projet lié au bilan
        if (auth()->id() !== $bilan->projet->chef_projet_id) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        if (!in_array($bilan->etat_validation, ['Brouillon', 'Rejeté'])) {
        return response()->json(['error' => 'Ce bilan ne peut pas être soumis (déjà validé ou en cours).'], 400);
        }

        $bilan->update([
            'etat_validation' => 'Soumis',
            'updated_at' => now()
        ]);

        return response()->json([
            'message' => 'Bilan soumis officiellement à la division',
            'bilan' => $bilan
        ]);
    }

    /**
     * Générer le PDF (uniquement si le bilan existe)
     */
    public function telechargerPDF(BilanAnnuel $bilan)
{
    // Chargez tout via le bilan pour être sûr de la cohérence avec l'année
    $bilan->load(['productionsScientifiques', 'productionsTechnologiques', 'encadrements', 'projet.chefProjet']);
    
    $pdf = Pdf::loadView('pdfs.bilan', [
        'bilan'           => $bilan,
        'projet'          => $bilan->projet,
        'productionsSci'  => $bilan->productionsScientifiques,
        'productionsTech' => $bilan->productionsTechnologiques,
        'encadrements'    => $bilan->encadrements
    ]);

    return $pdf->setPaper('a4', 'portrait')->download("Bilan_{$bilan->annee}.pdf");
}


    /**
     * Valider le bilan au niveau de la Division
     */
    public function validerDivision(BilanAnnuel $bilan)
    {
        // Sécurité : Seul le chef de division du projet peut valider
        if (auth()->user()->division_id !== $bilan->projet->division_id || !auth()->user()->hasRole('ChefDivision')) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }
    
        $bilan->update(['etat_validation' => 'Validé']);
    
        return response()->json(['message' => 'Bilan validé par la division avec succès.']);
    }

    /**
     * Rejeter le bilan pour correction
     */
    public function rejeter(Request $request, BilanAnnuel $bilan)
    {
        $request->validate(['commentaire' => 'required|string']);
    
        // Le bilan repasse en brouillon pour que le chercheur puisse le modifier
        $bilan->update([
            'etat_validation' => 'Rejeté',
            'autres_resultats' => $bilan->autres_resultats . "\n\n[Note de rejet] : " . $request->commentaire 
        ]);
    
        return response()->json(['message' => 'Bilan renvoyé au chercheur pour corrections.']);
    }
}