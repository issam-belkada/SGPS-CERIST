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




    public function show($id)
    {
        try {
            // Chargement de toutes les relations définies dans vos modèles
            $bilan = BilanAnnuel::with([
                // Section 1 & 2 : Projet et sa structure de rattachement
                'projet.division', 
                'projet.chefProjet',
                
                // Section 2 : Participants (via la table pivot participation)
                'projet.membres' => function($query) {
                    $query->withPivot('pourcentage_participation', 'qualite');
                },

                // Section 4.1 : Production Scientifique
                'productionsScientifiques',

                // Section 4.2 : Production Technologique
                'productionsTechnologiques',

                // Section 4.3 : Formation (Encadrements)
                'encadrements'
            ])->findOrFail($id);

            return response()->json($bilan, 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Bilan introuvable.'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des données.',
                'error' => $e->getMessage()
            ], 500);
        }
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
        if ($bilan->etat_validation !== 'Brouillon') {
            return response()->json(['message' => 'Seuls les brouillons peuvent être soumis.'], 422);
        }

        $bilan->update(['etat_validation' => 'Soumis']);

        return response()->json([
            'message' => 'Bilan soumis avec succès au chef de projet/division.',
            'etat' => 'Soumis'
        ]);
    }

    /**
     * Génère et télécharge le PDF basé sur le canevas officiel
     */
    public function telechargerPDF(BilanAnnuel $bilan)
{
    $bilan->load([
        'projet.division', 
        'projet.chefProjet', 
        'projet.membres', 
        'productionsScientifiques', 
        'productionsTechnologiques', 
        'encadrements'
    ]);

    // Configuration pour supporter les images et les caractères spéciaux
    $pdf = Pdf::loadView('pdfs.bilan_annuel', compact('bilan'))
              ->setPaper('a4', 'portrait')
              ->setOptions([
                  'isRemoteEnabled' => true,      // Permet de charger des images via URL si besoin
                  'isHtml5ParserEnabled' => true,
                  'defaultFont' => 'sans-serif'
              ]);

    $fileName = "Bilan_" . $bilan->annee . "_" . str_replace(' ', '_', $bilan->projet->titre) . ".pdf";

    return $pdf->download($fileName);
}


    /**
     * Valider le bilan au niveau de la Division
     */
    public function validerBilan(Request $request, $id)
{
    // On accepte "Valide" (système) ou "Validé" (humain)
    $request->validate([
        'etat_validation' => 'required|in:Validé,Rejeté,Valide,Rejete',
    ]);

    try {
        DB::beginTransaction();
        $bilan = BilanAnnuel::findOrFail($id);

        // Conversion vers la valeur exacte de votre ENUM migration ('Validé')
        // Mais pour plus de sécurité avec Postgres, on force le format texte
        $newStatus = ($request->etat_validation === 'Valide') ? 'Validé' : 
                     (($request->etat_validation === 'Rejete') ? 'Rejeté' : $request->etat_validation);

        $bilan->etat_validation = $newStatus;
        $bilan->save();

        DB::commit();

        return response()->json([
            'message' => "Statut mis à jour avec succès.",
            'bilan' => $bilan
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => "Erreur SQL lors de la validation.",
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Récupérer les bilans soumis de la division du chef actuel
     */
    public function getBilansASoumettre()
{
    try {
        $user = auth()->user();

        // On récupère les bilans avec EXACTEMENT les mêmes relations que show($id)
        $bilans = BilanAnnuel::with([
            // Section 1 & 2 : Projet et sa structure de rattachement
            'projet.division', 
            'projet.chefProjet',
            
            // Section 2 : Participants (via la table pivot participation)
            'projet.membres' => function($query) {
                $query->withPivot('pourcentage_participation', 'qualite');
            },

            // Section 4.1 : Production Scientifique
            'productionsScientifiques',

            // Section 4.2 : Production Technologique
            'productionsTechnologiques',

            // Section 4.3 : Formation (Encadrements)
            'encadrements'
        ])
        ->whereHas('projet', function($query) use ($user) {
            // Filtrage par la division du Chef de Division actuel
            $query->where('division_id', $user->division_id);
        })
        ->where('etat_validation', 'Soumis')
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($bilans, 200);

    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Erreur lors de la récupération des bilans à valider.',
            'error' => $e->getMessage()
        ], 500);
    }
}
}