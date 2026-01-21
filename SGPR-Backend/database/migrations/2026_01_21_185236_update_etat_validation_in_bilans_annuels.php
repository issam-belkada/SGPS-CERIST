<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    // 1. Convertir temporairement la colonne en texte simple
    DB::statement("ALTER TABLE bilans_annuels ALTER COLUMN etat_validation TYPE VARCHAR(255)");

    // 2. Nettoyer les données (remplacer les anciennes valeurs par les nouvelles sans accents)
    DB::table('bilans_annuels')->where('etat_validation', 'Validé')->update(['etat_validation' => 'Valide']);
    DB::table('bilans_annuels')->where('etat_validation', 'Rejeté')->update(['etat_validation' => 'Rejete']);
    // On nettoie aussi les brouillons si nécessaire
    DB::table('bilans_annuels')->where('etat_validation', 'Brouillon')->update(['etat_validation' => 'Brouillon']); 

    // 3. Redéfinir l'ENUM proprement sans accents
    // Note: Sur Postgres, on utilise souvent VARCHAR + Check constraint pour simuler l'ENUM de Laravel
    DB::statement("ALTER TABLE bilans_annuels ADD CONSTRAINT bilans_annuels_etat_validation_check 
                   CHECK (etat_validation IN ('Brouillon', 'Soumis', 'Valide', 'Rejete'))");
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bilans_annuels', function (Blueprint $table) {
            //
        });
    }
};
