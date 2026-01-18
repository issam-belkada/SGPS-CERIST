<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Division;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class AdminController extends Controller
{
    /** Liste tous les utilisateurs avec leur division et rôles */
    public function indexUsers()
    {
        return response()->json(User::with(['division', 'roles'])->orderBy('nom')->get());
    }

    /** Créer un nouvel utilisateur */
    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            // Validation stricte pour correspondre à l'ENUM PostgreSQL
            'grade' => ['required', Rule::in(['PR', 'MCA', 'MCB', 'MAA', 'MAB', 'DR', 'MRA', 'MRB', 'CR', 'AR', 'Ingénieur', 'TS'])],
            'specialite' => 'required|string|max:255',
            'role' => 'required|string',
            'division_id' => 'nullable|exists:divisions,id',
        ]);

        $user = User::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'grade' => $validated['grade'],
            'specialite' => $validated['specialite'],
            'division_id' => $validated['division_id'],
        ]);

        if ($request->has('role')) {
            $user->assignRole($request->role);
        }

        return response()->json([
            'message' => 'Utilisateur créé avec succès', 
            'user' => $user->load('roles')
        ], 201);
    }

    /** Afficher un utilisateur spécifique */
    public function showUser(User $user)
    {
        return response()->json($user->load(['division', 'roles']));
    }

    /** Modifier un utilisateur */
    public function updateUser(Request $request, User $user)
{
    $validated = $request->validate([
        'nom' => 'sometimes|string|max:255',
        'prenom' => 'sometimes|string|max:255',
        'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
        'password' => 'nullable|min:8',
        'grade' => ['sometimes', Rule::in(['PR', 'MCA', 'MCB', 'MAA', 'MAB', 'DR', 'MRA', 'MRB', 'CR', 'AR', 'Ingénieur', 'TS'])],
        'specialite' => 'sometimes|string|max:255',
        'role' => 'sometimes|string',
        'division_id' => 'nullable|exists:divisions,id',
    ]);

    // Gestion du mot de passe
    if ($request->filled('password')) {
        $validated['password'] = Hash::make($request->password);
    } else {
        unset($validated['password']);
    }

    $userData = collect($validated)->except('role')->toArray();
    $user->update($userData);


    if ($request->has('role')) {

        $user->syncRoles([$request->role]);
    }

    return response()->json([
        'message' => 'Utilisateur mis à jour avec succès',
        'user' => $user->load('roles')
    ]);
}

    /** Supprimer un utilisateur */
    public function destroyUser(User $user)
    {
        if (auth()->id() === $user->id) {
            return response()->json(['error' => 'Vous ne pouvez pas supprimer votre propre compte.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }

    /** --- GESTION DES DIVISIONS --- **/

    public function indexDivisions()
{
    // On charge le chef ET le compte des utilisateurs
    return response()->json(Division::with('chef')->withCount('users')->get());
}

    public function storeDivision(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|unique:divisions,nom',
            'acronyme' => 'required|string|unique:divisions,acronyme',
            'description' => 'nullable|string'
        ]);

        $division = Division::create($validated);
        return response()->json($division, 201);
    }

    public function showDivision(Division $division)
{
    // On charge les membres ET le chef spécifique
    return response()->json($division->load(['users.roles', 'chef']));
}

    public function updateDivision(Request $request, Division $division)
    {
        $validated = $request->validate([
            'nom' => ['sometimes', 'string', Rule::unique('divisions')->ignore($division->id)],
            'acronyme' => ['sometimes', 'string', Rule::unique('divisions')->ignore($division->id)],
            'description' => 'nullable|string'
        ]);

        $division->update($validated);
        return response()->json($division);
    }

    public function destroyDivision(Division $division)
    {
        if ($division->users()->count() > 0) {
            return response()->json([
                'error' => 'Cette division contient encore des chercheurs.'
            ], 422);
        }

        $division->delete();
        return response()->json(['message' => 'Division supprimée avec succès']);
    }



    public function assignChef(Request $request, Division $division)
{
    $request->validate([
        'chef_id' => 'required|exists:users,id'
    ]);

    // 1. Trouver l'ancien chef (si il existe)
    $oldChefId = $division->chef_id;

    if ($oldChefId) {
        $oldChef = User::find($oldChefId);
        if ($oldChef) {
            // On lui retire le rôle de Chef et on lui remet le rôle par défaut 'Chercheur'
            $oldChef->syncRoles(['Chercheur']);
        }
    }

    // 2. Mettre à jour la table divisions avec le nouvel ID
    $division->chef_id = $request->chef_id;
    $division->save();

    // 3. Donner le rôle ChefDivision au nouvel élu
    $newChef = User::find($request->chef_id);
    if ($newChef) {
        $newChef->syncRoles(['ChefDivision']);
    }

    return response()->json([
        'message' => 'Le transfert de responsabilité a été effectué avec succès.',
        'chef' => $newChef->nom . ' ' . $newChef->prenom
    ]);
}





    /** Statistiques du Dashboard */
    public function getStatistics()
    {
        // 1. Statistiques Globales
        $totalUsers = User::count();
        $totalDivisions = Division::count();
        $adminsCount = User::role('Admin')->count(); // Si vous utilisez Spatie

        // 2. Nouveaux membres récents (les 5 derniers)
        $recentUsers = User::with('roles')
            ->latest()
            ->take(5)
            ->get();

        // 3. Données pour le graphique (6 derniers mois)
        $months = collect();
        $data = collect();

        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months->push($date->format('M')); // Nom du mois (Jan, Feb...)

            $count = User::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            $data->push($count);
        }

        return response()->json([
            'totalUsers' => $totalUsers,
            'totalDivisions' => $totalDivisions,
            'adminsCount' => $adminsCount,
            'recentUsers' => $recentUsers,
            'chart' => [
                'labels' => $months,
                'datasets' => $data
            ]
        ]);
    }
}
