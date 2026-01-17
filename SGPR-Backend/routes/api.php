<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\api\ProjetController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\WorkPackageController;
use App\Http\Controllers\Api\ProductionController;

// Routes Publiques
Route::post('/login', [AuthController::class, 'login']);

// Routes Protégées (Nécessitent un Token)
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::apiResource('projets', ProjetController::class);
    
    // Transitions du workflow
    Route::patch('/projets/{projet}/valider-division', [ProjetController::class, 'validerParDivision'])->middleware('can:valider-projet-division');
    Route::patch('/projets/{projet}/approuver-cs', [ProjetController::class, 'approuverParCS'])->middleware('can:approuver-projet-cs');
    Route::patch('/projets/{projet}/lancer', [ProjetController::class, 'lancerProjet'])->middleware('can:lancer-projet-approuve');

    // Gestion de l'équipe
    Route::post('/projets/{projet}/membres', [ProjetController::class, 'ajouterMembre']);
    Route::delete('/projets/{projet}/membres/{user}', [ProjetController::class, 'retirerMembre']);

    // Planification WP et Tâches
    Route::post('/projets/{projet}/work-packages', [WorkPackageController::class, 'store']);
    Route::post('/work-packages/{wp}/taches', [WorkPackageController::class, 'ajouterTache']);

    // Productions Scientifiques & Tech
    Route::post('/projets/{projet}/productions-scientifiques', [ProductionController::class, 'storeScientifique']);
    Route::post('/projets/{projet}/productions-technologiques', [ProductionController::class, 'storeTechnologique']);
});
