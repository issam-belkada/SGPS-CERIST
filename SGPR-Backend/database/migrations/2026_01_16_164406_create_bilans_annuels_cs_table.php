<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bilans_annuels_cs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('session_id')->constrained('sessions_cs');
    $table->year('annee');
    
    $table->text('introduction_generale');
    $table->text('synthese_nationale_scientifique');
    $table->text('recommandations_strategiques');
    
    $table->enum('etat', ['Brouillon', 'Soumis'])->default('Brouillon');
    $table->foreignId('responsable_cs_id')->constrained('users');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bilans_annuels_cs');
    }
};
