<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
        }

        .header {
            text-align: center;
            text-transform: uppercase;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .section-title {
            background: #f2f2f2;
            padding: 5px;
            font-weight: bold;
            border: 1px solid #000;
            margin-top: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            border: 1px solid #000;
            padding: 5px;
            text-align: left;
        }

        .stats-box {
            width: 50%;
        }
    </style>
</head>

<body>
    <div class="header">
        <h2>Bilan Annuel d'Activités de la Division : {{ $bilan->division->nom }}</h2>
        <h3>Année : {{ $bilan->annee }}</h3>
    </div>

    <div class="section-title">1. POTENTIEL CHERCHEUR (Effectifs par Grade)</div>
    <table class="stats-box">
        <thead>
            <tr>
                <th>Grade</th>
                <th>Nombre</th>
            </tr>
        </thead>
        <tbody>
            @foreach($stats as $grade => $count)
                <tr>
                    <td>{{ $grade }}</td>
                    <td>{{ $count }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">2. SYNTHÈSE DES PROJETS DE RECHERCHE</div>
    <table>
        <thead>
            <tr>
                <th>Code Projet</th>
                <th>Intitulé</th>
                <th>Chef de Projet</th>
                <th>Avancement (%)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($projets as $item)
                <tr>
                    <td>{{ $item->projet->id }}</td>
                    <td>{{ $item->projet->titre }}</td>
                    <td>{{ $item->projet->chefProjet->nom }} {{ $item->projet->chefProjet->prenom }}</td>
                    <td>{{ $item->avancement_physique }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">3. FORMATIONS, SÉJOURS ET COOPÉRATIONS</div>
    <p><strong>Formations qualifiantes :</strong> {{ $bilan->formation_qualifiante ?? 'Néant' }}</p>
    <p><strong>Séjours à l'étranger :</strong> {{ $bilan->sejours_etranger ?? 'Néant' }}</p>
    <p><strong>Coopération et Partenariats :</strong> {{ $bilan->cooperation_partenariat ?? 'Néant' }}</p>

    <div class="section-title">4. ANIMATION SCIENTIFIQUE</div>
    <p>{{ $bilan->animation_scientific ?? 'Néant' }}</p>

    <div style="margin-top: 50px;">
        <div style="float: left; width: 40%; text-align: center;">
            <strong>Le Chef de Division</strong><br><br>
            {{ $bilan->chefDivision->nom }} {{ $bilan->chefDivision->prenom }}
        </div>
        <div style="float: right; width: 40%; text-align: center;">
            <strong>Visa Direction / CS</strong><br><br>
            ...........................
        </div>
    </div>
</body>

</html>