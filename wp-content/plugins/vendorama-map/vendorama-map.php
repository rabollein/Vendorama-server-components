<?php
/**
 * Plugin Name: Vendorama Karte
 * Plugin URI:  https://www.vendorama.eu
 * Description: Eigene Leaflet Karte mit Hover-Effekt, Live-Filter und kategorie-spezifischen Markern.
 * Version:     1.0.0
 * Author:      Vendorama
 * License:     GPL2
 */

defined('ABSPATH') or die('Kein direkter Zugriff!');

// -------------------------------------------------------
// Assets laden
// -------------------------------------------------------
add_action('wp_enqueue_scripts', 'vendorama_map_assets');

function vendorama_map_assets() {
    wp_enqueue_style('vendorama-map-css', plugin_dir_url(__FILE__) . 'vendorama-map.css', ['leaflet-css'], '1.0.1');
    wp_enqueue_script('vendorama-map-js', plugin_dir_url(__FILE__) . 'vendorama-map.js', ['leaflet-js', 'jquery'], '1.0.1', true);
    wp_enqueue_style('vendorama-map-css', plugin_dir_url(__FILE__) . 'vendorama-map.css', ['leaflet-css'], '1.0.0');
    wp_enqueue_script('vendorama-map-js', plugin_dir_url(__FILE__) . 'vendorama-map.js', ['leaflet-js', 'jquery'], '1.0.0', true);

    // Alle Automaten-Daten an JS uebergeben
    $automaten = get_posts(['post_type' => 'automat', 'post_status' => 'publish', 'posts_per_page' => -1]);
    $data = [];
    foreach ($automaten as $a) {
        $lat = floatval(get_field('gps_lat', $a->ID));
        $lng = floatval(get_field('gps_lng', $a->ID));
        if (!$lat || !$lng) continue;

        $sum    = floatval(get_post_meta($a->ID, 'bewertung_summe', true));
        $anzahl = intval(get_post_meta($a->ID, 'bewertung_anzahl', true));
        $schnitt = $anzahl > 0 ? round($sum / $anzahl, 1) : 0;

        $foto = get_field('foto', $a->ID);
        $foto_url = '';
        if ($foto) {
            $foto_url = is_array($foto) ? ($foto['sizes']['thumbnail'] ?? $foto['url']) : $foto;
        }

        $zahlung = get_field('zahlungsarten', $a->ID);

        $data[] = [
            'id'          => $a->ID,
            'titel'       => $a->post_title,
            'kategorie'   => get_field('kategorie', $a->ID),
            'zahlung'     => is_array($zahlung) ? implode(', ', $zahlung) : ($zahlung ?? ''),
            'oeffnung'    => get_field('oeffnungszeiten', $a->ID),
            'beschreibung'=> get_field('standort_beschreibung', $a->ID),
            'verifiziert' => (bool) get_field('verifiziert', $a->ID),
            'bewertung'   => $schnitt,
            'anzahl'      => $anzahl,
            'foto'        => $foto_url,
            'lat'         => $lat,
            'lng'         => $lng,
        ];
    }

    wp_localize_script('vendorama-map-js', 'vendoramaMapData', [
        'automaten' => $data,
        'ajaxurl'   => admin_url('admin-ajax.php'),
        'nonce'     => wp_create_nonce('vendorama_search_nonce'),
    ]);
}

// -------------------------------------------------------
// Shortcode [vendorama_karte]
// -------------------------------------------------------
add_shortcode('vendorama_karte', 'vendorama_map_shortcode');

function vendorama_map_shortcode($atts) {
    $atts = shortcode_atts(['hoehe' => '500px'], $atts);
    return '<div id="vendorama-leaflet-map" style="height:' . esc_attr($atts['hoehe']) . ';width:100%;border-radius:12px;overflow:hidden;"></div>';
}
