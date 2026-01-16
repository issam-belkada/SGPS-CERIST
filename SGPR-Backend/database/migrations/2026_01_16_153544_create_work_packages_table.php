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
        Schema::create('work_packages', function (Blueprint $table) {
        $table->id();
        $table->foreignId('projet_id')->constrained('projets')->onDelete('cascade');
        $table->string('code_wp'); // WP1, WP2...
        $table->string('titre');
        $table->text('objectifs')->nullable();
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_packages');
    }
};
