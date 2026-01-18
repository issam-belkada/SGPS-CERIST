<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
    Schema::table('divisions', function (Blueprint $table) {
        $table->foreignId('chef_id')->nullable()->constrained('users')->onDelete('set null');
        $table->text('description')->nullable();
    });
}

public function down(): void {
    Schema::table('divisions', function (Blueprint $table) {
        $table->dropForeign(['chef_id']);
        $table->dropColumn('chef_id');
        $table->dropColumn('description');
    });
}
};
