<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SessionCs;
use App\Models\DecisionCs;
use App\Models\BilanAnnuel;
use App\Models\Projet;
use Illuminate\Http\Request;

class SessionCsController extends Controller
{
    /**
     * Voir toutes les sessions (Liste pour le tableau de bord du Chef de CS)
     */
    public function index()
    {
        return response()->json(SessionCs::orderBy('date_session', 'desc')->get());
    }

    /**
     * Créer une nouvelle session
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date_session' => 'required|date',
            'lieu'         => 'required|string',
            'ordre_du_jour' => 'nullable|string',
        ]);

        $session = SessionCs::create($validated);
        return response()->json($session, 201);
    }

    /**
     * Consulter les détails d'une session avec ses décisions
     */
    public function show(SessionCs $session)
    {
        return response()->json([
            'session' => $session->load(['decisions.projet.chefProjet']),
            // On injecte directement les projets qui attendent une décision
            'en_attente' => Projet::whereHas('bilans', function($query) {
                    $query->where('etat_validation', 'Validé');
                })
                ->whereDoesntHave('decisions', function($q) use ($session) {
                    $q->where('session_id', $session->id);
                })
                ->with(['chefProjet', 'division'])
                ->get()
        ]);
    }

    /**
     * Récupérer la liste des projets qui ont un bilan "Validé par Division" 
     * mais qui n'ont pas encore de décision du CS pour cette année.
     * Utile pour remplir le formulaire "Ajouter une décision".
     */
    public function projetsEnAttente()
    {
        $projets = Projet::whereHas('bilans', function($query) {
            $query->where('etat_validation', 'Validé'); // Validé par le Chef de Division
        })
        ->with(['chefProjet', 'division'])
        ->get();

        return response()->json($projets);
    }

    /**
     * Ajouter une décision à une session précise
     */
    public function ajouterDecision(Request $request, SessionCs $session)
    {
        $validated = $request->validate([
            'projet_id' => 'required|exists:projets,id',
            'avis' => 'required|in:Favorable,Terminé,Défavorable',
            'observations' => 'nullable|string',
        ]);

        // 1. Enregistrer la décision dans l'historique du CS
        $decision = DecisionCs::create([
            'session_id' => $session->id,
            'projet_id' => $validated['projet_id'],
            'avis' => $validated['avis'],
            'observations' => $validated['observations'],
        ]);

        // 2. CHANGER L'ÉTAT DU PROJET (Table 'projets')
        $projet = Projet::find($validated['projet_id']);
        
        $nouvelEtatProjet = match ($validated['avis']) {
            'Favorable' => 'En cours',   // Le projet continue normalement
            'Terminé'   => 'Terminé',    // Le projet est fini avec succès
            'Défavorable'=> 'Abandonné',    // Le projet est stoppé par le CS
        };

        $projet->update(['etat' => $nouvelEtatProjet]);

        return response()->json([
            'message' => "La décision a été prise. Le projet est désormais : $nouvelEtatProjet",
            'projet_etat' => $nouvelEtatProjet
        ]);
    }
}