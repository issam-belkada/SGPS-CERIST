<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Division;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{

    /** Liste tous les utilisateurs */
    public function indexUsers()
    {
        return response()->json(User::with('division')->orderBy('nom')->get());
    }

    /** Créer un nouvel utilisateur */
    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'grade' => 'required|string',
            'role' => 'required|in:Admin,ChefCS,ChefDivision,Chercheur',
            'division_id' => 'nullable|exists:divisions,id',
        ]);

        $user = User::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'grade' => $validated['grade'],
            'role' => $validated['role'],
            'division_id' => $validated['division_id'],
        ]);

        return response()->json(['message' => 'Utilisateur créé avec succès', 'user' => $user], 201);
    }

    /** Afficher un utilisateur spécifique */
    public function showUser(User $user)
    {
        return response()->json($user->load('division'));
    }

    /** Modifier un utilisateur */
    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|min:8',
            'grade' => 'sometimes|string',
            'role' => 'sometimes|in:Admin,ChefCS,ChefDivision,Chercheur',
            'division_id' => 'nullable|exists:divisions,id',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($request->password);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);
        return response()->json(['message' => 'Utilisateur mis à jour', 'user' => $user]);
    }

    /** Supprimer un utilisateur */
    public function destroyUser(User $user)
    {
        // Empêcher l'admin de se supprimer lui-même
        if (auth()->id() === $user->id) {
            return response()->json(['error' => 'Vous ne pouvez pas supprimer votre propre compte.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }

    /** Liste toutes les divisions */
    public function indexDivisions()
    {
        return response()->json(Division::withCount('users')->get());
    }

    /** Créer une division */
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

    /** Afficher une division */
    public function showDivision(Division $division)
    {
        return response()->json($division->load('users'));
    }

    /** Modifier une division */
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

    /** Supprimer une division */
    public function destroyDivision(Division $division)
    {
        // Sécurité : on ne supprime pas une division s'il y a encore des chercheurs dedans
        if ($division->users()->count() > 0) {
            return response()->json([
                'error' => 'Cette division contient encore des chercheurs. Déplacez-les avant de supprimer.'
            ], 422);
        }

        $division->delete();
        return response()->json(['message' => 'Division supprimée avec succès']);
    }
}
