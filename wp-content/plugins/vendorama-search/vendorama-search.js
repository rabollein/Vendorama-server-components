jQuery(document).ready(function($) {

    var userLat = 0;
    var userLng = 0;
    var gewaehltesSterne = 0;

    var kategorieIcons = {
        zigaretten:    '🚬',
        vapes:         '💨',
        snacks:        '🍬',
        getraenke:     '🥤',
        frischprodukte:'🥚',
        backwaren:     '🥐',
        blumen:        '🌸',
        pakete:        '📦',
        geldautomat:   '💶',
        tankautomat:   '⛽',
        fahrrad:       '🚲',
        sonstiges:     '🤖'
    };

    var kategorieLabels = {
        zigaretten:    'Zigaretten',
        vapes:         'Vapes',
        snacks:        'Snacks',
        getraenke:     'Getränke',
        frischprodukte:'Frischprodukte',
        backwaren:     'Backwaren',
        blumen:        'Blumen',
        pakete:        'Pakete',
        geldautomat:   'Geldautomat',
        tankautomat:   'Tankautomat',
        fahrrad:       'Fahrrad',
        sonstiges:     'Sonstiges'
    };

    var zahlungLabels = {
        bargeld:     'Bargeld',
        ec_karte:    'EC-Karte',
        kreditkarte: 'Kreditkarte',
        app:         'App/QR',
        kostenlos:   'Kostenlos'
    };

    // ── Kategorie Chips Logik ──
    $(document).on('click', '.vs-chip', function(e) {
        e.preventDefault();
        var value = $(this).data('value');

        if (value === '') {
            // "Alle" geklickt – alle anderen deaktivieren
            $('.vs-chip').removeClass('aktiv');
            $('.vs-chip input').prop('checked', false);
            $(this).addClass('aktiv');
            $(this).find('input').prop('checked', true);
        } else {
            // Spezifische Kategorie – "Alle" deaktivieren
            $('.vs-chip[data-value=""]').removeClass('aktiv');
            $('.vs-chip[data-value=""] input').prop('checked', false);
            $(this).toggleClass('aktiv');
            $(this).find('input').prop('checked', $(this).hasClass('aktiv'));

            // Wenn keine Kategorie aktiv – "Alle" wieder aktivieren
            if ($('.vs-chip.aktiv').length === 0) {
                $('.vs-chip[data-value=""]').addClass('aktiv');
                $('.vs-chip[data-value=""] input').prop('checked', true);
            }
        }
    });

    // GPS-Standort Button
    $('#vs-gps-btn').on('click', function() {
        if (!navigator.geolocation) {
            alert('GPS wird von diesem Browser nicht unterstützt.');
            return;
        }
        $(this).text('⏳ Ortung...');
        var btn = $(this);
        navigator.geolocation.getCurrentPosition(function(pos) {
            userLat = pos.coords.latitude;
            userLng = pos.coords.longitude;
            $('#vs-ort').val('Mein Standort');
            btn.text('✅ Gefunden');
            setTimeout(function() { btn.text('📡 Mein Standort'); }, 2000);
        }, function() {
            alert('Standort konnte nicht ermittelt werden.');
            btn.text('📡 Mein Standort');
        });
    });

    // Suche ausfuehren
    $('#vs-suchen').on('click', function() {
        var ort         = $('#vs-ort').val().trim();
        var umkreis     = $('#vs-umkreis').val();
        var zahlung     = $('#vs-zahlung').val();
        var nur24h      = $('#vs-24h').is(':checked');
        var verifiziert = $('#vs-verifiziert').is(':checked');
        var minBewertung = $('#vs-bewertung').val();

        // Gewählte Kategorien sammeln
        var kategorien = [];
        $('.vs-chip.aktiv').each(function() {
            var val = $(this).data('value');
            if (val !== '') kategorien.push(val);
        });

        $('#vs-liste').html('<div class="vs-loading">⏳ Automaten werden gesucht...</div>');

        if (ort !== '' && ort !== 'Mein Standort' && userLat === 0) {
            $.post(vendoramaSearch.ajaxurl, {
                action: 'vendorama_geocode',
                nonce:  vendoramaSearch.nonce,
                ort:    ort
            }, function(res) {
                if (res.success) {
                    userLat = res.data.lat;
                    userLng = res.data.lng;
                    sucheAusfuehren(kategorien, zahlung, nur24h, verifiziert, minBewertung, userLat, userLng, umkreis);
                } else {
                    $('#vs-ergebnis-info').text('Ort nicht gefunden.');
                    $('#vs-liste').html('');
                }
            });
        } else {
            sucheAusfuehren(kategorien, zahlung, nur24h, verifiziert, minBewertung, userLat, userLng, umkreis);
        }
    });

    function sterneSVG(wert, anzahl) {
        var html = '';
        for (var i = 1; i <= 5; i++) {
            html += i <= Math.round(wert)
                ? '<span style="color:#f5a623">★</span>'
                : '<span style="color:#ddd">★</span>';
        }
        html += anzahl > 0
            ? '<span class="vs-sterne-anzahl">(' + wert + ' / ' + anzahl + ' Bewertungen)</span>'
            : '<span class="vs-sterne-anzahl">(noch keine Bewertung)</span>';
        return html;
    }

    function formatiereBadges(kategorien) {
        if (!kategorien) return '';
        var arr = Array.isArray(kategorien) ? kategorien : [kategorien];
        return arr.map(function(k) {
            return '<span class="vs-karte-badge">' + (kategorieIcons[k] || '🤖') + ' ' + (kategorieLabels[k] || k) + '</span>';
        }).join('');
    }

    function formatiereZahlung(zahlung) {
        if (!zahlung) return '';
        var arr = Array.isArray(zahlung) ? zahlung : zahlung.split(',').map(function(z) { return z.trim(); });
        return arr.map(function(z) { return zahlungLabels[z] || z; }).join(', ');
    }

    function sucheAusfuehren(kategorien, zahlung, nur24h, verifiziert, minBewertung, lat, lng, umkreis) {
        var postData = {
            action:        'vendorama_suche',
            nonce:         vendoramaSearch.nonce,
            zahlung:       zahlung,
            nur_24h:       nur24h.toString(),
            verifiziert:   verifiziert.toString(),
            min_bewertung: minBewertung,
            lat:           lat,
            lng:           lng,
            umkreis:       umkreis
        };

        // Kategorien als Array übergeben
        if (kategorien.length > 0) {
            postData['kategorien[]'] = kategorien;
        }

        $.post(vendoramaSearch.ajaxurl, postData, function(res) {
            if (!res.success) {
                $('#vs-liste').html('<div class="vs-leer">Fehler bei der Suche.</div>');
                return;
            }

            var automaten = res.data;
            $('#vs-ergebnis-info').text(automaten.length + ' Automat(en) gefunden');

            if (automaten.length === 0) {
                $('#vs-liste').html('<div class="vs-leer">🤷 Keine Automaten gefunden.<br>Versuche andere Filter oder einen größeren Umkreis.</div>');
                return;
            }

            var html = '';
            $.each(automaten, function(i, a) {
                var zahlungText = formatiereZahlung(a.zahlung);
                var badges      = formatiereBadges(a.kategorie);
                var verifBadge  = a.verifiziert ? '<span class="vs-verifiziert">✅</span>' : '';
                var distanz     = a.distanz ? '<div class="vs-karte-distanz">📍 ' + a.distanz + ' km entfernt</div>' : '';
                var navLink     = 'https://www.openstreetmap.org/directions?to=' + a.lat + ',' + a.lng;
                var hauptkat    = Array.isArray(a.kategorie) ? a.kategorie[0] : (a.kategorie || 'sonstiges');
                var icon        = kategorieIcons[hauptkat] || '🤖';

                var fotoHtml = a.foto
                    ? '<img class="vs-karte-foto" src="' + a.foto + '" alt="' + a.titel + '" loading="lazy" />'
                    : '<div class="vs-karte-foto-placeholder">' + icon + '</div>';

                var mehrErfahrenBtn = (a.url && a.hat_beschreibung_lang)
                    ? '<a href="' + a.url + '" class="vs-mehr-btn">ℹ️ Mehr erfahren</a>'
                    : '';

                html += '<div class="vs-karte">';
                html += fotoHtml;
                html += '<div class="vs-karte-body">';
                html += '  <div class="vs-karte-header">';
                html += '    <div class="vs-karte-titel">' + a.titel + verifBadge + '</div>';
                html += '  </div>';
                html += '  <div class="vs-karte-badges">' + badges + '</div>';
                html += '  <div class="vs-sterne">' + sterneSVG(a.bewertung, a.bewertung_anzahl) + '</div>';
                html += '  <div class="vs-karte-info">';
                if (zahlungText) html += '<span>💳 ' + zahlungText + '</span><br>';
                if (a.oeffnung)  html += '<span>⏰ ' + a.oeffnung + '</span><br>';
                if (a.beschreibung) html += '<span>ℹ️ ' + a.beschreibung + '</span>';
                html += '  </div>';
                html += distanz;
                html += '  <div class="vs-karte-actions">';
                html += '    <a href="' + navLink + '" target="_blank" class="vs-nav-btn">🗺️ Navigation</a>';
                html += '    <button class="vs-bewerten-btn" data-id="' + a.id + '">⭐ Bewerten</button>';
                if (mehrErfahrenBtn) html += mehrErfahrenBtn;
                html += '  </div>';
                html += '</div></div>';
            });

            $('#vs-liste').html(html);
            $(document).trigger('vendorama:suchergebnisse', [automaten]);
        });
    }

    // Bewertungs-Modal
    $(document).on('click', '.vs-bewerten-btn', function() {
        $('#vs-bewertung-post-id').val($(this).data('id'));
        gewaehltesSterne = 0;
        $('.vs-stern-input').removeClass('aktiv');
        $('#vs-kommentar').val('');
        $('#vs-modal-overlay').show();
        $('#vs-modal').show();
    });

    $(document).on('mouseenter', '.vs-stern-input', function() {
        var wert = $(this).data('wert');
        $('.vs-stern-input').each(function() {
            $(this).toggleClass('aktiv', $(this).data('wert') <= wert);
        });
    });

    $(document).on('mouseleave', '#vs-sterne-input', function() {
        $('.vs-stern-input').each(function() {
            $(this).toggleClass('aktiv', $(this).data('wert') <= gewaehltesSterne);
        });
    });

    $(document).on('click', '.vs-stern-input', function() {
        gewaehltesSterne = $(this).data('wert');
        $('.vs-stern-input').each(function() {
            $(this).toggleClass('aktiv', $(this).data('wert') <= gewaehltesSterne);
        });
    });

    $('#vs-bewertung-speichern').on('click', function() {
        if (gewaehltesSterne === 0) { alert('Bitte wähle eine Anzahl Sterne aus!'); return; }
        $.post(vendoramaSearch.ajaxurl, {
            action:    'vendorama_bewertung',
            nonce:     vendoramaSearch.nonce,
            post_id:   $('#vs-bewertung-post-id').val(),
            sterne:    gewaehltesSterne,
            kommentar: $('#vs-kommentar').val()
        }, function(res) {
            if (res.success) {
                alert('✅ Danke für deine Bewertung!');
                $('#vs-modal, #vs-modal-overlay').hide();
            } else {
                alert('Fehler beim Speichern.');
            }
        });
    });

    $('#vs-modal-schliessen, #vs-modal-overlay').on('click', function() {
        $('#vs-modal, #vs-modal-overlay').hide();
    });

    $('#vs-reset').on('click', function() {
        $('#vs-ort').val('');
        $('#vs-umkreis').val('10');
        $('#vs-zahlung').val('');
        $('#vs-bewertung').val('0');
        $('#vs-24h, #vs-verifiziert').prop('checked', false);
        $('.vs-chip').removeClass('aktiv');
        $('.vs-chip input').prop('checked', false);
        $('.vs-chip[data-value=""]').addClass('aktiv').find('input').prop('checked', true);
        $('#vs-ergebnis-info').text('');
        $('#vs-liste').html('');
        userLat = 0; userLng = 0;
        $(document).trigger('vendorama:reset');
    });

    $('#vs-ort').on('keypress', function(e) {
        if (e.which === 13) $('#vs-suchen').click();
    });
});
