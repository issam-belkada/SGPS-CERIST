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
        Schema::create('participation', function (Blueprint $table) {
        $table->id();
        $table->foreignId('projet_id')->constrained('projets')->onDelete('cascade');
        $table->foreignId('user_id')->constrained('users');
        $table->integer('pourcentage_participation');
        $table->string('qualite'); // permanent, associé, collaborateur, étudiant
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('participation');
    }
};
