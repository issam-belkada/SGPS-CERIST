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
        Schema::create('bilan_cs_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('bilan_cs_id')->constrained('bilans_annuels_cs')->onDelete('cascade');
    $table->foreignId('bilan_division_id')->constrained('bilans_divisions');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bilan_cs_items');
    }
};
