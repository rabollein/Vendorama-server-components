function initMap() {
    const mapsEle = document.querySelectorAll(".gspb_gmap");
    if(mapsEle.length > 0) {
        for (let i = 0; i < mapsEle.length; i++) {
            var dataKey = mapsEle[i].dataset.key;
            const mapData = window[dataKey];
            const zoomlevel = Number(mapData.zoomlevel);
            const markers = mapData.markers;
            const center_index =  Number(mapData.center_index);
            const styles = mapData.styles || '';
            const googleMap = new window.google.maps.Map(mapsEle[i], {
                zoom: zoomlevel,
                styles: styles,
            });
            //if map is loaded then load infowindow
            const infowindowPreview = new google.maps.InfoWindow({
                content: 'This is an InfoWindow'
            });
            if(googleMap){
                //init all markers
                for (let i = 0; i < markers.length; i++) {
                    const newMarker = markers[i];
                    const icon = newMarker.iconBox_icon;
                    let newTitle =  newMarker.title;
                    let newContent =  newMarker.description;
                    let newLatLng = { lat: parseFloat(newMarker.lat), lng: parseFloat(newMarker.lang) };
                    let iconUri;
                    if(newMarker.isCustomIcon){
                        if(icon.type === "image" && icon.icon.image.url !== ''){
                            iconUri =  icon.icon.image.url;
                        }
                       
                        if(icon.type === "font" && newMarker.icon !== ''){
                            iconUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(newMarker.icon);
                        }
            
                        if(icon.type === 'svg' && icon.icon.svg !== ''){
                            const iconHTML = icon.icon.svg;
                            iconUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconHTML);  
                        }
                    }
    
                    let markerOptions = {
                        position: newLatLng,
                        map: googleMap,
                        title: newTitle,
                        content: newContent,
                    };
    
                    if(iconUri !== undefined){
                        let iconSize = Number(icon.iconSize[0]);
                        const customIcon = {
                            url: iconUri,
                            scaledSize: new google.maps.Size(iconSize, iconSize),
                            origin:  new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(iconSize/2, iconSize),
                        }
                        markerOptions = { ...markerOptions, icon: customIcon };  
                    } 
                    
                    const mapMarker = new google.maps.Marker(markerOptions);

                    if(center_index == i){
                        googleMap.setCenter(newLatLng);
                    }
                    
                    mapMarker.addListener('click', function() {
                        let html = '';
                        if(newTitle !== ''){
                            html += '<h4>'+mapMarker.title+'</h4>';
                        }
                        if(newContent !== ''){
                            html += '<p>'+mapMarker.content+'</p>';
                        }
                        
                        if(html !== ''){

                            infowindowPreview.setContent(html);
                            infowindowPreview.open(googleMap, mapMarker);
                        }
                        
                    });
                }
            
            }
            
      }
    }
}

// register callback function for googlemap.
window.initMap = initMap;

// for openstreetmap load map after dom load.
window.onload = function() {
    const mapsEle = document.querySelectorAll(".gspb_osmap");
    if(mapsEle.length > 0) {
        for (let i = 0; i < mapsEle.length; i++) {
            var dataKey = mapsEle[i].dataset.key;
            const mapId = mapsEle[i].getAttribute("id");
            const mapData = window[dataKey];
            const zoomlevel = Number(mapData.zoomlevel);
            const markers = mapData.markers;
            const center_index =  Number(mapData.center_index);
            const osMap = L.map(mapId, {
                 zoom: zoomlevel
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(osMap);  
            if(osMap){
              	// //init all markers
                for (let i = 0; i < markers.length; i++) {
                    const marker = markers[i];
                    const icon = marker.iconBox_icon;
                    let newLatLng = [parseFloat(marker.lat), parseFloat(marker.lang)];
                    let newTitle =  marker.title;
                    let newContent =  marker.description;
                    let mapMarker;
                    let iconUri;
                    if(marker.isCustomIcon){
                        if(icon.type === "image" && icon.icon.image.url !== ''){
                            iconUri =  icon.icon.image.url;
                        }
                       
                        if(icon.type === "font" && marker.icon !== ''){
                            iconUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(marker.icon);
                        }
    
                        if(icon.type === 'svg' && icon.icon.svg !== ''){
                            const iconHTML = icon.icon.svg;
                            iconUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconHTML);  
                        }
                    }
                    
                    if(iconUri !== undefined){
                        let iconOptions = {
                             iconSize: [icon.iconSize[0], icon.iconSize[0]], 
                             origin: [0, 0],
                             iconAnchor: [(icon.iconSize[0]/2), icon.iconSize[0]],
                             iconUrl: iconUri
                         }; 
     
                         const customIcon = new L.Icon(iconOptions);
     
                         mapMarker = L.marker(newLatLng, {icon: customIcon}).addTo(osMap);
                    } else {
                        mapMarker = L.marker(newLatLng).addTo(osMap);
                    }
                    
                    if(center_index == i){
                        osMap.panTo(newLatLng);
                    }
                    
                    let html = '';
                    if(newTitle !== ''){
                        html += '<h4>'+newTitle+'</h4>';
                    }
                    if(newContent !== ''){
                        html += '<p>'+newContent+'</p>';
                    }
                    if(html !== ''){
                        const popup = L.popup({
                            offset: [0, -(icon.iconSize)] // set the offset to move the popup up 30 pixels
                        }).setContent(html); // set the content of the popup window
                        mapMarker.bindPopup(popup);
                    }
                    
                }  
            }
        }
    }
}