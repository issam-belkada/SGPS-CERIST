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
        Schema::create('sessions_cs', function (Blueprint $table) {
    $table->id();
    $table->date('date_session');
    $table->string('lieu');
    $table->text('ordre_du_jour')->nullable();
    $table->string('pv_file_path')->nullable(); // Lien vers le document PDF du PV
    $table->enum('statut', ['Planifiée', 'Clôturée'])->default('Planifiée');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions_cs');
    }
};
