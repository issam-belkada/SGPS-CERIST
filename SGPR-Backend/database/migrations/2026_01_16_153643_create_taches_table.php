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
        Schema::create('taches', function (Blueprint $table) {
        $table->id();
        $table->foreignId('work_package_id')->constrained('work_packages')->onDelete('cascade');
        $table->string('nom');
        $table->text('description')->nullable();
        $table->date('date_debut');
        $table->date('date_fin');
        $table->foreignId('responsable_id')->constrained('users');
        $table->enum('etat', ['A faire', 'En cours', 'Terminé'])->default('A faire');
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('taches');
    }
};
