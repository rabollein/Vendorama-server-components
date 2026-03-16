<?php
add_action('wp_enqueue_scripts', 'blocksy_child_enqueue_styles');
function blocksy_child_enqueue_styles() {
    wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');
}
// Vendorama Single-Automat Template
add_filter('template_include', function($template) {
    if (is_singular('automat')) {
        $custom = get_stylesheet_directory() . '/single-automat.php';
        if (file_exists($custom)) return $custom;
    }
    return $template;
});
// Footer Copyright Text ersetzen
add_filter('blocksy:footer:copyright-text', function($text) {
    return '© ' . date('Y') . ' Vendorama – Alle Rechte vorbehalten';
});
// E-Mail Absender anpassen
add_filter('wp_mail_from_name', function($name) {
    return 'Vendorama';
});
add_filter('wp_mail_from', function($email) {
    return 'noreply@vendorama.eu';
});
// Application Passwords für Admin App erlauben
add_filter('wp_is_application_passwords_available', '__return_true');
