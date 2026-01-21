<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <title>Bilan Projet - {{ $bilan->annee }}</title>
    <style>
        @page {
            margin: 2cm;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11pt;
            color: #333;
            line-height: 1.4;
        }

        /* Header avec Logo */
        .header {
            width: 100%;
            border-bottom: 2px solid #1a365d;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .logo {
            width: 180px;
        }

        .header-table {
            width: 100%;
        }

        .header-title {
            text-align: right;
            text-transform: uppercase;
            color: #1a365d;
        }

        /* Sections */
        .section-header {
            background-color: #f8fafc;
            padding: 8px;
            border-left: 5px solid #1a365d;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 25px;
            margin-bottom: 10px;
            font-size: 12pt;
        }

        /* Tableaux */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        th,
        td {
            border: 1px solid #cbd5e1;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f1f5f9;
            font-size: 10pt;
            text-transform: uppercase;
        }

        .label {
            font-weight: bold;
            color: #475569;
            width: 30%;
        }

        .content {
            font-style: italic;
        }

        .footer {
            position: fixed;
            bottom: -1cm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 9pt;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 5px;
        }
    </style>
</head>

<body>

    <div class="header">
        <table class="header-table">
            <tr>
                <td><img src="{{ public_path('images/logo-cerist.png') }}" class="logo"></td>
                <td class="header-title">
                    <h2 style="margin:0;">Bilan Annuel</h2>
                    <p style="margin:0;">Année Académique : {{ $bilan->annee }}</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="section-header">1. Structure de Rattachement</div>
    <table>
        <tr>
            <td class="label">Division / Département</td>
            <td>{{ $bilan->projet->division->nom }} ({{ $bilan->projet->division->acronyme }})</td>
        </tr>
    </table>

    <div class="section-header">2. Identification du Projet</div>
    <table>
        <tr>
            <td class="label">Intitulé du projet</td>
            <td class="content">{{ $bilan->projet->titre }}</td>
        </tr>
        <tr>
            <td class="label">Chef de projet</td>
            <td>{{ $bilan->projet->chefProjet->nom }} {{ $bilan->projet->chefProjet->prenom }}</td>
        </tr>
        <tr>
            <td class="label">Type / Nature</td>
            <td>{{ $bilan->projet->type }} / {{ $bilan->projet->nature }}</td>
        </tr>
        <tr>
            <td class="label">Dates</td>
            <td>Du {{ \Carbon\Carbon::parse($bilan->projet->date_debut)->format('d/m/Y') }} au
                {{ \Carbon\Carbon::parse($bilan->projet->date_fin)->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td class="label">État d'avancement</td>
            <td style="font-weight:bold; color:#1a365d;">{{ $bilan->avancement_physique }} %</td>
        </tr>
    </table>

    <h4 style="margin-bottom: 5px; color:#1a365d;">Participants au projet :</h4>
    <table>
        <thead>
            <tr>
                <th>NOM et Prénom</th>
                <th>Grade</th>
                <th>Qualité</th>
                <th>% Participation</th>
            </tr>
        </thead>
        <tbody>
            @foreach($bilan->projet->membres as $membre)
                <tr>
                    <td>{{ $membre->nom }} {{ $membre->prenom }}</td>
                    <td>{{ $membre->grade }}</td>
                    <td>{{ $membre->pivot->qualite }}</td>
                    <td>{{ $membre->pivot->pourcentage_participation }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-header">3. Objectifs Réalisés</div>
    <div style="padding: 10px; border: 1px solid #e2e8f0; background: #fff;">
        {!! nl2br(e($bilan->objectifs_realises)) !!}
    </div>

    <div class="section-header">4. Résultats Quantifiés</div>

    <h4>4.1 Production Scientifique</h4>
    @if($bilan->productionsScientifiques->count() > 0)
        @foreach($bilan->productionsScientifiques as $prod)
            <p style="font-size: 10pt; margin-left: 15px;">• <strong>[{{ $prod->type }}]</strong> {{ $prod->titre }} -
                <em>{{ $prod->revue_ou_conference }}</em> ({{ $prod->date_parution }})</p>
        @endforeach
    @else
        <p>Néant</p>
    @endif

    <h4>4.2 Production Technologique</h4>
    @if($bilan->productionsTechnologiques->count() > 0)
        @foreach($bilan->productionsTechnologiques as $tech)
            <div style="margin-left: 15px; margin-bottom: 10px;">
                <strong>{{ $tech->intitule }} ({{ $tech->type }})</strong><br>
                <small>{{ $tech->description }}</small>
            </div>
        @endforeach
    @else
        <p>Néant</p>
    @endif

    <h4>4.3 Formation pour la recherche (Encadrements)</h4>
    @if($bilan->encadrements->count() > 0)
        <table>
            <thead>
                <tr>
                    <th>Étudiant</th>
                    <th>Diplôme</th>
                    <th>Établissement</th>
                    <th>État d'avancement</th>
                </tr>
            </thead>
            <tbody>
                @foreach($bilan->encadrements as $enc)
                    <tr>
                        <td>{{ $enc->nom_etudiant }}</td>
                        <td>{{ $enc->type_diplome }}</td>
                        <td>{{ $enc->etablissement }}</td>
                        <td>{{ $enc->etat_avancement }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p>Néant</p>
    @endif

    <div class="section-header">5. Difficultés Rencontrées</div>
    <ul>
        <li><strong>Scientifiques :</strong> {{ $bilan->difficultes_scientifiques ?: 'Néant' }}</li>
        <li><strong>Matérielles :</strong> {{ $bilan->difficultes_materielles ?: 'Néant' }}</li>
        <li><strong>Humaines :</strong> {{ $bilan->difficultes_humaines ?: 'Néant' }}</li>
    </ul>

    <div class="footer">
        Document généré via SGPR-CERIST le {{ date('d/m/Y') }} - Page <span class="pagenum"></span>
    </div>

</body>

</html>