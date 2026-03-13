<?php
/**
 * Plugin Name: Vendorama Suche
 * Plugin URI:  https://www.vendorama.eu
 * Description: Suchformular und Filterung fuer Automatenstandorte.
 * Version:     2.0.0
 * Author:      Vendorama
 * License:     GPL2
 */

defined('ABSPATH') or die('Kein direkter Zugriff!');

// -------------------------------------------------------
// Styles und Scripts laden
// -------------------------------------------------------
add_action('wp_enqueue_scripts', 'vendorama_search_assets');

function vendorama_search_assets() {
    wp_enqueue_style('vendorama-search', plugin_dir_url(__FILE__) . 'vendorama-search.css', [], '2.0.0');
    wp_enqueue_script('vendorama-search', plugin_dir_url(__FILE__) . 'vendorama-search.js', ['jquery'], '2.0.0', true);
    wp_localize_script('vendorama-search', 'vendoramaSearch', [
        'ajaxurl' => admin_url('admin-ajax.php'),
        'nonce'   => wp_create_nonce('vendorama_search_nonce'),
    ]);
}

// -------------------------------------------------------
// Shortcode [vendorama_suche]
// -------------------------------------------------------
add_shortcode('vendorama_suche', 'vendorama_search_shortcode');

function vendorama_search_shortcode() {
    ob_start();
    ?>
    <div id="vendorama-suchformular">
        <div class="vs-form-row">
            <div class="vs-field vs-field-grow">
                <label for="vs-ort">📍 Ort oder PLZ</label>
                <div class="vs-input-group">
                    <input type="text" id="vs-ort" placeholder="z.B. München oder 80331" />
                    <button id="vs-gps-btn" title="Meinen Standort verwenden">📡 Mein Standort</button>
                </div>
            </div>
            <div class="vs-field vs-field-small">
                <label for="vs-umkreis">Umkreis</label>
                <select id="vs-umkreis">
                    <option value="2">2 km</option>
                    <option value="5">5 km</option>
                    <option value="10" selected>10 km</option>
                    <option value="25">25 km</option>
                    <option value="50">50 km</option>
                    <option value="0">Alle</option>
                </select>
            </div>
        </div>
        <div class="vs-form-row">
            <div class="vs-field">
                <label for="vs-kategorie">🏷️ Kategorie</label>
                <select id="vs-kategorie">
                    <option value="">Alle Kategorien</option>
                    <option value="zigaretten">Zigaretten</option>
                    <option value="suessigkeiten">Süßigkeiten & Snacks</option>
                    <option value="getraenke">Getränke</option>
                    <option value="frischprodukte">Frischprodukte</option>
                    <option value="backwaren">Backwaren</option>
                    <option value="blumen">Blumen</option>
                    <option value="pakete">Pakete & Post</option>
                    <option value="geldautomat">Geldautomat</option>
                    <option value="tankautomat">Tankautomat</option>
                    <option value="fahrrad">Fahrrad & Mobilität</option>
                    <option value="sonstiges">Sonstiges</option>
                </select>
            </div>
            <div class="vs-field">
                <label for="vs-zahlung">💳 Zahlungsart</label>
                <select id="vs-zahlung">
                    <option value="">Alle Zahlungsarten</option>
                    <option value="bargeld">Bargeld</option>
                    <option value="ec_karte">EC-Karte</option>
                    <option value="kreditkarte">Kreditkarte</option>
                    <option value="app">App / QR-Code</option>
                    <option value="kostenlos">Kostenlos</option>
                </select>
            </div>
            <div class="vs-field">
                <label for="vs-bewertung">⭐ Mindestbewertung</label>
                <select id="vs-bewertung">
                    <option value="0">Alle</option>
                    <option value="3">3+ Sterne</option>
                    <option value="4">4+ Sterne</option>
                    <option value="5">Nur 5 Sterne</option>
                </select>
            </div>
        </div>
        <div class="vs-form-row">
            <div class="vs-field vs-field-check">
                <label><input type="checkbox" id="vs-24h" /> ⏰ Nur 24/7 geöffnet</label>
            </div>
            <div class="vs-field vs-field-check">
                <label><input type="checkbox" id="vs-verifiziert" /> ✅ Nur verifizierte Automaten</label>
            </div>
        </div>
        <div class="vs-form-row">
            <button id="vs-suchen" class="vs-btn">🔍 Automaten suchen</button>
            <button id="vs-reset" class="vs-btn vs-btn-secondary">↺ Zurücksetzen</button>
        </div>
    </div>

    <div id="vs-ergebnis-info"></div>
    <div id="vs-ergebnisse">
        <div class="vs-liste" id="vs-liste"></div>
    </div>

    <!-- Bewertungs-Modal -->
    <div id="vs-modal" style="display:none;">
        <div id="vs-modal-inner">
            <h3>Automat bewerten</h3>
            <div id="vs-sterne-input">
                <span class="vs-stern-input" data-wert="1">★</span>
                <span class="vs-stern-input" data-wert="2">★</span>
                <span class="vs-stern-input" data-wert="3">★</span>
                <span class="vs-stern-input" data-wert="4">★</span>
                <span class="vs-stern-input" data-wert="5">★</span>
            </div>
            <textarea id="vs-kommentar" placeholder="Optionaler Kommentar..."></textarea>
            <div class="vs-modal-buttons">
                <button id="vs-bewertung-speichern" class="vs-btn">Bewertung speichern</button>
                <button id="vs-modal-schliessen" class="vs-btn vs-btn-secondary">Abbrechen</button>
            </div>
            <input type="hidden" id="vs-bewertung-post-id" />
        </div>
    </div>
    <div id="vs-modal-overlay" style="display:none;"></div>
    <?php
    return ob_get_clean();
}

// -------------------------------------------------------
// AJAX Handler - Suche
// -------------------------------------------------------
add_action('wp_ajax_vendorama_suche', 'vendorama_ajax_suche');
add_action('wp_ajax_nopriv_vendorama_suche', 'vendorama_ajax_suche');

function vendorama_ajax_suche() {
    check_ajax_referer('vendorama_search_nonce', 'nonce');

    $kategorie    = sanitize_text_field($_POST['kategorie'] ?? '');
    $zahlung      = sanitize_text_field($_POST['zahlung'] ?? '');
    $nur_24h      = ($_POST['nur_24h'] ?? '') === 'true';
    $verifiziert  = ($_POST['verifiziert'] ?? '') === 'true';
    $min_bewertung = intval($_POST['min_bewertung'] ?? 0);
    $lat_user     = floatval($_POST['lat'] ?? 0);
    $lng_user     = floatval($_POST['lng'] ?? 0);
    $umkreis      = intval($_POST['umkreis'] ?? 0);

    $meta_query = ['relation' => 'AND'];

    if (!empty($kategorie)) {
        $meta_query[] = ['key' => 'kategorie', 'value' => $kategorie, 'compare' => '='];
    }
    if (!empty($zahlung)) {
        $meta_query[] = ['key' => 'zahlungsarten', 'value' => $zahlung, 'compare' => 'LIKE'];
    }
    if ($nur_24h) {
        $meta_query[] = ['key' => 'oeffnungszeiten', 'value' => '24h', 'compare' => '='];
    }
    if ($verifiziert) {
        $meta_query[] = ['key' => 'verifiziert', 'value' => '1', 'compare' => '='];
    }

    $args = [
        'post_type'      => 'automat',
        'post_status'    => 'publish',
        'posts_per_page' => 200,
        'meta_query'     => $meta_query,
    ];

    $automaten  = get_posts($args);
    $ergebnisse = [];

    foreach ($automaten as $automat) {
        $lat = floatval(get_field('gps_lat', $automat->ID));
        $lng = floatval(get_field('gps_lng', $automat->ID));

        // Umkreisfilter
        $distanz = null;
        if ($umkreis > 0 && $lat_user != 0 && $lng_user != 0) {
            $distanz = vendorama_distanz($lat_user, $lng_user, $lat, $lng);
            if ($distanz > $umkreis) continue;
        }

        // Bewertung berechnen
        $sum    = floatval(get_post_meta($automat->ID, 'bewertung_summe', true));
        $anzahl = intval(get_post_meta($automat->ID, 'bewertung_anzahl', true));
        $durchschnitt = $anzahl > 0 ? round($sum / $anzahl, 1) : 0;

        if ($min_bewertung > 0 && $durchschnitt < $min_bewertung) continue;

        // Foto holen
        $foto_url = '';
        $foto = get_field('foto', $automat->ID);
        if ($foto) {
            $foto_url = is_array($foto) ? ($foto['sizes']['medium'] ?? $foto['url']) : $foto;
        }

        $ergebnisse[] = [
            'id'           => $automat->ID,
            'titel'        => $automat->post_title,
            'kategorie'    => get_field('kategorie', $automat->ID),
            'zahlung'      => get_field('zahlungsarten', $automat->ID),
            'oeffnung'     => get_field('oeffnungszeiten', $automat->ID),
            'beschreibung' => get_field('standort_beschreibung', $automat->ID),
            'lat'          => $lat,
            'lng'          => $lng,
            'verifiziert'  => get_field('verifiziert', $automat->ID),
            'distanz'      => $distanz ? round($distanz, 1) : null,
            'bewertung'    => $durchschnitt,
            'bewertung_anzahl' => $anzahl,
            'foto'         => $foto_url,
        ];
    }

    // Nach Distanz sortieren
    if ($lat_user != 0) {
        usort($ergebnisse, function($a, $b) {
            return ($a['distanz'] ?? 999) <=> ($b['distanz'] ?? 999);
        });
    }

    wp_send_json_success($ergebnisse);
}

// -------------------------------------------------------
// AJAX Handler - Bewertung speichern
// -------------------------------------------------------
add_action('wp_ajax_vendorama_bewertung', 'vendorama_ajax_bewertung');
add_action('wp_ajax_nopriv_vendorama_bewertung', 'vendorama_ajax_bewertung');

function vendorama_ajax_bewertung() {
    check_ajax_referer('vendorama_search_nonce', 'nonce');

    $post_id   = intval($_POST['post_id'] ?? 0);
    $sterne    = intval($_POST['sterne'] ?? 0);
    $kommentar = sanitize_textarea_field($_POST['kommentar'] ?? '');

    if (!$post_id || $sterne < 1 || $sterne > 5) {
        wp_send_json_error('Ungueltige Bewertung');
    }
    if (get_post_type($post_id) !== 'automat') {
        wp_send_json_error('Ungueltiger Post');
    }

    // Bewertung speichern
    $sum    = floatval(get_post_meta($post_id, 'bewertung_summe', true));
    $anzahl = intval(get_post_meta($post_id, 'bewertung_anzahl', true));

    update_post_meta($post_id, 'bewertung_summe', $sum + $sterne);
    update_post_meta($post_id, 'bewertung_anzahl', $anzahl + 1);

    // Kommentar als WordPress-Kommentar speichern
    if (!empty($kommentar)) {
        wp_insert_comment([
            'comment_post_ID'  => $post_id,
            'comment_content'  => $kommentar . ' [Bewertung: ' . $sterne . ' Sterne]',
            'comment_approved' => 0, // Moderationspflichtig
            'comment_author'   => 'Vendorama-Nutzer',
        ]);
    }

    $neuer_schnitt = round(($sum + $sterne) / ($anzahl + 1), 1);
    wp_send_json_success(['neuer_schnitt' => $neuer_schnitt, 'anzahl' => $anzahl + 1]);
}

// -------------------------------------------------------
// AJAX Handler - Geocoding
// -------------------------------------------------------
add_action('wp_ajax_vendorama_geocode', 'vendorama_ajax_geocode');
add_action('wp_ajax_nopriv_vendorama_geocode', 'vendorama_ajax_geocode');

function vendorama_ajax_geocode() {
    check_ajax_referer('vendorama_search_nonce', 'nonce');

    $ort = sanitize_text_field($_POST['ort'] ?? '');
    if (empty($ort)) wp_send_json_error('Kein Ort angegeben');

    $url = 'https://nominatim.openstreetmap.org/search?q=' . urlencode($ort) . '&format=json&limit=1&countrycodes=de,at,ch';
    $response = wp_remote_get($url, [
        'headers' => ['User-Agent' => 'Vendorama/2.0 (https://www.vendorama.eu)'],
        'timeout' => 5,
    ]);

    if (is_wp_error($response)) wp_send_json_error('Geocoding fehlgeschlagen');

    $data = json_decode(wp_remote_retrieve_body($response), true);
    if (empty($data)) wp_send_json_error('Ort nicht gefunden');

    wp_send_json_success([
        'lat' => floatval($data[0]['lat']),
        'lng' => floatval($data[0]['lon']),
    ]);
}

// -------------------------------------------------------
// Haversine Formel
// -------------------------------------------------------
function vendorama_distanz($lat1, $lng1, $lat2, $lng2) {
    $r    = 6371;
    $dlat = deg2rad($lat2 - $lat1);
    $dlng = deg2rad($lng2 - $lng1);
    $a    = sin($dlat/2) * sin($dlat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dlng/2) * sin($dlng/2);
    return $r * 2 * atan2(sqrt($a), sqrt(1-$a));
}
