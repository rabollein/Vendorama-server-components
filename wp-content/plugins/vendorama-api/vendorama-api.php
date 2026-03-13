<?php
/**
 * Plugin Name: Vendorama REST API
 * Description: REST API Endpunkte für die Vendorama App (Suche, Submit, Bewertung)
 * Version:     1.0.0
 * Author:      Vendorama
 */

defined('ABSPATH') or die('Kein direkter Zugriff!');

// -------------------------------------------------------
// REST API Routen registrieren
// -------------------------------------------------------
add_action('rest_api_init', function () {

    // Suche
    register_rest_route('vendorama/v1', '/suche', [
        'methods'             => ['GET', 'POST'],
        'callback'            => 'vendorama_api_suche',
        'permission_callback' => '__return_true',
    ]);

    // Automat einreichen
    register_rest_route('vendorama/v1', '/submit', [
        'methods'             => 'POST',
        'callback'            => 'vendorama_api_submit',
        'permission_callback' => '__return_true',
    ]);

    // Bewertung abgeben
    register_rest_route('vendorama/v1', '/rate', [
        'methods'             => 'POST',
        'callback'            => 'vendorama_api_rate',
        'permission_callback' => '__return_true',
    ]);

});

// -------------------------------------------------------
// Hilfsfunktion: Automat-Daten aufbereiten
// -------------------------------------------------------
function vendorama_automat_zu_array($post_id) {
    $lat = floatval(get_field('gps_lat', $post_id));
    $lng = floatval(get_field('gps_lng', $post_id));
    if (!$lat || !$lng) return null;

    $sum    = floatval(get_post_meta($post_id, 'bewertung_summe', true));
    $anzahl = intval(get_post_meta($post_id, 'bewertung_anzahl', true));
    $schnitt = $anzahl > 0 ? round($sum / $anzahl, 1) : 0;

    $foto = get_field('foto', $post_id);
    $foto_url = '';
    if ($foto) {
        if (is_array($foto)) {
            $foto_url = $foto['sizes']['medium'] ?? $foto['url'] ?? '';
        } else {
            $foto_url = $foto;
        }
    }

    $zahlung = get_field('zahlungsarten', $post_id);

    return [
        'id'               => $post_id,
        'titel'            => get_the_title($post_id),
        'kategorie'        => get_field('kategorie', $post_id) ?? 'sonstiges',
        'zahlung'          => is_array($zahlung) ? implode(', ', $zahlung) : ($zahlung ?? ''),
        'oeffnung'         => get_field('oeffnungszeiten', $post_id) ?? '',
        'beschreibung'     => get_field('standort_beschreibung', $post_id) ?? '',
        'verifiziert'      => (bool) get_field('verifiziert', $post_id),
        'bewertung'        => $schnitt,
        'bewertung_anzahl' => $anzahl,
        'foto'             => $foto_url,
        'lat'              => $lat,
        'lng'              => $lng,
    ];
}

// -------------------------------------------------------
// Haversine Distanz in km
// -------------------------------------------------------
function vendorama_api_distanz($lat1, $lng1, $lat2, $lng2) {
    $R = 6371;
    $dLat = deg2rad($lat2 - $lat1);
    $dLng = deg2rad($lng2 - $lng1);
    $a = sin($dLat/2) * sin($dLat/2)
       + cos(deg2rad($lat1)) * cos(deg2rad($lat2))
       * sin($dLng/2) * sin($dLng/2);
    return $R * 2 * atan2(sqrt($a), sqrt(1-$a));
}

// -------------------------------------------------------
// ENDPOINT: /vendorama/v1/suche
// -------------------------------------------------------
function vendorama_api_suche(WP_REST_Request $request) {
    $kategorie      = sanitize_text_field($request->get_param('kategorie') ?? '');
    $zahlung        = sanitize_text_field($request->get_param('zahlung') ?? '');
    $nur_24h        = filter_var($request->get_param('nur_24h'), FILTER_VALIDATE_BOOLEAN);
    $verifiziert    = filter_var($request->get_param('verifiziert'), FILTER_VALIDATE_BOOLEAN);
    $lat            = floatval($request->get_param('lat') ?? 0);
    $lng            = floatval($request->get_param('lng') ?? 0);
    $umkreis        = intval($request->get_param('umkreis') ?? 0);
    $min_bewertung  = floatval($request->get_param('min_bewertung') ?? 0);

    // Meta Query aufbauen
    $meta_query = ['relation' => 'AND'];

    if ($kategorie) {
        $meta_query[] = [
            'key'     => 'kategorie',
            'value'   => $kategorie,
            'compare' => '=',
        ];
    }

    if ($nur_24h) {
        $meta_query[] = [
            'key'     => 'oeffnungszeiten',
            'value'   => '24h',
            'compare' => '=',
        ];
    }

    if ($verifiziert) {
        $meta_query[] = [
            'key'     => 'verifiziert',
            'value'   => '1',
            'compare' => '=',
        ];
    }

    $args = [
        'post_type'      => 'automat',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'meta_query'     => $meta_query,
    ];

    $posts = get_posts($args);
    $ergebnisse = [];

    foreach ($posts as $post) {
        $data = vendorama_automat_zu_array($post->ID);
        if (!$data) continue;

        // Zahlungsart Filter
        if ($zahlung && strpos($data['zahlung'], $zahlung) === false) continue;

        // Mindestbewertung Filter
        if ($min_bewertung > 0 && $data['bewertung'] < $min_bewertung) continue;

        // Umkreis berechnen
        if ($lat && $lng) {
            $distanz = vendorama_api_distanz($lat, $lng, $data['lat'], $data['lng']);
            if ($umkreis > 0 && $distanz > $umkreis) continue;
            $data['distanz'] = round($distanz, 1);
        }

        $ergebnisse[] = $data;
    }

    // Nach Distanz sortieren wenn GPS vorhanden
    if ($lat && $lng) {
        usort($ergebnisse, fn($a, $b) => ($a['distanz'] ?? 999) <=> ($b['distanz'] ?? 999));
    }

    return rest_ensure_response([
        'success' => true,
        'count'   => count($ergebnisse),
        'data'    => $ergebnisse,
    ]);
}

// -------------------------------------------------------
// ENDPOINT: /vendorama/v1/submit
// -------------------------------------------------------
function vendorama_api_submit(WP_REST_Request $request) {
    $titel          = sanitize_text_field($request->get_param('titel') ?? '');
    $kategorie      = sanitize_text_field($request->get_param('kategorie') ?? '');
    $zahlungsarten  = sanitize_text_field($request->get_param('zahlungsarten') ?? '');
    $oeffnungszeiten = sanitize_text_field($request->get_param('oeffnungszeiten') ?? '');
    $beschreibung   = sanitize_textarea_field($request->get_param('beschreibung') ?? '');
    $lat            = floatval($request->get_param('lat') ?? 0);
    $lng            = floatval($request->get_param('lng') ?? 0);
    $foto_base64    = $request->get_param('foto') ?? '';

    // Pflichtfelder prüfen
    if (!$titel || !$kategorie || !$lat || !$lng) {
        return rest_ensure_response([
            'success' => false,
            'message' => 'Pflichtfelder fehlen: titel, kategorie, lat, lng',
        ]);
    }

    // Post anlegen (pending – muss von Admin freigeschaltet werden)
    $post_id = wp_insert_post([
        'post_title'  => $titel,
        'post_type'   => 'automat',
        'post_status' => 'pending',
    ]);

    if (is_wp_error($post_id)) {
        return rest_ensure_response(['success' => false, 'message' => 'Fehler beim Speichern']);
    }

    // ACF Felder speichern
    update_field('kategorie', $kategorie, $post_id);
    update_field('zahlungsarten', explode(',', $zahlungsarten), $post_id);
    update_field('oeffnungszeiten', $oeffnungszeiten, $post_id);
    update_field('standort_beschreibung', $beschreibung, $post_id);
    update_field('gps_lat', $lat, $post_id);
    update_field('gps_lng', $lng, $post_id);
    update_field('verifiziert', false, $post_id);

    // Foto speichern (Base64)
    if ($foto_base64) {
        $foto_id = vendorama_speichere_foto($foto_base64, $post_id, $titel);
        if ($foto_id) {
            update_field('foto', $foto_id, $post_id);
        }
    }

    // Admin benachrichtigen
    $admin_email = get_option('admin_email');
    wp_mail(
        $admin_email,
        'Vendorama: Neuer Automat zur Prüfung',
        "Ein neuer Automat wurde gemeldet:\n\nTitel: $titel\nKategorie: $kategorie\nGPS: $lat, $lng\n\nZum Freischalten: " . admin_url('post.php?post=' . $post_id . '&action=edit')
    );

    return rest_ensure_response([
        'success' => true,
        'post_id' => $post_id,
        'message' => 'Automat gemeldet und wartet auf Freischaltung',
    ]);
}

// -------------------------------------------------------
// Foto aus Base64 speichern
// -------------------------------------------------------
function vendorama_speichere_foto($base64, $post_id, $titel) {
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    // Base64 bereinigen
    $base64 = preg_replace('/^data:image\/\w+;base64,/', '', $base64);
    $image_data = base64_decode($base64);
    if (!$image_data) return false;

    $upload_dir = wp_upload_dir();
    $dateiname  = 'automat-' . $post_id . '-' . time() . '.jpg';
    $dateipfad  = $upload_dir['path'] . '/' . $dateiname;

    file_put_contents($dateipfad, $image_data);

    $attachment = [
        'post_mime_type' => 'image/jpeg',
        'post_title'     => sanitize_file_name($titel),
        'post_content'   => '',
        'post_status'    => 'inherit',
    ];

    $attach_id = wp_insert_attachment($attachment, $dateipfad, $post_id);
    wp_update_attachment_metadata($attach_id, wp_generate_attachment_metadata($attach_id, $dateipfad));

    return $attach_id;
}

// -------------------------------------------------------
// ENDPOINT: /vendorama/v1/rate
// -------------------------------------------------------
function vendorama_api_rate(WP_REST_Request $request) {
    $post_id   = intval($request->get_param('post_id') ?? 0);
    $sterne    = intval($request->get_param('sterne') ?? 0);
    $kommentar = sanitize_textarea_field($request->get_param('kommentar') ?? '');

    if (!$post_id || $sterne < 1 || $sterne > 5) {
        return rest_ensure_response([
            'success' => false,
            'message' => 'Ungültige Bewertung',
        ]);
    }

    // Prüfen ob Post existiert
    $post = get_post($post_id);
    if (!$post || $post->post_type !== 'automat') {
        return rest_ensure_response(['success' => false, 'message' => 'Automat nicht gefunden']);
    }

    // Bewertung speichern
    $alte_summe  = floatval(get_post_meta($post_id, 'bewertung_summe', true));
    $alte_anzahl = intval(get_post_meta($post_id, 'bewertung_anzahl', true));

    update_post_meta($post_id, 'bewertung_summe',  $alte_summe + $sterne);
    update_post_meta($post_id, 'bewertung_anzahl', $alte_anzahl + 1);

    // Kommentar als WordPress-Kommentar speichern
    if ($kommentar) {
        wp_insert_comment([
            'comment_post_ID' => $post_id,
            'comment_content' => $kommentar,
            'comment_type'    => 'vendorama_bewertung',
            'comment_meta'    => ['sterne' => $sterne],
            'comment_approved' => 0, // Erst nach Prüfung sichtbar
        ]);
    }

    $neue_anzahl = $alte_anzahl + 1;
    $neuer_schnitt = round(($alte_summe + $sterne) / $neue_anzahl, 1);

    return rest_ensure_response([
        'success'  => true,
        'schnitt'  => $neuer_schnitt,
        'anzahl'   => $neue_anzahl,
        'message'  => 'Bewertung gespeichert',
    ]);
}
