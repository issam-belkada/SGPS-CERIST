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
        Schema::create('encadrements', function (Blueprint $table) {
    $table->id();
    $table->foreignId('bilan_id')->constrained('bilans_annuels')->onDelete('cascade');
    $table->string('nom_etudiant');
    $table->enum('type_diplome', ['Doctorat', 'Master', 'Magister', 'PFE', 'Licence']);
    $table->string('sujet');
    $table->string('etablissement');
    $table->enum('etat_avancement', ['En cours', 'Soutenu'])->default('En cours');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('encadrements');
    }
};
