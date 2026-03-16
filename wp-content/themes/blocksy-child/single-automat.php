<?php
/**
 * Template für einzelne Automaten-Detailseite
 */

get_header();

while (have_posts()) :
    the_post();
    $post_id = get_the_ID();

    // ACF Felder
    $kategorien       = (array)(get_field('kategorie', $post_id) ?: ['sonstiges']);
    $zahlungsarten    = get_field('zahlungsarten', $post_id) ?: [];
    $lat              = get_field('gps_lat', $post_id);
    $lng              = get_field('gps_lng', $post_id);
    $oeffnungszeiten  = get_field('oeffnungszeiten', $post_id) ?: '';
    $beschreibung     = get_field('standort_beschreibung', $post_id) ?: '';
    $beschreibung_lang = get_field('beschreibung_lang', $post_id) ?: '';
    $verifiziert      = get_field('verifiziert', $post_id);
    $foto             = get_field('foto', $post_id);

    // Kategorie Labels & Icons
    $kategorie_config = [
        'zigaretten'     => ['icon' => '🚬', 'label' => 'Zigaretten'],
        'vapes'          => ['icon' => '💨', 'label' => 'Vapes'],
        'snacks'         => ['icon' => '🍬', 'label' => 'Snacks'],
        'getraenke'      => ['icon' => '🥤', 'label' => 'Getränke'],
        'frischprodukte' => ['icon' => '🥚', 'label' => 'Frischprodukte'],
        'backwaren'      => ['icon' => '🥐', 'label' => 'Backwaren'],
        'blumen'         => ['icon' => '🌸', 'label' => 'Blumen'],
        'pakete'         => ['icon' => '📦', 'label' => 'Pakete'],
        'geldautomat'    => ['icon' => '💶', 'label' => 'Geldautomat'],
        'tankautomat'    => ['icon' => '⛽', 'label' => 'Tankautomat'],
        'fahrrad'        => ['icon' => '🚲', 'label' => 'Fahrrad'],
        'sonstiges'      => ['icon' => '🤖', 'label' => 'Sonstiges'],
    ];

    $zahlung_labels = [
        'bargeld'     => '💵 Bargeld',
        'ec_karte'    => '💳 EC-Karte',
        'kreditkarte' => '💳 Kreditkarte',
        'app'         => '📱 App/QR',
        'kostenlos'   => '🆓 Kostenlos',
    ];

    $foto_url = '';
    if ($foto && is_array($foto)) {
        $foto_url = $foto['url'];
    } elseif ($foto && is_string($foto)) {
        $foto_url = $foto;
    }
?>

<style>
.automat-detail {
    max-width: 900px;
    margin: 0 auto;
    padding: 32px 16px 64px;
}
.automat-detail-hero {
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 32px;
    position: relative;
    background: linear-gradient(135deg, #1A6B3C, #145231);
    min-height: 260px;
    display: flex;
    align-items: flex-end;
}
.automat-detail-hero img {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    opacity: 0.6;
}
.automat-detail-hero-content {
    position: relative;
    z-index: 1;
    padding: 32px;
    width: 100%;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
}
.automat-detail-hero-content h1 {
    color: white;
    font-size: clamp(22px, 4vw, 36px);
    font-weight: 800;
    margin: 0 0 12px;
}
.automat-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
}
.automat-badge {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
}
.automat-badge.verifiziert {
    background: #1A6B3C;
    border-color: #1A6B3C;
}
.automat-detail-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 24px;
}
@media (max-width: 700px) {
    .automat-detail-grid { grid-template-columns: 1fr; }
}
.automat-card-box {
    background: white;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid #e5e7eb;
    margin-bottom: 24px;
}
.automat-card-box h2 {
    font-size: 16px;
    font-weight: 700;
    color: #1A6B3C;
    margin: 0 0 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e8f5ee;
}
.automat-info-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
    font-size: 14px;
}
.automat-info-row:last-child { border-bottom: none; }
.automat-info-icon { font-size: 16px; min-width: 24px; }
.automat-info-label { color: #6b7280; min-width: 120px; font-size: 13px; }
.automat-info-value { color: #1a1a1a; font-weight: 500; }
.automat-beschreibung-lang {
    line-height: 1.8;
    color: #374151;
    font-size: 15px;
}
.automat-beschreibung-lang h2,
.automat-beschreibung-lang h3 {
    color: #1A6B3C;
    margin-top: 24px;
}
.automat-nav-btn {
    display: block;
    width: 100%;
    background: #1A6B3C;
    color: white;
    text-align: center;
    padding: 14px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 15px;
    text-decoration: none;
    transition: background 0.2s;
    margin-bottom: 12px;
}
.automat-nav-btn:hover {
    background: #145231;
    color: white;
    text-decoration: none;
}
.automat-map-container {
    border-radius: 12px;
    overflow: hidden;
    height: 200px;
    margin-bottom: 16px;
}
.automat-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #1A6B3C;
    font-weight: 600;
    font-size: 14px;
    text-decoration: none;
    margin-bottom: 24px;
}
.automat-back:hover { text-decoration: underline; color: #1A6B3C; }
.zahlung-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}
.zahlung-chip {
    background: #e8f5ee;
    color: #1A6B3C;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
}
.claim-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    box-sizing: border-box;
    margin-bottom: 8px;
    font-family: inherit;
    transition: border-color 0.2s;
}
.claim-input:focus {
    border-color: #1A6B3C;
    outline: none;
    box-shadow: 0 0 0 3px rgba(26,107,60,0.1);
}
.claim-btn {
    display: block;
    width: 100%;
    background: #F5A623;
    color: #1a1a1a;
    padding: 12px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 14px;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
}
.claim-btn:hover { background: #e09520; }
.claim-btn:disabled { opacity: 0.7; cursor: not-allowed; }
</style>

<div class="automat-detail">

    <a href="/" class="automat-back">← Zurück zur Übersicht</a>

    <!-- Hero -->
    <div class="automat-detail-hero">
        <?php if ($foto_url): ?>
            <img src="<?php echo esc_url($foto_url); ?>" alt="<?php the_title(); ?>">
        <?php endif; ?>
        <div class="automat-detail-hero-content">
            <div class="automat-badges">
                <?php foreach ($kategorien as $kat):
                    $cfg = $kategorie_config[$kat] ?? ['icon' => '🤖', 'label' => ucfirst($kat)];
                ?>
                    <span class="automat-badge"><?php echo $cfg['icon'] . ' ' . $cfg['label']; ?></span>
                <?php endforeach; ?>
                <?php if ($verifiziert): ?>
                    <span class="automat-badge verifiziert">✅ Verifiziert</span>
                <?php endif; ?>
            </div>
            <h1><?php the_title(); ?></h1>
        </div>
    </div>

    <div class="automat-detail-grid">

        <!-- Links: Infos + Beschreibung -->
        <div>
            <div class="automat-card-box">
                <h2>📋 Informationen</h2>
                <?php if ($oeffnungszeiten): ?>
                <div class="automat-info-row">
                    <span class="automat-info-icon">🕐</span>
                    <span class="automat-info-label">Öffnungszeiten</span>
                    <span class="automat-info-value"><?php echo esc_html($oeffnungszeiten); ?></span>
                </div>
                <?php endif; ?>
                <?php if ($beschreibung): ?>
                <div class="automat-info-row">
                    <span class="automat-info-icon">📍</span>
                    <span class="automat-info-label">Standort</span>
                    <span class="automat-info-value"><?php echo esc_html($beschreibung); ?></span>
                </div>
                <?php endif; ?>
                <?php if ($lat && $lng): ?>
                <div class="automat-info-row">
                    <span class="automat-info-icon">🗺️</span>
                    <span class="automat-info-label">GPS</span>
                    <span class="automat-info-value"><?php echo round($lat, 5) . ', ' . round($lng, 5); ?></span>
                </div>
                <?php endif; ?>
                <?php if (!empty($zahlungsarten)): ?>
                <div class="automat-info-row" style="flex-direction:column; align-items:flex-start;">
                    <div style="display:flex;gap:10px;margin-bottom:8px;">
                        <span class="automat-info-icon">💳</span>
                        <span class="automat-info-label">Zahlungsarten</span>
                    </div>
                    <div class="zahlung-chips">
                        <?php
                        $zahlung_arr = is_array($zahlungsarten) ? $zahlungsarten : explode(',', $zahlungsarten);
                        foreach ($zahlung_arr as $z):
                            $z = trim($z);
                            $label = $zahlung_labels[$z] ?? $z;
                        ?>
                            <span class="zahlung-chip"><?php echo esc_html($label); ?></span>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endif; ?>
            </div>

            <?php if ($beschreibung_lang): ?>
            <div class="automat-card-box">
                <h2>📄 Beschreibung</h2>
                <div class="automat-beschreibung-lang">
                    <?php echo wp_kses_post($beschreibung_lang); ?>
                </div>
            </div>
            <?php endif; ?>
        </div>

        <!-- Rechts: Karte + Navigation + Betreiber -->
        <div>
            <?php if ($lat && $lng): ?>
            <div class="automat-card-box">
                <h2>🗺️ Standort</h2>
                <div class="automat-map-container">
                    <iframe
                        width="100%" height="200"
                        frameborder="0" scrolling="no"
                        src="https://www.openstreetmap.org/export/embed.html?bbox=<?php echo ($lng-0.003) . ',' . ($lat-0.002) . ',' . ($lng+0.003) . ',' . ($lat+0.002); ?>&layer=mapnik&marker=<?php echo $lat . ',' . $lng; ?>"
                        style="border:none;">
                    </iframe>
                </div>
                <a href="google.navigation:q=<?php echo $lat . ',' . $lng; ?>&mode=w"
                   onclick="if(!navigator.userAgent.match(/Android/i)){this.href='https://www.google.com/maps/dir/?api=1&destination=<?php echo $lat . ',' . $lng; ?>';}"
                   class="automat-nav-btn">
                    🧭 Navigation starten
                </a>
                <a href="https://www.openstreetmap.org/?mlat=<?php echo $lat; ?>&mlon=<?php echo $lng; ?>#map=17/<?php echo $lat; ?>/<?php echo $lng; ?>"
                   target="_blank"
                   style="display:block;text-align:center;font-size:13px;color:#6b7280;text-decoration:none;">
                    In OpenStreetMap öffnen ↗
                </a>
            </div>
            <?php endif; ?>

            <!-- Betreiber-Box mit Formular -->
            <div class="automat-card-box">
                <h2>✏️ Das ist mein Automat</h2>
                <p style="font-size:14px;color:#6b7280;margin-bottom:16px;">
                    Ist das Ihr Automat? Übernehmen Sie diesen Eintrag und pflegen Sie Ihre Inhalte selbst!
                </p>

                <div id="claim-formular-<?php echo $post_id; ?>">
                    <input type="text" class="claim-input" id="claim-name-<?php echo $post_id; ?>" placeholder="Ihr Name *">
                    <input type="text" class="claim-input" id="claim-firma-<?php echo $post_id; ?>" placeholder="Firma / Unternehmen">
                    <input type="email" class="claim-input" id="claim-email-<?php echo $post_id; ?>" placeholder="E-Mail Adresse *">
                    <input type="tel" class="claim-input" id="claim-telefon-<?php echo $post_id; ?>" placeholder="Telefon">
                    <textarea class="claim-input" id="claim-nachricht-<?php echo $post_id; ?>" placeholder="Optionale Nachricht..." style="height:80px;resize:vertical;"></textarea>
                    <div id="claim-fehler-<?php echo $post_id; ?>" style="display:none;color:#ef4444;font-size:13px;margin-bottom:8px;"></div>
                    <button class="claim-btn" id="claim-btn-<?php echo $post_id; ?>"
                        onclick="vendoramaClaimAbsenden(<?php echo $post_id; ?>)">
                        📩 Bearbeitungsanfrage senden
                    </button>
                </div>

                <div id="claim-erfolg-<?php echo $post_id; ?>" style="display:none;text-align:center;padding:16px;background:#e8f5ee;border-radius:12px;">
                    <div style="font-size:32px;margin-bottom:8px;">✅</div>
                    <div style="font-weight:700;color:#1A6B3C;margin-bottom:4px;">Anfrage gesendet!</div>
                    <div style="font-size:13px;color:#6b7280;">Wir melden uns in Kürze bei Ihnen.</div>
                </div>
            </div>
        </div>

    </div>
</div>

<script>
function vendoramaClaimAbsenden(automatId) {
    var name      = document.getElementById('claim-name-' + automatId).value.trim();
    var firma     = document.getElementById('claim-firma-' + automatId).value.trim();
    var email     = document.getElementById('claim-email-' + automatId).value.trim();
    var telefon   = document.getElementById('claim-telefon-' + automatId).value.trim();
    var nachricht = document.getElementById('claim-nachricht-' + automatId).value.trim();
    var fehlerDiv = document.getElementById('claim-fehler-' + automatId);
    var btn       = document.getElementById('claim-btn-' + automatId);

    fehlerDiv.style.display = 'none';

    if (!name || !email) {
        fehlerDiv.textContent = 'Bitte Name und E-Mail ausfüllen.';
        fehlerDiv.style.display = 'block';
        return;
    }

    btn.textContent = '⏳ Wird gesendet...';
    btn.disabled = true;

    var formData = new FormData();
    formData.append('action', 'vendorama_claim_submit');
    formData.append('nonce', vendoramaClaim.nonce);
    formData.append('automat_id', automatId);
    formData.append('name', name);
    formData.append('firma', firma);
    formData.append('email', email);
    formData.append('telefon', telefon);
    formData.append('nachricht', nachricht);

    fetch(vendoramaClaim.ajaxurl, {
        method: 'POST',
        body: formData
    })
    .then(function(r) { return r.json(); })
    .then(function(res) {
        if (res.success) {
            document.getElementById('claim-formular-' + automatId).style.display = 'none';
            document.getElementById('claim-erfolg-' + automatId).style.display = 'block';
        } else {
            fehlerDiv.textContent = res.data || 'Fehler beim Senden.';
            fehlerDiv.style.display = 'block';
            btn.textContent = '📩 Bearbeitungsanfrage senden';
            btn.disabled = false;
        }
    })
    .catch(function() {
        fehlerDiv.textContent = 'Verbindungsfehler. Bitte nochmal versuchen.';
        fehlerDiv.style.display = 'block';
        btn.textContent = '📩 Bearbeitungsanfrage senden';
        btn.disabled = false;
    });
}
</script>

<?php
endwhile;
get_footer();
?>
