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
        Schema::create('livrables', function (Blueprint $table) {
    $table->id();
    $table->foreignId('projet_id')->constrained('projets')->onDelete('cascade');
    $table->foreignId('tache_id')->nullable()->constrained('taches')->onDelete('cascade');
    $table->string('titre');
    $table->enum('type', ['Rapport_Technique', 'Manuel_Utilisateur', 'Code_Source', 'Synthese_Biblio', 'Expertise']);
    $table->string('fichier_path'); // Chemin du PDF
    $table->date('date_depot');
    $table->foreignId('depose_par')->constrained('users');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('livrables');
    }
};
