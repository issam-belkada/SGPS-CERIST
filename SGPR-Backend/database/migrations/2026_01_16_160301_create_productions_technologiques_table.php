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
        Schema::create('productions_technologiques', function (Blueprint $table) {
    $table->id();
    $table->foreignId('bilan_id')->constrained('bilans_annuels')->onDelete('cascade');
    $table->enum('type', ['Logiciel', 'Produit', 'Brevet', 'Prototype']);
    $table->string('intitule');
    $table->text('description');
    $table->string('reference')->nullable(); // Numéro de brevet ou version logiciel
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productions_technologiques');
    }
};
