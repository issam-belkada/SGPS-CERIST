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
        Schema::create('bilans_divisions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('division_id')->constrained('divisions');
    $table->year('annee');
    
    // Section 1 : Potentiel chercheur (Nombre total par grade dans la division)
    $table->json('statistiques_personnel'); // Ex: {"DR": 2, "MRA": 5, "Ing": 3}
    
    // Section 6, 7, 8 : Activités propres à la division
    $table->text('formation_qualifiante')->nullable();
    $table->text('sejours_etranger')->nullable();
    $table->text('animation_scientifique')->nullable();
    $table->text('cooperation_partenariat')->nullable();
    
    $table->enum('etat', ['Brouillon', 'Transmis_au_CS'])->default('Brouillon');
    $table->foreignId('chef_division_id')->constrained('users');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bilans_divisions');
    }
};
