(function($) {
    'use strict';

    var map, markerLayer = [];
    var aktiveKategorie = null;

    var kategorieConfig = {
        zigaretten:     { icon: '🚬', farbe: '#c0392b', label: 'Zigaretten' },
        suessigkeiten:  { icon: '🍬', farbe: '#e91e8c', label: 'Süßigkeiten' },
        getraenke:      { icon: '🥤', farbe: '#2980b9', label: 'Getränke' },
        frischprodukte: { icon: '🥚', farbe: '#f39c12', label: 'Frischprodukte' },
        backwaren:      { icon: '🥐', farbe: '#d35400', label: 'Backwaren' },
        eis:            { icon: '🍦', farbe: '#74b9ff', label: 'Eis' },
        blumen:         { icon: '🌸', farbe: '#8e44ad', label: 'Blumen' },
        pakete:         { icon: '📦', farbe: '#16a085', label: 'Pakete' },
        geldautomat:    { icon: '💶', farbe: '#27ae60', label: 'Geldautomat' },
        tankautomat:    { icon: '⛽', farbe: '#2c3e50', label: 'Tankautomat' },
        fahrrad:        { icon: '🚲', farbe: '#1A6B3C', label: 'Fahrrad' },
        sonstiges:      { icon: '🤖', farbe: '#7f8c8d', label: 'Sonstiges' }
        eis:            { icon: '🍦', farbe: '#74b9ff', label: 'Eis' },
        cbd:            { icon: '🌿', farbe: '#27ae60', label: 'CBD' },
        verhuetung:     { icon: '💊', farbe: '#e84393', label: 'Verhütung' },
        sex_toys:       { icon: '🔞', farbe: '#8e44ad', label: 'Sex-Toys' },
        kaffee_zubehoer: { icon: '☕', farbe: '#6F4E37', label: 'Kaffeeautomaten Zubehör' },
        kaffeebohnen:   { icon: '🫘', farbe: '#4a2c0a', label: 'Kaffeebohnen' },
        sonstiges:      { icon: '🤖', farbe: '#7f8c8d', label: 'Sonstiges' }

    };

    function sterneSVG(wert) {
        var html = '';
        for (var i = 1; i <= 5; i++) {
            html += i <= Math.round(wert) ? '★' : '☆';
        }
        return html;
    }

    function erstelleMarkerIcon(kategorie) {
        var cfg = kategorieConfig[kategorie] || { icon: '🤖', farbe: '#7f8c8d' };
        return L.divIcon({
            className: '',
            html: '<div class="vm-marker vm-cat-' + kategorie + '"><div class="vm-marker-inner">' + cfg.icon + '</div></div>',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -38]
        });
    }

    function erstellePopupHTML(a, distanz) {
        var cfg = kategorieConfig[a.kategorie] || { icon: '🤖', label: a.kategorie };
        var fotoHTML = a.foto
            ? '<img class="vm-popup-foto" src="' + a.foto + '" alt="' + a.titel + '" />'
            : '<div class="vm-popup-placeholder">' + cfg.icon + '</div>';

        var sterne = a.bewertung > 0
            ? '<div class="vm-popup-sterne">' + sterneSVG(a.bewertung) + ' <small>(' + a.bewertung + ')</small></div>'
            : '<div class="vm-popup-sterne" style="color:#ccc">☆☆☆☆☆ <small>(keine Bewertung)</small></div>';

        var verifiziert = a.verifiziert ? ' ✅' : '';
        var distanzHTML = distanz ? '<div class="vm-popup-distanz">📍 ' + distanz + ' km entfernt</div>' : '';
        var navLink = 'https://www.openstreetmap.org/directions?to=' + a.lat + ',' + a.lng;

        return '<div class="vm-hover-popup-content">'
            + fotoHTML
            + '<div class="vm-popup-body">'
            + '<div class="vm-popup-badge">' + cfg.icon + ' ' + cfg.label + '</div>'
            + '<div class="vm-popup-titel">' + a.titel + verifiziert + '</div>'
            + sterne
            + '<div class="vm-popup-info">'
            + (a.zahlung ? '💳 ' + a.zahlung + '<br>' : '')
            + (a.oeffnung ? '⏰ ' + a.oeffnung + '<br>' : '')
            + (a.beschreibung ? '📌 ' + a.beschreibung : '')
            + '</div>'
            + distanzHTML
            + '</div>'
            + '<a href="' + navLink + '" target="_blank" class="vm-popup-nav">🗺️ Navigation öffnen</a>'
            + '</div>';
    }

    function markerHinzufuegen(automaten, userLat, userLng) {
        // Alte Marker entfernen
        markerLayer.forEach(function(m) { map.removeLayer(m); });
        markerLayer = [];

        if (!automaten || automaten.length === 0) return;

        var bounds = [];

        automaten.forEach(function(a) {
            if (!a.lat || !a.lng) return;
            if (aktiveKategorie && a.kategorie !== aktiveKategorie) return;

            var distanz = null;
            if (userLat && userLng) {
                distanz = berechneDistanz(userLat, userLng, a.lat, a.lng);
            }

            var marker = L.marker([a.lat, a.lng], {
                icon: erstelleMarkerIcon(a.kategorie)
            });

            var popupHTML = erstellePopupHTML(a, distanz ? distanz.toFixed(1) : null);

            // Hover Popup
            var popup = L.popup({
                className: 'vm-hover-popup',
                closeButton: false,
                autoPan: false,
                maxWidth: 260
            }).setContent(popupHTML);

            marker.on('mouseover', function(e) {
                this.openPopup();
            });

            marker.on('mouseout', function(e) {
                this.closePopup();
            });

            // Klick öffnet Navigation
            marker.on('click', function() {
                var navLink = 'https://www.openstreetmap.org/directions?to=' + a.lat + ',' + a.lng;
                window.open(navLink, '_blank');
            });

            marker.bindPopup(popup);
            marker.addTo(map);
            markerLayer.push(marker);
            bounds.push([a.lat, a.lng]);
        });

        // Karte auf Marker zoomen
        if (bounds.length > 0) {
            if (bounds.length === 1) {
                map.setView(bounds[0], 15);
            } else {
                map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
            }
        }
    }

    function berechneDistanz(lat1, lng1, lat2, lng2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2)
              + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
              * Math.sin(dLng/2) * Math.sin(dLng/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    function erstelleLegende() {
        var kategorienVorhanden = {};
        vendoramaMapData.automaten.forEach(function(a) {
            if (a.kategorie) kategorienVorhanden[a.kategorie] = true;
        });

        var html = '';
        Object.keys(kategorienVorhanden).forEach(function(kat) {
            var cfg = kategorieConfig[kat] || { icon: '🤖', farbe: '#999', label: kat };
            html += '<div class="vm-legende-item" data-kategorie="' + kat + '">'
                  + '<div class="vm-legende-dot" style="background:' + cfg.farbe + '"></div>'
                  + cfg.icon + ' ' + cfg.label
                  + '</div>';
        });

        if (html) {
            $('#vendorama-leaflet-map').after('<div id="vm-legende"><strong>Filter:</strong> ' + html + '</div>');
        }

        // Legende Klick-Filter
        $(document).on('click', '.vm-legende-item', function() {
            var kat = $(this).data('kategorie');
            if (aktiveKategorie === kat) {
                aktiveKategorie = null;
                $('.vm-legende-item').removeClass('aktiv');
            } else {
                aktiveKategorie = kat;
                $('.vm-legende-item').removeClass('aktiv');
                $(this).addClass('aktiv');
            }
            markerHinzufuegen(vendoramaMapData.automaten, 0, 0);
        });
    }

    // Karte initialisieren
    $(document).ready(function() {
        if ($('#vendorama-leaflet-map').length === 0) return;

        map = L.map('vendorama-leaflet-map', {
            center: [51.1657, 10.4515],
            zoom: 6,
            zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(map);

        // Alle Marker laden
        markerHinzufuegen(vendoramaMapData.automaten, 0, 0);

        // Legende erstellen
        erstelleLegende();

        // Event: Suchergebnisse von vendorama-search empfangen
        $(document).on('vendorama:suchergebnisse', function(e, daten) {
            markerHinzufuegen(daten.automaten, daten.userLat, daten.userLng);
        });

        // Event: Suche zurueckgesetzt
        $(document).on('vendorama:reset', function() {
            aktiveKategorie = null;
            $('.vm-legende-item').removeClass('aktiv');
            markerHinzufuegen(vendoramaMapData.automaten, 0, 0);
        });
    });

})(jQuery);
