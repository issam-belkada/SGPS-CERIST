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
        Schema::create('productions_scientifiques', function (Blueprint $table) {
    $table->id();
    $table->foreignId('bilan_id')->constrained('bilans_annuels')->onDelete('cascade');
    $table->enum('type', ['Publication_Inter', 'Communication_Inter', 'Communication_Nat', 'Livre', 'Rapport_Biblio']);
    $table->string('titre');
    $table->string('auteurs');
    $table->string('revue_ou_conference');
    $table->date('date_parution');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productions_scientifiques');
    }
};
