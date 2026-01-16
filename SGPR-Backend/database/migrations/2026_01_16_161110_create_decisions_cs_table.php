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
        Schema::create('decisions_cs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('session_id')->constrained('sessions_cs');
    $table->foreignId('projet_id')->constrained('projets');
    $table->enum('avis', ['Favorable', 'Favorable_sous_reserve', 'Défavorable']);
    $table->text('observations')->nullable();
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('decisions_cs');
    }
};
