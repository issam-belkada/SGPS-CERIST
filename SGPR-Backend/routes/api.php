<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\api\ProjetController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WorkPackageController;
use App\Http\Controllers\Api\ProductionController;
use App\Http\Controllers\Api\BilanController;
use App\Http\Controllers\Api\EncadrementController;
use App\Http\Controllers\Api\ProductionScientifiqueController;
use App\Http\Controllers\Api\ProductionTechnologiqueController;
use App\Http\Controllers\Api\BilanDivisionController;
use App\Http\Controllers\Api\SessionCsController;
use App\Http\Controllers\Api\BilanAnnuelCsController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ChercheurController;
use App\Http\Controllers\Api\ProjetController as ApiProjetController;
use App\Http\Controllers\Api\TacheController;
use App\Http\Controllers\Api\LivrableController;

// Routes Publiques
Route::post('/login', [AuthController::class, 'login']);

// Routes Protégées (Nécessitent un Token)
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::apiResource('projets', ProjetController::class);
    Route::get('/chercheur/projets', [ProjetController::class, 'myProjects']);
    Route::get('/chercheur-stats', [ChercheurController::class, 'getChercheurStats']);
    
    // Transitions du workflow
    Route::patch('/projets/{projet}/valider-division', [ProjetController::class, 'validerParDivision'])->middleware('can:valider-projet-division');
    Route::patch('/projets/{projet}/approuver-cs', [ProjetController::class, 'approuverParCS'])->middleware('can:approuver-projet-cs');
    Route::patch('/projets/{projet}/lancer', [ProjetController::class, 'lancerProjet'])->middleware('can:lancer-projet-approuve');
    Route::get('/users/search', [ProjetController::class, 'searchUsers']);
    Route::get('/mes-projets', [ChercheurController::class, 'getMesProjets']);
    Route::get('/projet-details/{id}', [ChercheurController::class, 'getProjetDetails']);
    

    // Gestion de l'équipe
    Route::post('/projets/{projet}/membres', [ProjetController::class, 'ajouterMembre']);
    Route::delete('/projets/{projet}/membres/{user}', [ProjetController::class, 'retirerMembre']);

    // Planification WP et Tâches
    Route::post('/projets/{projet}/work-packages', [WorkPackageController::class, 'store']);
    Route::post('/work-packages/{wp}/taches', [WorkPackageController::class, 'ajouterTache']);
    Route::post('/taches', [TacheController::class, 'store']);
    Route::get('/mes-taches', [TacheController::class, 'mesTaches']);
    Route::get('/taches/{id}', [TacheController::class, 'show']);
    Route::post('/taches/{tache}/update-status', [TacheController::class, 'updateStatus']);
    Route::delete('/taches/{id}', [TacheController::class, 'destroy']);

    Route::post('/livrables/store-tache', [LivrableController::class, 'storeFromTache']);
    Route::delete('/livrables/{livrable}', [LivrableController::class, 'destroy']);
    Route::get('/livrables/{livrable}/download', [LivrableController::class, 'download']);
    Route::post('/livrables/{id}/upload-missing', [LivrableController::class, 'updateMissingLivrable']);

    // Productions Scientifiques & Tech
    Route::get('/bilans/{bilan}/productions-tech', [ProductionTechnologiqueController::class, 'index']);
    Route::post('/productions-tech', [ProductionTechnologiqueController::class, 'store']);
    Route::delete('/productions-tech/{production}', [ProductionTechnologiqueController::class, 'destroy']);

    Route::get('/bilans/{bilan}/productions-sci', [ProductionScientifiqueController::class, 'index']);
    Route::post('/productions-sci', [ProductionScientifiqueController::class, 'store']);
    Route::delete('/productions-sci/{production}', [ProductionScientifiqueController::class, 'destroy']);

    // Gestion des Encadrements
    Route::get('/bilans/{bilan}/encadrements', [EncadrementController::class, 'index']);
    Route::post('/encadrements', [EncadrementController::class, 'store']);
    Route::delete('/encadrements/{encadrement}', [EncadrementController::class, 'destroy']);

    // Processus de Bilan

    Route::get('/bilans/{bilan}', [BilanController::class, 'show']);
    Route::get('/projets/{projet}/bilans', [BilanController::class, 'index']);
    // 1. Sauvegarder ou modifier le brouillon
    Route::post('/projets/{projet}/bilan/sauvegarder', [BilanController::class, 'storeOuUpdate']);
    // 2. Action de soumission finale
    Route::patch('/bilans/{bilan}/soumettre', [BilanController::class, 'soumettre']);
    // 3. Téléchargement
    Route::get('/bilans/{bilan}/pdf', [BilanController::class, 'telechargerPDF']);


    // Gestion du Bilan de Division
    Route::post('/bilans-division', [BilanDivisionController::class, 'store']);
    Route::patch('/bilans-division/{bilanDivision}/transmettre', [BilanDivisionController::class, 'transmettreAuCS']);
    Route::get('/bilans-division/{bilanDivision}/pdf', [BilanDivisionController::class, 'telechargerPDF']);


    // --- MODULE CONSEIL SCIENTIFIQUE (CS) ---

    // 1. Liste toutes les sessions existantes
    Route::get('/sessions-cs', [SessionCsController::class, 'index']);

    // 2. Créer une nouvelle session (Date, Lieu, Ordre du jour)
    Route::post('/sessions-cs', [SessionCsController::class, 'store']);

    // 3. Consulter une session spécifique
    // (Renvoie les infos de la session + les décisions déjà prises)
    Route::get('/sessions-cs/{session}', [SessionCsController::class, 'show']);

    // 4. Récupérer la liste des projets "éligibles"
    // (Ceux qui ont un bilan validé par la division mais pas encore de décision CS)
    Route::get('/projets-disponibles-cs', [SessionCsController::class, 'projetsEnAttente']);

    // 5. Enregistrer une décision pour un projet dans une session donnée
    // (C'est cette route qui va changer l'état du projet en "Terminé", "En cours" ou "Abandonné")
    Route::post('/sessions-cs/{session}/decisions', [SessionCsController::class, 'ajouterDecision']);



    // Actions liées au bilan annuel du CS via une session
    Route::get('/sessions-cs/{session}/bilan', [BilanAnnuelCsController::class, 'showBySession']);
    Route::post('/sessions-cs/{session}/bilan', [BilanAnnuelCsController::class, 'storeOrUpdate']);
    Route::get('/sessions-cs/{session}/bilan/pdf', [BilanAnnuelCsController::class, 'telechargerPDF']);


    Route::get('/users', [AdminController::class, 'indexUsers']);
    Route::post('/users', [AdminController::class, 'storeUser']);
    Route::get('/users/{user}', [AdminController::class, 'showUser']);
    Route::put('/users/{user}', [AdminController::class, 'updateUser']);
    Route::delete('/users/{user}', [AdminController::class, 'destroyUser']);
    

    // CRUD Divisions
    Route::get('/divisions', [AdminController::class, 'indexDivisions']);
    Route::post('/divisions', [AdminController::class, 'storeDivision']);
    Route::get('/divisions/{division}', [AdminController::class, 'showDivision']);
    Route::put('/divisions/{division}', [AdminController::class, 'updateDivision']);
    Route::delete('/divisions/{division}', [AdminController::class, 'destroyDivision']);
    Route::put('/divisions/{division}/assign-chef', [AdminController::class, 'assignChef']);
    Route::get('/mon-entite-division', [ChercheurController::class, 'getMaDivision']);

    Route::get('/admin/statistics', [AdminController::class, 'getStatistics']);



});
