<?php
/**
 * Plugin Name: Vendorama Admin API
 * Description: Admin REST API Endpunkte für die Vendorama Admin App
 * Version:     1.0.0
 * Author:      Vendorama
 */

defined('ABSPATH') or die('Kein direkter Zugriff!');

add_action('rest_api_init', function() {
    // Alle Automaten laden (auch ausstehende)
    register_rest_route('vendorama/v1', '/admin/automaten', [
        'methods'  => 'GET',
        'callback' => 'vendorama_admin_automaten',
        'permission_callback' => 'vendorama_admin_check',
    ]);

    // Automat freischalten
    register_rest_route('vendorama/v1', '/admin/freischalten', [
        'methods'  => 'POST',
        'callback' => 'vendorama_admin_freischalten',
        'permission_callback' => 'vendorama_admin_check',
    ]);

    // Automat ablehnen
    register_rest_route('vendorama/v1', '/admin/ablehnen', [
        'methods'  => 'POST',
        'callback' => 'vendorama_admin_ablehnen',
        'permission_callback' => 'vendorama_admin_check',
    ]);

    // Automat aktualisieren
    register_rest_route('vendorama/v1', '/admin/aktualisieren', [
        'methods'  => 'POST',
        'callback' => 'vendorama_admin_aktualisieren',
        'permission_callback' => 'vendorama_admin_check',
    ]);

    // Claim-Anfragen laden
    register_rest_route('vendorama/v1', '/admin/claims', [
        'methods'  => 'GET',
        'callback' => 'vendorama_admin_claims',
        'permission_callback' => 'vendorama_admin_check',
    ]);

    // Claim genehmigen
    register_rest_route('vendorama/v1', '/admin/claim_genehmigen', [
        'methods'  => 'POST',
        'callback' => 'vendorama_admin_claim_genehmigen',
        'permission_callback' => 'vendorama_admin_check',
    ]);
    // Claim ablehnen
    register_rest_route('vendorama/v1', '/admin/claim_ablehnen', [
        'methods'  => 'POST',
        'callback' => 'vendorama_admin_claim_ablehnen',
        'permission_callback' => 'vendorama_admin_check',
    ]);
});

// Nur Admins dürfen diese Endpunkte nutzen
function vendorama_admin_check() {
    return current_user_can('manage_options');
}

// Alle Automaten laden
function vendorama_admin_automaten(WP_REST_Request $request) {
    $status = sanitize_text_field($request->get_param('status') ?? 'publish');
    if (!in_array($status, ['publish', 'pending', 'draft', 'any'])) $status = 'publish';

    $posts = get_posts([
        'post_type'      => 'automat',
        'post_status'    => $status,
        'posts_per_page' => -1,
        'orderby'        => 'date',
        'order'          => 'DESC',
    ]);

    $ergebnisse = [];
    foreach ($posts as $post) {
        $zahlung = get_field('zahlungsarten', $post->ID);
        $lat = floatval(get_field('gps_lat', $post->ID));
        $lng = floatval(get_field('gps_lng', $post->ID));
        $foto = get_field('foto', $post->ID);
        $foto_url = '';
        if (is_array($foto)) $foto_url = $foto['url'] ?? '';
        elseif (is_string($foto)) $foto_url = $foto;

        global $wpdb;
        $val = $wpdb->get_var($wpdb->prepare(
            "SELECT meta_value FROM {$wpdb->postmeta} WHERE post_id = %d AND meta_key = 'kategorie'",
            $post->ID
        ));
        $kat = maybe_unserialize($val);
        if (!is_array($kat)) $kat = $kat ? [$kat] : ['sonstiges'];

        $ergebnisse[] = [
            'id'          => $post->ID,
            'titel'       => $post->post_title,
            'kategorie'   => $kat,
            'zahlung'     => is_array($zahlung) ? implode(', ', $zahlung) : ($zahlung ?? ''),
            'oeffnung'    => get_field('oeffnungszeiten', $post->ID) ?? '',
            'beschreibung'=> get_field('standort_beschreibung', $post->ID) ?? '',
            'verifiziert' => (bool) get_field('verifiziert', $post->ID),
            'post_status' => $post->post_status,
            'foto'        => $foto_url,
            'lat'         => $lat,
            'lng'         => $lng,
        ];
    }

    return wp_send_json_success($ergebnisse);
}

// Automat freischalten
function vendorama_admin_freischalten(WP_REST_Request $request) {
    $id = intval($request->get_param('id'));
    if (!$id) return wp_send_json_error('Keine ID');

    $result = wp_update_post(['ID' => $id, 'post_status' => 'publish']);
    if (is_wp_error($result)) return wp_send_json_error('Fehler beim Freischalten');

    return wp_send_json_success('Automat freigeschaltet');
}

// Automat ablehnen/löschen
function vendorama_admin_ablehnen(WP_REST_Request $request) {
    $id = intval($request->get_param('id'));
    if (!$id) return wp_send_json_error('Keine ID');

    $result = wp_trash_post($id);
    if (!$result) return wp_send_json_error('Fehler beim Ablehnen');

    return wp_send_json_success('Automat abgelehnt');
}

// Automat aktualisieren
function vendorama_admin_aktualisieren(WP_REST_Request $request) {
    $id            = intval($request->get_param('id'));
    $titel         = sanitize_text_field($request->get_param('titel') ?? '');
    $kategorien    = $request->get_param('kategorien') ?? [];
    $zahlungsarten = $request->get_param('zahlungsarten') ?? [];
    $oeffnung      = sanitize_text_field($request->get_param('oeffnungszeiten') ?? '');
    $beschreibung  = sanitize_text_field($request->get_param('beschreibung') ?? '');
    $lat           = floatval($request->get_param('lat') ?? 0);
    $lng           = floatval($request->get_param('lng') ?? 0);
    $verifiziert   = filter_var($request->get_param('verifiziert'), FILTER_VALIDATE_BOOLEAN);
    $fotoBase64    = $request->get_param('foto');

    if (!$id || !$titel) return wp_send_json_error('Pflichtfelder fehlen');

    // Titel aktualisieren
    wp_update_post(['ID' => $id, 'post_title' => $titel]);

    // ACF Felder aktualisieren
    update_field('kategorie', $kategorien, $id);
    update_field('zahlungsarten', $zahlungsarten, $id);
    update_field('oeffnungszeiten', $oeffnung, $id);
    update_field('standort_beschreibung', $beschreibung, $id);
    update_field('gps_lat', $lat, $id);
    update_field('gps_lng', $lng, $id);
    update_field('verifiziert', $verifiziert, $id);

    // Foto verarbeiten
    if ($fotoBase64) {
        $decoded = base64_decode($fotoBase64);
        if ($decoded) {
            $upload = wp_upload_bits("automat-{$id}-" . time() . ".jpg", null, $decoded);
            if (!$upload['error']) {
                $attachment_id = wp_insert_attachment([
                    'post_mime_type' => 'image/jpeg',
                    'post_title'     => "Automat {$id}",
                    'post_status'    => 'inherit',
                ], $upload['file'], $id);
                if ($attachment_id) update_field('foto', $attachment_id, $id);
            }
        }
    }

    // Auto-Marker aktualisieren
    if (function_exists('vendorama_sync_marker')) {
        vendorama_sync_marker($id, get_post($id));
    }

    return wp_send_json_success('Automat aktualisiert');
}

// Claim-Anfragen laden
function vendorama_admin_claims(WP_REST_Request $request) {
    $posts = get_posts([
        'post_type'      => 'vendorama_claim',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'meta_query'     => [['key' => '_claim_status', 'value' => 'ausstehend']],
    ]);

    $claims = [];
    foreach ($posts as $post) {
        $automat_id = get_post_meta($post->ID, '_claim_automat_id', true);
        $claims[] = [
            'id'            => $post->ID,
            'automat_id'    => $automat_id,
            'automat_titel' => get_the_title($automat_id),
            'name'          => get_post_meta($post->ID, '_claim_name', true),
            'firma'         => get_post_meta($post->ID, '_claim_firma', true),
            'email'         => get_post_meta($post->ID, '_claim_email', true),
            'telefon'       => get_post_meta($post->ID, '_claim_telefon', true),
            'nachricht'     => get_post_meta($post->ID, '_claim_nachricht', true),
            'datum'         => get_the_date('d.m.Y', $post->ID),
        ];
    }

    return wp_send_json_success($claims);
}

// Claim genehmigen
function vendorama_admin_claim_genehmigen(WP_REST_Request $request) {
    $claim_id = intval($request->get_param('claim_id'));
    if (!$claim_id) return wp_send_json_error('Keine Claim-ID');

    $email      = get_post_meta($claim_id, '_claim_email', true);
    $name       = get_post_meta($claim_id, '_claim_name', true);
    $automat_id = get_post_meta($claim_id, '_claim_automat_id', true);

    if (!$email) return wp_send_json_error('E-Mail fehlt');

    // Benutzer anlegen
    $user_id = username_exists($email) ? get_user_by('email', $email)->ID : wp_create_user($email, wp_generate_password(), $email);
    if (is_wp_error($user_id)) return wp_send_json_error('Benutzer konnte nicht angelegt werden');

    $user = new WP_User($user_id);
    $user->set_role('vendorama_betreiber');
    wp_update_user(['ID' => $user_id, 'display_name' => $name]);

    // Automat dem Betreiber zuweisen
    if ($automat_id) wp_update_post(['ID' => $automat_id, 'post_author' => $user_id]);

    // Passwort zurücksetzen und E-Mail senden
    $password = wp_generate_password(10, false);
    wp_set_password($password, $user_id);

    wp_mail($email,
        '✅ Ihre Vendorama-Betreiber-Zugangsdaten',
        "Hallo $name,\n\nIhre Anfrage wurde genehmigt!\n\nLogin: " . wp_login_url() . "\nE-Mail: $email\nPasswort: $password\n\nMit freundlichen Grüßen\nDas Vendorama-Team"
    );

    // Claim als erledigt markieren
    update_post_meta($claim_id, '_claim_status', 'genehmigt');

    return wp_send_json_success('Betreiber genehmigt');
}
// Claim ablehnen
function vendorama_admin_claim_ablehnen(WP_REST_Request $request) {
    $claim_id = intval($request->get_param('claim_id'));
    if (!$claim_id) return wp_send_json_error('Keine Claim-ID');

    $email = get_post_meta($claim_id, '_claim_email', true);
    $name  = get_post_meta($claim_id, '_claim_name', true);

    if (!$email) return wp_send_json_error('E-Mail fehlt');

    // Status auf abgelehnt setzen
    update_post_meta($claim_id, '_claim_status', 'abgelehnt');

    // Ablehnungs-E-Mail an Antragsteller
    wp_mail(
        $email,
        'Ihre Vendorama Claim-Anfrage',
        "Hallo $name,\n\n" .
        "leider konnten wir Ihre Anfrage nicht genehmigen.\n\n" .
        "Bei Fragen wenden Sie sich an: ralf@bolleininger.de\n\n" .
        "Mit freundlichen Grüßen\n" .
        "Das Vendorama-Team",
        ['Content-Type: text/plain; charset=UTF-8']
    );

    return wp_send_json_success('Claim abgelehnt');
}
