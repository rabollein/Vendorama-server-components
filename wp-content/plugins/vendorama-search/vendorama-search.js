jQuery(document).ready(function($) {

    var userLat = 0;
    var userLng = 0;
    var gewaehltesSterne = 0;

    // Kategorie-Icons
    var kategorieIcons = {
        zigaretten:    '🚬',
        suessigkeiten: '🍬',
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
        var kategorie   = $('#vs-kategorie').val();
        var zahlung     = $('#vs-zahlung').val();
        var nur24h      = $('#vs-24h').is(':checked');
        var verifiziert = $('#vs-verifiziert').is(':checked');
        var minBewertung = $('#vs-bewertung').val();

        $('#vs-liste').html('<div class="vs-loading">⏳ Automaten werden gesucht...</div>');

        if (ort !== '' && ort !== 'Mein Standort' && (userLat === 0 || $('#vs-ort').val() !== 'Mein Standort')) {
            $.post(vendoramaSearch.ajaxurl, {
                action: 'vendorama_geocode',
                nonce:  vendoramaSearch.nonce,
                ort:    ort
            }, function(res) {
                if (res.success) {
                    userLat = res.data.lat;
                    userLng = res.data.lng;
                    sucheAusfuehren(kategorie, zahlung, nur24h, verifiziert, minBewertung, userLat, userLng, umkreis);
                } else {
                    $('#vs-ergebnis-info').text('Ort nicht gefunden.');
                    $('#vs-liste').html('');
                }
            });
        } else {
            sucheAusfuehren(kategorie, zahlung, nur24h, verifiziert, minBewertung, userLat, userLng, umkreis);
        }
    });

    function sterneSVG(wert, anzahl) {
        var html = '';
        for (var i = 1; i <= 5; i++) {
            if (i <= Math.round(wert)) {
                html += '<span style="color:#f5a623">★</span>';
            } else {
                html += '<span style="color:#ddd">★</span>';
            }
        }
        if (anzahl > 0) {
            html += '<span class="vs-sterne-anzahl">(' + wert + ' / ' + anzahl + ' Bewertungen)</span>';
        } else {
            html += '<span class="vs-sterne-anzahl">(noch keine Bewertung)</span>';
        }
        return html;
    }

    function sucheAusfuehren(kategorie, zahlung, nur24h, verifiziert, minBewertung, lat, lng, umkreis) {
        $.post(vendoramaSearch.ajaxurl, {
            action:        'vendorama_suche',
            nonce:         vendoramaSearch.nonce,
            kategorie:     kategorie,
            zahlung:       zahlung,
            nur_24h:       nur24h.toString(),
            verifiziert:   verifiziert.toString(),
            min_bewertung: minBewertung,
            lat:           lat,
            lng:           lng,
            umkreis:       umkreis
        }, function(res) {
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
                var zahlung = Array.isArray(a.zahlung) ? a.zahlung.join(', ') : (a.zahlung || '');
                var icon    = kategorieIcons[a.kategorie] || '🤖';
                var verifBadge = a.verifiziert ? '<span class="vs-verifiziert">✅</span>' : '';
                var distanz = a.distanz ? '<div class="vs-karte-distanz">📍 ' + a.distanz + ' km entfernt</div>' : '';
                var navLink = 'https://www.openstreetmap.org/directions?to=' + a.lat + ',' + a.lng;

                var fotoHtml = '';
                if (a.foto) {
                    fotoHtml = '<img class="vs-karte-foto" src="' + a.foto + '" alt="' + a.titel + '" loading="lazy" />';
                } else {
                    fotoHtml = '<div class="vs-karte-foto-placeholder">' + icon + '</div>';
                }

                html += '<div class="vs-karte">';
                html += fotoHtml;
                html += '<div class="vs-karte-body">';
                html += '  <div class="vs-karte-header">';
                html += '    <div class="vs-karte-titel">' + a.titel + verifBadge + '</div>';
                html += '    <span class="vs-karte-badge">' + icon + ' ' + a.kategorie + '</span>';
                html += '  </div>';
                html += '  <div class="vs-sterne">' + sterneSVG(a.bewertung, a.bewertung_anzahl) + '</div>';
                html += '  <div class="vs-karte-info">';
                if (zahlung) html += '💳 ' + zahlung + '<br>';
                if (a.oeffnung) html += '⏰ ' + a.oeffnung + '<br>';
                if (a.beschreibung) html += '📌 ' + a.beschreibung;
                html += '  </div>';
                html += distanz;
                html += '  <div class="vs-karte-actions">';
                html += '    <a href="' + navLink + '" target="_blank" class="vs-nav-btn">🗺️ Navigation</a>';
                html += '    <button class="vs-bewerten-btn" data-id="' + a.id + '" data-titel="' + a.titel + '">⭐ Bewerten</button>';
                html += '  </div>';
                html += '</div></div>';
            });

            $('#vs-liste').html(html);
        });
    }

    // Bewertungs-Modal oeffnen
    $(document).on('click', '.vs-bewerten-btn', function() {
        var postId = $(this).data('id');
        $('#vs-bewertung-post-id').val(postId);
        gewaehltesSterne = 0;
        $('.vs-stern-input').removeClass('aktiv');
        $('#vs-kommentar').val('');
        $('#vs-modal-overlay').show();
        $('#vs-modal').show();
    });

    // Sterne auswaehlen
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

    // Bewertung speichern
    $('#vs-bewertung-speichern').on('click', function() {
        if (gewaehltesSterne === 0) {
            alert('Bitte wähle eine Anzahl Sterne aus!');
            return;
        }
        $.post(vendoramaSearch.ajaxurl, {
            action:     'vendorama_bewertung',
            nonce:      vendoramaSearch.nonce,
            post_id:    $('#vs-bewertung-post-id').val(),
            sterne:     gewaehltesSterne,
            kommentar:  $('#vs-kommentar').val()
        }, function(res) {
            if (res.success) {
                alert('✅ Danke für deine Bewertung!');
                $('#vs-modal').hide();
                $('#vs-modal-overlay').hide();
            } else {
                alert('Fehler beim Speichern.');
            }
        });
    });

    // Modal schliessen
    $('#vs-modal-schliessen, #vs-modal-overlay').on('click', function() {
        $('#vs-modal').hide();
        $('#vs-modal-overlay').hide();
    });

    // Zuruecksetzen
    $('#vs-reset').on('click', function() {
        $('#vs-ort').val('');
        $('#vs-umkreis').val('10');
        $('#vs-kategorie').val('');
        $('#vs-zahlung').val('');
        $('#vs-bewertung').val('0');
        $('#vs-24h').prop('checked', false);
        $('#vs-verifiziert').prop('checked', false);
        $('#vs-ergebnis-info').text('');
        $('#vs-liste').html('');
        userLat = 0; userLng = 0;
    });

    // Enter-Taste
    $('#vs-ort').on('keypress', function(e) {
        if (e.which === 13) $('#vs-suchen').click();
    });
});
