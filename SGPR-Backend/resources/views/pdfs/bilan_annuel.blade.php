<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <title>Bilan Projet - {{ $bilan->projet->titre }} - {{ $bilan->annee }}</title>
    <style>
        @page {
            margin: 1.5cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 9pt;
            color: #334155;
            line-height: 1.4;
            margin: 0;
            padding: 0;
        }

        /* Header moderne */
        .header {
            width: 100%;
            border-bottom: 3px solid #1e293b;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .header table {
            border: none;
            margin: 0;
        }

        .header td {
            border: none;
            padding: 0;
            vertical-align: middle;
        }

        .logo {
            width: 140px;
            filter: grayscale(10%);
        }

        .header-title {
            text-align: right;
        }

        .header-title h2 {
            margin: 0;
            font-size: 16pt;
            color: #1e293b;
            letter-spacing: -0.5px;
        }

        .header-title p {
            margin: 2px 0 0 0;
            font-size: 10pt;
            color: #64748b;
            font-weight: bold;
            text-transform: uppercase;
        }

        /* Titres de section stylisés */
        .section-header {
            background-color: #f8fafc;
            color: #1e293b;
            padding: 6px 10px;
            border-left: 4px solid #1e293b;
            font-weight: 800;
            text-transform: uppercase;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 9.5pt;
            border-bottom: 1px solid #e2e8f0;
        }

        /* Tableaux propres */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            table-layout: fixed;
        }

        th,
        td {
            border: 1px solid #e2e8f0;
            padding: 8px 10px;
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
        }

        th {
            background-color: #f1f5f9;
            font-size: 8pt;
            color: #475569;
            text-transform: uppercase;
            font-weight: bold;
        }

        .label {
            background-color: #f8fafc;
            width: 35%;
            font-weight: bold;
            color: #334155;
        }

        /* Style spécifique pour l'avancement */
        .badge-progress {
            background-color: #1e293b;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: bold;
        }

        /* Zones de texte */
        .text-block {
            border: 1px solid #e2e8f0;
            padding: 10px;
            background-color: #ffffff;
            min-height: 40px;
            white-space: pre-line;
            margin-bottom: 10px;
            color: #475569;
            font-style: italic;
        }

        /* Footer */
        .footer {
            position: fixed;
            bottom: -0.8cm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 8pt;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 5px;
        }

        .empty-msg {
            color: #94a3b8;
            font-style: italic;
            font-size: 8pt;
        }
    </style>
</head>

<body>

    @php
$logoPath = public_path('images/logo-cerist.png');
$base64 = '';
if (file_exists($logoPath)) {
    $type = pathinfo($logoPath, PATHINFO_EXTENSION);
    $data = file_get_contents($logoPath);
    $base64 = 'data:image/' . $type . ';base64,' . base64_encode($data);
}
    @endphp

    <div class="header">
        <table>
            <tr>
                <td>
                    @if($base64)
                        <img src="{{ $base64 }}" class="logo">
                    @else
                        <span style="color:#e11d48; font-size:8pt;">Logo CERIST</span>
                    @endif
                </td>
                <td class="header-title">
                    <h2>BILAN ANNUEL DE PROJET {{ $bilan->projet->titre }}</h2>
                    <p>SESSION ACADÉMIQUE {{ $bilan->annee }}</p>
                </td>
            </tr>
        </table>
    </div>

    <div class="section-header">1. Structure de Rattachement</div>
    <table>
        <tr>
            <td class="label">Division</td>
            <td>{{ $bilan->projet->division->nom }} ({{ $bilan->projet->division->acronyme }})</td>
        </tr>
    </table>

    <div class="section-header">2. Identification du Projet</div>
    <table>
        <tr>
            <td class="label">Intitulé du projet</td>
            <td style="color: #1e293b; font-weight: bold;">{{ $bilan->projet->titre }}</td>
        </tr>
        <tr>
            <td class="label">Chef de projet</td>
            <td>{{ $bilan->projet->chefProjet->nom }} {{ $bilan->projet->chefProjet->prenom }}</td>
        </tr>
        <tr>
            <td class="label">Type</td>
            <td>{{ $bilan->projet->type }}</td>
        </tr>
        <tr>
            <td class="label">Nature</td>
            <td>{{ $bilan->projet->nature }}</td>
        </tr>
        <tr>
            <td class="label">Période de validité</td>
            <td>
                Du {{ \Carbon\Carbon::parse($bilan->projet->date_debut)->format('d/m/Y') }}
                au {{ \Carbon\Carbon::parse($bilan->projet->date_fin)->format('d/m/Y') }}
            </td>
        </tr>
        <tr>
            <td class="label">État d'avancement physique</td>
            <td><span class="badge-progress">{{ $bilan->avancement_physique }}%</span></td>
        </tr>
    </table>

    <p style="font-weight: bold; margin: 15px 0 5px 0; color: #1e293b; font-size: 9pt;">Liste des participants :</p>
    <table>
        <thead>
            <tr>
                <th style="width: 30%;">Nom & Prénom</th>
                <th style="width: 20%;">Grade</th>
                <th style="width: 30%;">Qualité</th>
                <th style="width: 20%;">Participation</th>
            </tr>
        </thead>
        <tbody>
            @foreach($bilan->projet->membres as $m)
                <tr>
                    <td>{{ $m->nom }} {{ $m->prenom }}</td>
                    <td>{{ $m->grade }}</td>
                    <td>{{ $m->pivot->qualite }}</td>
                    <td style="text-align: center;">{{ $m->pivot->pourcentage_participation }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-header">3. Objectifs du projet</div>
    <div class="text-block">{{ $bilan->objectifs_realises ?: 'Aucun objectif renseigné.' }}</div>

    <div class="section-header">4. Résultats Quantifiés</div>

    <p style="font-weight: bold; margin: 10px 0 5px 0;">4.1 Production Scientifique</p>
    @if($bilan->productionsScientifiques->count() > 0)
        <table>
            <thead>
                <tr>
                    <th style="width: 20%;">Type</th>
                    <th>Détails bibliographiques</th>
                </tr>
            </thead>
            <tbody>
                @foreach($bilan->productionsScientifiques as $ps)
                    <tr>
                        <td style="font-weight: bold;">{{ $ps->type }}</td>
                        <td><strong>{{ $ps->titre }}</strong>. {{ $ps->revue_ou_conference }}, {{ $ps->date_parution }}.</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p class="empty-msg">Aucune production scientifique signalée.</p>
    @endif

    <p style="font-weight: bold; margin: 10px 0 5px 0;">4.2 Production Technologique</p>
    @if($bilan->productionsTechnologiques->count() > 0)
        <table>
            @foreach($bilan->productionsTechnologiques as $pt)
                <tr>
                    <td class="label" style="width: 25%;">{{ $pt->type }}</td>
                    <td><strong>{{ $pt->intitule }}</strong> : {{ $pt->description }}</td>
                </tr>
            @endforeach
        </table>
    @else
        <p class="empty-msg">Aucune production technologique signalée.</p>
    @endif

    <p style="font-weight: bold; margin: 10px 0 5px 0;">4.3 Formation pour la recherche (Encadrements)</p>
    <table>
        <thead>
            <tr>
                <th style="width: 20%;">Étudiant</th>
                <th style="width: 15%;">Diplôme</th>
                <th style="width: 30%;">Sujet de recherche</th>
                <th style="width: 20%;">Établissement</th>
                <th style="width: 15%;">Avancement</th>
            </tr>
        </thead>
        <tbody>
            @forelse($bilan->encadrements as $e)
                <tr>
                    <td>{{ $e->nom_etudiant }}</td>
                    <td>{{ $e->type_diplome }}</td>
                    <td>{{ $e->sujet ?: 'N/A' }}</td>
                    <td>{{ $e->etablissement ?: 'N/A' }}</td>
                    <td>{{ $e->etat_avancement }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" style="text-align: center;" class="empty-msg">Aucun encadrement.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="section-header">5. Collaboration & Difficultés</div>
    <p style="font-weight: bold; margin: 5px 0;">Collaborations :</p>
    <div class="text-block">{{ $bilan->collaborations ?: 'Néant.' }}</div>

    <table>
        <tr>
            <td class="label">Difficultés Scientifiques</td>
            <td>{{ $bilan->difficultes_scientifiques ?: 'Néant' }}</td>
        </tr>
        <tr>
            <td class="label">Difficultés Matérielles</td>
            <td>{{ $bilan->difficultes_materielles ?: 'Néant' }}</td>
        </tr>
    </table>

    <div class="footer">
        CERIST - Système de Gestion des Projets de Recherche (SGPR) — Page
        <script type="text/php">
            if (isset($pdf)) {
                $text = "{PAGE_NUM} / {PAGE_COUNT}";
                $size = 7;
                $font = $fontMetrics->getFont("helvetica");
                $width = $fontMetrics->get_text_width($text, $font, $size) / 2;
                $x = ($pdf->get_width() - $width) / 2;
                $y = $pdf->get_height() - 35;
                $pdf->page_text($x, $y, $text, $font, $size);
            }
        </script>
    </div>
</body>

</html>