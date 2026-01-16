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
        Schema::create('projets', function (Blueprint $table) {
        $table->id();
        $table->string('titre');
        $table->enum('nature', ['Recherche', 'Développement', 'Exploratoire']);
        $table->string('type');
        $table->text('resume');
        $table->text('problematique')->nullable();
        $table->text('objectifs')->nullable();
        $table->integer('duree_mois');
        $table->date('date_debut')->nullable();
        $table->date('date_fin')->nullable();
        $table->enum('statut', ['Proposé', 'Validé', 'Nouveau', 'enCours', 'Terminé', 'Rejeté', 'Abandonné'])->default('Proposé');
        $table->foreignId('chef_projet_id')->constrained('users');
        $table->foreignId('division_id')->constrained();
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projets');
    }
};
