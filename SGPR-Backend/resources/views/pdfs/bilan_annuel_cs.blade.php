<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport Annuel CS</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; }
        .section { margin-top: 20px; }
        .section-title { font-weight: bold; text-decoration: underline; text-transform: uppercase; margin-bottom: 10px; }
        .content { text-align: justify; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #999; padding: 8px; text-align: left; }
        .footer { margin-top: 50px; text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport Annuel du Conseil Scientifique</h1>
        <p>Session du : {{ $session->date_session }} | Lieu : {{ $session->lieu }}</p>
        <p><strong>Année de référence : {{ $bilan->annee }}</strong></p>
    </div>

    <div class="section">
        <div class="section-title">1. Introduction Générale</div>
        <div class="content">{{ $bilan->introduction_generale }}</div>
    </div>

    <div class="section">
        <div class="section-title">2. Synthèse Nationale Scientifique</div>
        <div class="content">{{ $bilan->synthese_nationale_scientifique }}</div>
    </div>

    <div class="section">
        <div class="section-title">3. Divisions de Recherche Consolidées</div>
        <table>
            <thead>
                <tr>
                    <th>Division</th>
                    <th>Responsable</th>
                    <th>Année</th>
                </tr>
            </thead>
            <tbody>
                @foreach($bilan->bilansDivisions as $divBilan)
                <tr>
                    <td>{{ $divBilan->division->nom }}</td>
                    <td>{{ $divBilan->chefDivision->nom }}</td>
                    <td>{{ $divBilan->annee }}</td>
                </tr>
                @endforeach
            </tbody>
        </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">4. Recommandations Stratégiques</div>
        <div class="content">{{ $bilan->recommandations_strategiques }}</div>
    </div>

    <div class="footer">
        <p>Fait à {{ $session->lieu }}, le {{ $date_generation }}</p>
        <p><strong>Le Responsable du CS</strong></p>
        <p>{{ $bilan->responsableCs->nom }} {{ $bilan->responsableCs->prenom }}</p>
    </div>
</body>
</html>