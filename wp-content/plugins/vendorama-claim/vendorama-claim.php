<?php
/**
 * Plugin Name: Vendorama Claim
 * Description: Automaten-Eintrag beanspruchen – Formular, E-Mail-Benachrichtigung und Benutzer-Verwaltung.
 * Version:     1.0.0
 * Author:      Vendorama
 */

defined('ABSPATH') or die('Kein direkter Zugriff!');

// -------------------------------------------------------
// Custom Post Type: Claim-Anfragen
// -------------------------------------------------------
add_action('init', function() {
    register_post_type('vendorama_claim', [
        'label'         => 'Claim-Anfragen',
        'public'        => false,
        'show_ui'       => true,
        'show_in_menu'  => true,
        'menu_icon'     => 'dashicons-businessman',
        'supports'      => ['title'],
        'labels'        => [
            'name'          => 'Claim-Anfragen',
            'singular_name' => 'Claim-Anfrage',
            'menu_name'     => 'Claim-Anfragen',
            'all_items'     => 'Alle Anfragen',
            'edit_item'     => 'Anfrage bearbeiten',
        ],
    ]);
});

// -------------------------------------------------------
// Admin-Spalten für Claim-Anfragen
// -------------------------------------------------------
add_filter('manage_vendorama_claim_posts_columns', function($cols) {
    return [
        'cb'        => $cols['cb'],
        'title'     => 'Automat',
        'name'      => 'Name',
        'firma'     => 'Firma',
        'email'     => 'E-Mail',
        'telefon'   => 'Telefon',
        'status'    => 'Status',
        'date'      => 'Datum',
        'aktionen'  => 'Aktionen',
    ];
});

add_action('manage_vendorama_claim_posts_custom_column', function($col, $post_id) {
    switch ($col) {
        case 'name':    echo esc_html(get_post_meta($post_id, '_claim_name', true)); break;
        case 'firma':   echo esc_html(get_post_meta($post_id, '_claim_firma', true)); break;
        case 'email':   echo '<a href="mailto:' . esc_attr(get_post_meta($post_id, '_claim_email', true)) . '">' . esc_html(get_post_meta($post_id, '_claim_email', true)) . '</a>'; break;
        case 'telefon': echo esc_html(get_post_meta($post_id, '_claim_telefon', true)); break;
        case 'status':
            $status = get_post_meta($post_id, '_claim_status', true) ?: 'ausstehend';
            $farben = ['ausstehend' => '#f59e0b', 'genehmigt' => '#10b981', 'abgelehnt' => '#ef4444'];
            echo '<span style="color:' . ($farben[$status] ?? '#666') . ';font-weight:bold;">' . ucfirst($status) . '</span>';
            break;
        case 'aktionen':
            $status = get_post_meta($post_id, '_claim_status', true) ?: 'ausstehend';
            if ($status === 'ausstehend') {
                $genehmigen_url = wp_nonce_url(admin_url('admin-post.php?action=vendorama_claim_genehmigen&claim_id=' . $post_id), 'claim_genehmigen_' . $post_id);
                $ablehnen_url   = wp_nonce_url(admin_url('admin-post.php?action=vendorama_claim_ablehnen&claim_id=' . $post_id), 'claim_ablehnen_' . $post_id);
                echo '<a href="' . $genehmigen_url . '" style="color:#10b981;font-weight:bold;margin-right:8px;">✅ Genehmigen</a>';
                echo '<a href="' . $ablehnen_url . '" style="color:#ef4444;font-weight:bold;">❌ Ablehnen</a>';
            }
            break;
    }
}, 10, 2);

// -------------------------------------------------------
// AJAX: Claim-Formular absenden
// -------------------------------------------------------
add_action('wp_ajax_vendorama_claim_submit', 'vendorama_claim_submit');
add_action('wp_ajax_nopriv_vendorama_claim_submit', 'vendorama_claim_submit');

function vendorama_claim_submit() {
    check_ajax_referer('vendorama_claim_nonce', 'nonce');

    $automat_id = intval($_POST['automat_id'] ?? 0);
    $name       = sanitize_text_field($_POST['name'] ?? '');
    $firma      = sanitize_text_field($_POST['firma'] ?? '');
    $email      = sanitize_email($_POST['email'] ?? '');
    $telefon    = sanitize_text_field($_POST['telefon'] ?? '');
    $nachricht  = sanitize_textarea_field($_POST['nachricht'] ?? '');

    if (!$automat_id || !$name || !$email) {
        wp_send_json_error('Bitte alle Pflichtfelder ausfüllen.');
    }

    if (!is_email($email)) {
        wp_send_json_error('Bitte eine gültige E-Mail-Adresse eingeben.');
    }

    $automat_titel = get_the_title($automat_id);

    // Claim-Anfrage als Custom Post speichern
    $claim_id = wp_insert_post([
        'post_type'   => 'vendorama_claim',
        'post_title'  => 'Claim: ' . $automat_titel,
        'post_status' => 'publish',
    ]);

    if (!$claim_id) {
        wp_send_json_error('Fehler beim Speichern der Anfrage.');
    }

    update_post_meta($claim_id, '_claim_automat_id', $automat_id);
    update_post_meta($claim_id, '_claim_name',    $name);
    update_post_meta($claim_id, '_claim_firma',   $firma);
    update_post_meta($claim_id, '_claim_email',   $email);
    update_post_meta($claim_id, '_claim_telefon', $telefon);
    update_post_meta($claim_id, '_claim_nachricht', $nachricht);
    update_post_meta($claim_id, '_claim_status',  'ausstehend');

    // E-Mail an Admin
    $admin_url = admin_url('edit.php?post_type=vendorama_claim');
    $genehmigen_url = wp_nonce_url(admin_url('admin-post.php?action=vendorama_claim_genehmigen&claim_id=' . $claim_id), 'claim_genehmigen_' . $claim_id);

// WordPress auf Plain Text zwingen
    add_filter('wp_mail_content_type', function() { return 'text/plain'; });

    wp_mail(
        $email,
        '✅ Ihre Anfrage bei Vendorama wurde erhalten',
        "Hallo " . $name . ",\n\n" .
        "vielen Dank für Ihre Anfrage! Wir haben Ihre Anfrage für den Automaten\n" .
        '"' . $automat_titel . '" erhalten.' . "\n\n" .
        "Wir prüfen Ihre Anfrage und melden uns in Kürze bei Ihnen.\n\n" .
        "Mit freundlichen Grüßen\n" .
        "Das Vendorama-Team\n" .
        "https://www.vendorama.eu",
        ['Content-Type: text/plain; charset=UTF-8']
    );

    // Filter wieder entfernen damit andere Mails nicht betroffen sind
    remove_all_filters('wp_mail_content_type');

    // Bestätigungs-E-Mail an Betreiber
    wp_mail(
        $email,
        '✅ Ihre Anfrage bei Vendorama wurde erhalten',
        "Hallo " . $name . ",\n\n" .
        "vielen Dank für Ihre Anfrage! Wir haben Ihre Anfrage für den Automaten\n" .
        '"' . $automat_titel . '" erhalten.\n\n' .
        "Wir prüfen Ihre Anfrage und melden uns in Kürze bei Ihnen.\n\n" .
        "Mit freundlichen Grüßen\n" .
        "Das Vendorama-Team\n" .
        "https://www.vendorama.eu",
        ['Content-Type: text/plain; charset=UTF-8']
    );

    wp_send_json_success('Anfrage erfolgreich gesendet!');
}

// -------------------------------------------------------
// Admin-Aktion: Claim genehmigen
// -------------------------------------------------------
add_action('admin_post_vendorama_claim_genehmigen', function() {
    $claim_id = intval($_GET['claim_id'] ?? 0);
    check_admin_referer('claim_genehmigen_' . $claim_id);

    $email      = get_post_meta($claim_id, '_claim_email', true);
    $name       = get_post_meta($claim_id, '_claim_name', true);
    $automat_id = intval(get_post_meta($claim_id, '_claim_automat_id', true));

    // WordPress-Benutzer anlegen oder vorhandenen nutzen
    $user_id = get_user_by('email', $email);

    if (!$user_id) {
        $passwort = wp_generate_password(12, false);
        $user_id  = wp_create_user(sanitize_user($email), $passwort, $email);

        if (is_wp_error($user_id)) {
            wp_die('Fehler beim Anlegen des Benutzers: ' . $user_id->get_error_message());
        }

        // Benutzer-Name setzen
        wp_update_user([
            'ID'           => $user_id,
            'display_name' => $name,
            'role'         => 'vendorama_betreiber',
        ]);

        // Passwort per E-Mail senden
        wp_mail(
            $email,
            '🎉 Ihr Vendorama-Zugang wurde freigeschaltet!',
            "Hallo " . $name . ",\n\n" .
            "Ihre Claim-Anfrage wurde genehmigt! Sie können sich jetzt einloggen und Ihren Automaten-Eintrag bearbeiten.\n\n" .
            "Login: " . wp_login_url() . "\n" .
            "E-Mail: " . $email . "\n" .
            "Passwort: " . $passwort . "\n\n" .
            "Bitte ändern Sie Ihr Passwort nach dem ersten Login.\n\n" .
            "Mit freundlichen Grüßen\n" .
            "Das Vendorama-Team",
            ['Content-Type: text/plain; charset=UTF-8']
        );
    } else {
        $user_id = $user_id->ID;
        wp_update_user(['ID' => $user_id, 'role' => 'vendorama_betreiber']);
    }

    // Automat dem Betreiber zuweisen
    wp_update_post(['ID' => $automat_id, 'post_author' => $user_id]);
    update_post_meta($claim_id, '_claim_status', 'genehmigt');

    wp_redirect(admin_url('edit.php?post_type=vendorama_claim&genehmigt=1'));
    exit;
});

// -------------------------------------------------------
// Admin-Aktion: Claim ablehnen
// -------------------------------------------------------
add_action('admin_post_vendorama_claim_ablehnen', function() {
    $claim_id = intval($_GET['claim_id'] ?? 0);
    check_admin_referer('claim_ablehnen_' . $claim_id);

    $email = get_post_meta($claim_id, '_claim_email', true);
    $name  = get_post_meta($claim_id, '_claim_name', true);

    update_post_meta($claim_id, '_claim_status', 'abgelehnt');

    wp_mail(
        $email,
        'Ihre Vendorama Claim-Anfrage',
        "Hallo " . $name . ",\n\n" .
        "leider konnten wir Ihre Anfrage nicht genehmigen.\n\n" .
        "Bei Fragen wenden Sie sich an: ralf@bolleininger.de\n\n" .
        "Mit freundlichen Grüßen\n" .
        "Das Vendorama-Team",
        ['Content-Type: text/plain; charset=UTF-8']
    );

    wp_redirect(admin_url('edit.php?post_type=vendorama_claim&abgelehnt=1'));
    exit;
});

// -------------------------------------------------------
// Betreiber-Rolle registrieren
// -------------------------------------------------------
add_action('init', function() {
    if (!get_role('vendorama_betreiber')) {
        add_role('vendorama_betreiber', 'Automaten-Betreiber', [
            'read'         => true,
            'edit_posts'   => true,
            'upload_files' => true,
        ]);
    }
});

// -------------------------------------------------------
// Betreiber darf nur eigene Automaten bearbeiten
// -------------------------------------------------------
add_filter('user_has_cap', function($caps, $cap, $args) {
    if (!isset($args[2])) return $caps;
    $user = wp_get_current_user();
    if (!in_array('vendorama_betreiber', $user->roles)) return $caps;

    $post_id = $args[2];
    if (get_post_type($post_id) === 'automat') {
        $post = get_post($post_id);
        if ($post && $post->post_author != $user->ID) {
            $caps['edit_post']   = false;
            $caps['delete_post'] = false;
        }
    }
    return $caps;
}, 10, 3);

// -------------------------------------------------------
// Scripts für Claim-Formular
// -------------------------------------------------------
add_action('wp_footer', function() {
    if (is_singular('automat')) {
        echo '<script>var vendoramaClaim = { ajaxurl: "' . admin_url('admin-ajax.php') . '", nonce: "' . wp_create_nonce('vendorama_claim_nonce') . '" };</script>';
    }
});
