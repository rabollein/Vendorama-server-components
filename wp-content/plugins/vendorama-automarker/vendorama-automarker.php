<?php
/**
 * Plugin Name: Vendorama Auto Marker
 * Plugin URI:  https://www.vendorama.eu
 * Description: Erstellt automatisch WP Go Maps Marker wenn ein Automat gespeichert wird.
 * Version:     1.1.0
 * Author:      Vendorama
 * License:     GPL2
 */

defined('ABSPATH') or die('Kein direkter Zugriff!');

define('VENDORAMA_MAP_ID', 1);

add_action('save_post', 'vendorama_sync_marker', 10, 2);

function vendorama_sync_marker($post_id, $post) {

    if ($post->post_type !== 'automat') return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if ($post->post_status === 'auto-draft') return;

    $lat = get_field('gps_lat', $post_id);
    $lng = get_field('gps_lng', $post_id);

    if (empty($lat) || empty($lng)) return;

    $kategorie    = get_field('kategorie', $post_id);
    $zahlung      = get_field('zahlungsarten', $post_id);
    $beschreibung = get_field('standort_beschreibung', $post_id);
    $oeffnung     = get_field('oeffnungszeiten', $post_id);

    $zahlung_text = '';
    if (is_array($zahlung)) {
        $zahlung_text = implode(', ', $zahlung);
    }

    $popup  = '<strong>' . esc_html($post->post_title) . '</strong><br>';
    $popup .= 'Kategorie: ' . esc_html($kategorie) . '<br>';
    if (!empty($zahlung_text)) {
        $popup .= 'Zahlung: ' . esc_html($zahlung_text) . '<br>';
    }
    if (!empty($oeffnung)) {
        $popup .= 'Oeffnung: ' . esc_html($oeffnung) . '<br>';
    }
    if (!empty($beschreibung)) {
        $popup .= 'Standort: ' . esc_html($beschreibung);
    }

    $marker_description = $popup . '<!-- post_id:' . $post_id . ' -->';

    global $wpdb;
    $table = $wpdb->prefix . 'wpgmza';

    $existing = $wpdb->get_var($wpdb->prepare(
        "SELECT id FROM $table WHERE description LIKE %s AND map_id = %d",
        '%post_id:' . $post_id . '%',
        VENDORAMA_MAP_ID
    ));

    if ($existing) {
        $wpdb->query($wpdb->prepare(
            "UPDATE $table SET lat = %s, lng = %s, title = %s, description = %s, latlng = POINT(%s, %s) WHERE id = %d",
            $lat, $lng, $post->post_title, $marker_description, $lng, $lat, $existing
        ));
    } else {
        $wpdb->query($wpdb->prepare(
            "INSERT INTO $table (map_id, lat, lng, title, description, approved, latlng) VALUES (%d, %s, %s, %s, %s, 1, POINT(%s, %s))",
            VENDORAMA_MAP_ID, $lat, $lng, $post->post_title, $marker_description, $lng, $lat
        ));
    }
}

add_action('before_delete_post', 'vendorama_delete_marker');

function vendorama_delete_marker($post_id) {
    if (get_post_type($post_id) !== 'automat') return;

    global $wpdb;
    $table = $wpdb->prefix . 'wpgmza';

    $wpdb->query($wpdb->prepare(
        "DELETE FROM $table WHERE description LIKE %s AND map_id = %d",
        '%post_id:' . $post_id . '%',
        VENDORAMA_MAP_ID
    ));
}

add_action('admin_notices', 'vendorama_missing_gps_notice');

function vendorama_missing_gps_notice() {
    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'automat') return;

    global $post;
    if (!$post) return;

    $lat = get_field('gps_lat', $post->ID);
    $lng = get_field('gps_lng', $post->ID);

    if (empty($lat) || empty($lng)) {
        echo '<div class="notice notice-warning"><p>';
        echo '<strong>Vendorama:</strong> GPS-Koordinaten fehlen - dieser Automat wird nicht auf der Karte angezeigt!';
        echo '</p></div>';
    }
}
