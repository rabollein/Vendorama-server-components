<?php

namespace greenshiftaddon\Blocks;

defined('ABSPATH') or exit;


class Element
{

	public function __construct()
	{
		add_action('init', array($this, 'init_handler'));
		// Register form processing hooks for contact form
		add_action('admin_post_greenshift_form', array($this, 'process_form'));
		add_action('admin_post_nopriv_greenshift_form', array($this, 'process_form'));
	}

	/**
	 * Convert YouTube and Vimeo URLs to embed format with customizable settings
	 * 
	 * @param string $src The source URL
	 * @param array $extra_filters Additional filter options for embed parameters
	 * @return string The embed URL with applied settings
	 */
	private function embedsrc($src, $extra_filters = array()) {
		// If src already contains 'embed', return as is
		if ($src && strpos($src, 'embed') !== false) {
			return $src;
		}

		// Check if it's a YouTube link
		if ($src && (strpos($src, 'youtube.com') !== false || strpos($src, 'youtu.be') !== false)) {
			$videoId = null;
			
			// Extract video ID from different YouTube URL formats
			if (strpos($src, 'youtu.be/') !== false) {
				// Format: https://youtu.be/jyUpZ6Unpq4?si=HKt3SYuJxhefRfR0
				$parts = explode('youtu.be/', $src);
				if (isset($parts[1])) {
					$videoId = explode('?', $parts[1])[0];
				}
			} elseif (strpos($src, 'youtube.com/watch?v=') !== false) {
				// Format: https://www.youtube.com/watch?v=k4pL1i4sF7c
				$parts = explode('v=', $src);
				if (isset($parts[1])) {
					$videoId = explode('&', $parts[1])[0];
				}
			}
			
			// If we found a video ID, convert to embed format
			if ($videoId) {
				$embedUrl = 'https://www.youtube.com/embed/' . $videoId;
				$params = array();
				
				// Apply parameters based on extra_filters
				if (!empty($extra_filters['enableAutoplay'])) {
					$params[] = 'autoplay=1';
					$params[] = 'mute=1';
				}
				if (!empty($extra_filters['disableControls'])) {
					$params[] = 'controls=0';
				} else {
					$params[] = 'controls=1';
				}
				if (!empty($extra_filters['disableInformation'])) {
					$params[] = 'showinfo=0';
				}
				if (!empty($extra_filters['enableModestBranding'])) {
					$params[] = 'modestbranding=1';
				}
				if (!empty($extra_filters['enableLoop'])) {
					$params[] = 'loop=1';
				}
				
				return count($params) > 0 ? $embedUrl . '?' . implode('&', $params) : $embedUrl;
			}
		}
		
		// Check if it's a Vimeo link
		if ($src && (strpos($src, 'vimeo.com') !== false || strpos($src, 'player.vimeo.com') !== false)) {
			$videoId = null;
			
			// Extract video ID from different Vimeo URL formats
			if (strpos($src, 'vimeo.com/') !== false) {
				// Format: https://vimeo.com/123456789 or https://vimeo.com/123456789?h=abc123
				$parts = explode('vimeo.com/', $src);
				if (isset($parts[1])) {
					$videoId = explode('?', $parts[1])[0];
				}
			} elseif (strpos($src, 'player.vimeo.com/video/') !== false) {
				// Format: https://player.vimeo.com/video/123456789
				$parts = explode('player.vimeo.com/video/', $src);
				if (isset($parts[1])) {
					$videoId = explode('?', $parts[1])[0];
				}
			}
			
			// If we found a video ID, convert to embed format
			if ($videoId) {
				$embedUrl = 'https://player.vimeo.com/video/' . $videoId;
				$params = array();
				
				// Apply parameters based on extra_filters
				if (!empty($extra_filters['enableAutoplay'])) {
					$params[] = 'autoplay=1';
					$params[] = 'muted=1';
				}
				if (!empty($extra_filters['disableControls'])) {
					$params[] = 'controls=0';
				}
				if (!empty($extra_filters['enableLoop'])) {
					$params[] = 'loop=1';
				}
				
				return count($params) > 0 ? $embedUrl . '?' . implode('&', $params) : $embedUrl;
			}
		}
		
		// Return original src if not a YouTube/Vimeo link or couldn't extract ID
		return $src;
	}

	public function init_handler()
	{
		//////////////////////////////////////////////////////////////////
		// Components Supported Attributes
		//////////////////////////////////////////////////////////////////
		add_filter('block_bindings_supported_attributes_greenshift-blocks/element', function ( $supported_attributes ) {
			$supported_attributes[] = 'textContent';
			$supported_attributes[] = 'src';
			$supported_attributes[] = 'alt';
			$supported_attributes[] = 'href';
			$supported_attributes[] = 'poster';
			$supported_attributes[] = 'title';
			$supported_attributes[] = 'icon';
			$supported_attributes[] = 'className';
			return $supported_attributes;
		});

		register_block_type(
			__DIR__,
			array(
				'uses_context'    => array( 'pattern/overrides' ),
				'render_callback' => array($this, 'render_block'),
			)
		);
	}


	public function render_block($settings, $inner_content, $blockobj)
	{
		$block = (is_array($blockobj)) ? $blockobj : $blockobj->parsed_block;
		$html = $inner_content;

		if(!empty($block['attrs']['styleAttributes']['hideOnFrontend_Extra'])){
			if(!is_admin()){
				return '';
			}
		}

		if (!empty($block['attrs']['localStyles']['background']['lazy'])) {
			wp_enqueue_script('greenshift-inview-bg');
		}
		if (!empty($block['attrs']['customCursor'])) {
			wp_enqueue_script('cursor-follow');
		}
		if (!empty($block['attrs']['cursorEffect'])) {
			wp_enqueue_script('cursor-shift');
		}
		if(!empty($block['attrs']['styleAttributes']['animationTimeline'])){
			wp_enqueue_script('scroll-view-polyfill');
		}
		if(!empty($block['attrs']['styleAttributes']['anchorName'])){
			wp_enqueue_script('anchor-polyfill');
		}
		if (isset($block['attrs']['tag'])) {
			if($block['attrs']['tag'] == 'table' && (!empty($block['attrs']['tableAttributes']['table']['sortable']) || !empty($block['attrs']['tableStyles']['table']['style']))){
				wp_enqueue_script('gstablesort');
			}else if($block['attrs']['tag'] == 'iframe'){
				if(!empty($block['attrs']['src'])){
					$p = new \WP_HTML_Tag_Processor( $html );
					$p->next_tag();
					$src = greenshift_dynamic_placeholders(esc_url($block['attrs']['src']));
					if(!empty($block['attrs']['isVariation']) && ($block['attrs']['isVariation'] == 'youtubeplay' || $block['attrs']['isVariation'] == 'vimeoplay')){
						$extra_filters = !empty($block['attrs']['extra_filters']) ? $block['attrs']['extra_filters'] : array();
						$src = $this->embedsrc($src, $extra_filters);
					}
					$p->set_attribute( 'src', esc_url($src));
					$html = $p->get_updated_html();
				}
			} else if($block['attrs']['tag'] == 'a'){
				if(!empty($block['attrs']['href']) && strpos($block['attrs']['href'], '{{') !== false){
					$p = new \WP_HTML_Tag_Processor( $html );
					$p->next_tag();
					$p->set_attribute( 'href', greenshift_dynamic_placeholders(esc_attr($block['attrs']['href'])));
					$html = $p->get_updated_html();
				}
				if(!empty($block['attrs']['title']) && strpos($block['attrs']['title'], '{{') !== false){
					$p = new \WP_HTML_Tag_Processor( $html );
					$p->next_tag();
					$p->set_attribute( 'title', greenshift_dynamic_placeholders(esc_attr($block['attrs']['title'])));
					$html = $p->get_updated_html();
				}
			} else if($block['attrs']['tag'] == 'video'){
				if(!empty($block['attrs']['lazyLoadVideo'])){
					wp_enqueue_script('gs-lazyloadvideo');
				}
			} else if($block['attrs']['tag'] == 'svg'){
				if(!empty($block['attrs']['icon'])){
					$icon = $block['attrs']['icon'];
					$svg_code = '';
					
					// Get SVG code from icon attribute
					if(!empty($icon['icon']['svg'])){
						$svg_code = $icon['icon']['svg'];
					} else if(!empty($icon['svg'])){
						$svg_code = $icon['svg'];
					}
					
					if(!empty($svg_code)){
						// Extract opening <svg> tag using regex
						if(preg_match('/<svg[^>]*>/i', $svg_code, $svg_tag_match)){
							$svg_tag = $svg_tag_match[0];
							
							// List of SVG attributes to preserve
							$svg_attrs_to_preserve = array('fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-miterlimit', 'stroke-opacity', 'fill-opacity', 'fill-rule', 'clip-rule', 'opacity', 'color');
							
							$p = new \WP_HTML_Tag_Processor( $html );
							$p->next_tag();
							
							foreach($svg_attrs_to_preserve as $attr_name){
								// Match attribute with double or single quotes
								$pattern = '/' . preg_quote($attr_name, '/') . '=["\']([^"\']*)["\']/';
								if(preg_match($pattern, $svg_tag, $attr_match)){
									$p->set_attribute($attr_name, $attr_match[1]);
								}
							}
							
							$html = $p->get_updated_html();
						}
					}
				}
			} else if($block['attrs']['tag'] == 'img'){
				if(!empty($block['attrs']['src']) && strpos($block['attrs']['src'], '{{') !== false){
					$p = new \WP_HTML_Tag_Processor( $html );
					$p->next_tag();
					$p->set_attribute( 'src', esc_url(greenshift_dynamic_placeholders($block['attrs']['src'])));
					$html = $p->get_updated_html();
				}
				if(!empty($block['attrs']['alt']) && strpos($block['attrs']['alt'], '{{') !== false){
					$p = new \WP_HTML_Tag_Processor( $html );
					$p->next_tag();
					$p->set_attribute( 'alt', greenshift_dynamic_placeholders(esc_attr($block['attrs']['alt'])));
					$html = $p->get_updated_html();
				}
			}
		}

		if (!empty($block['attrs']['type']) && $block['attrs']['type'] == 'repeater') {
			//Generate dynamic repeater
			// Extract content between <repeater> tags
			$pattern = '/<repeater>(.*?)<\/repeater>/s';
			if (preg_match($pattern, $html, $matches)) {
				$repeater = $matches[1];

				if(!empty($block['attrs']['repeaterType']) && $block['attrs']['repeaterType'] == 'api_request' && !empty($block['attrs']['api_filters']) && !empty($block['attrs']['api_filters']['useAjax'])){
					$p = new \WP_HTML_Tag_Processor( $html );
					$p->next_tag();
					$blockid = 'api_id_'.\greenshift_sanitize_id_key($block['attrs']['localId']);
					$blockid = str_replace('-','_', $blockid);
					$p->set_attribute( 'data-api-id', esc_attr($blockid));
					$p->set_attribute( 'data-dynamic-api', 'true');
					$p->set_attribute( 'data-dynamic-api-trigger', !empty($block['attrs']['api_filters']['ajaxTrigger']) ? esc_attr($block['attrs']['api_filters']['ajaxTrigger']) : 'load');
					if(!empty($block['attrs']['api_filters']['ajaxTrigger']) && $block['attrs']['api_filters']['ajaxTrigger'] == 'form' && !empty($block['attrs']['api_filters']['ajaxSelector'])){
						$p->set_attribute( 'api-form-selector', esc_attr($block['attrs']['api_filters']['ajaxSelector']));
					}
					if(!empty($block['attrs']['api_filters']['apiReplace'])){
						$p->set_attribute( 'data-api-show-method', esc_attr($block['attrs']['api_filters']['apiReplace']));
					}
					if(!empty($block['attrs']['api_filters']['loader_selector'])){
						$p->set_attribute( 'data-api-loader-selector', esc_attr($block['attrs']['api_filters']['loader_selector']));
					}
					if(!empty($block['attrs']['api_filters']['pagination_selector'])){
						$p->set_attribute( 'data-api-pagination-selector', esc_attr($block['attrs']['api_filters']['pagination_selector']));
					}
					$html = $p->get_updated_html();
					set_transient($blockid, $block, 60 * 60 * 24 * 100);
					$rest_vars = array(
						'rest_url' => esc_url_raw(rest_url('greenshift/v1/api-connector/')),
						'nonce' => wp_create_nonce('wp_rest'),
					);
					wp_localize_script('gspb-apiconnector', 'gspbapi_connector_vars', $rest_vars);
					wp_enqueue_script('gspb-apiconnector');	

					// We clean because it will be generated dynamically
					$html = preg_replace($pattern, '', $html);

				} else{
					// Generate dynamic repeater content
					$generated_content = GSPB_generate_dynamic_repeater($repeater, $block);
					
					// Replace the <repeater> tags and their content with the generated content
					$html = preg_replace($pattern, $generated_content, $html);
				}
				
			} 
		}
		if(!empty($block['attrs']['isVariation'])){
			if($block['attrs']['isVariation'] == 'marquee'){
				$pattern = '/<div class="gspb_marquee_content">(.*?)<span class="gspb_marquee_content_end"><\/span><\/div>/s';
				$html = preg_replace_callback($pattern, function ($matches) {
					// Original div
					$originalDiv = '<div class="gspb_marquee_content">'.$matches[1].'</div>';
					
					// Duplicated div with aria-hidden="true"
					$duplicatedDiv = '<div class="gspb_marquee_content" aria-hidden="true">'.$matches[1].'</div>';
				
					// Return original and duplicated div
					return $originalDiv . $duplicatedDiv;
				}, $html);
			}else if($block['attrs']['isVariation'] == 'counter'){
				wp_enqueue_script('gs-lightcounter');
			}else if($block['attrs']['isVariation'] == 'countdown'){
				wp_enqueue_script('gs-lightcountdown');
			}else if($block['attrs']['isVariation'] == 'draggable'){
				wp_enqueue_script('greenshift-drag-init');
				if(!empty($block['attrs']['enableScrollButtons'])){
					wp_enqueue_script('greenShift-scrollable-init');
				}
			}else if($block['attrs']['isVariation'] == 'dropzone'){
				wp_enqueue_script(
					'gs-dropzone',
					GREENSHIFT_DIR_URL . 'libs/api/dropzone.js',
					array(),
					'1.0',
					true
				);
				// Add nonce to gspb_api script
				wp_localize_script('gs-dropzone', 'gspbDropzoneApiSettings', array(
					'nonce' => wp_create_nonce('wp_rest'),
					'rest_url' => esc_url_raw(rest_url('greenshift/v1/proxy-api/')),
				));
			}else if($block['attrs']['isVariation'] == 'navigation'){
				wp_enqueue_script('gs-menu');
				wp_enqueue_script('gs-greenpanel');
			}else if($block['attrs']['isVariation'] == 'menu_item_link'){
				// Check if current link matches the page URL
				if(!empty($block['attrs']['href'])){
					$current_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . sanitize_text_field(wp_unslash($_SERVER['HTTP_HOST'])) . esc_url_raw(wp_unslash($_SERVER['REQUEST_URI']));
					$link_url = $block['attrs']['href'];
					
					// Remove trailing slashes for comparison
					$current_url = rtrim($current_url, '/');
					$link_url = rtrim($link_url, '/');
					
					// Check if URLs match
					if($current_url === $link_url || home_url($link_url) === $current_url){
						$p = new \WP_HTML_Tag_Processor( $html );
						$p->next_tag();
						$current_class = $p->get_attribute( 'class' );
						$new_class = $current_class ? $current_class . ' current_item' : 'current_item';
						$p->set_attribute( 'class', esc_attr($new_class) );
						$p->set_attribute( 'aria-current', 'page' );
						$html = $p->get_updated_html();
					}
				}
			}else if($block['attrs']['isVariation'] == 'darkmode-switcher'){
				wp_enqueue_script('gspbcook');
				wp_enqueue_script('gs-darkmode');
			}else if($block['attrs']['isVariation'] == 'social-share-icon'){
				wp_enqueue_script(
					'gspb-social-share',
					GREENSHIFT_DIR_URL . 'libs/social-share/social.js',
					array(),
					'1.0',
					true
				);
				$p = new \WP_HTML_Tag_Processor( $html );
				$p->next_tag();
				$service = esc_attr($block['attrs']['alt']);
				$p->set_attribute( 'data-social-service', esc_attr($service));
				if($service == 'facebook'){
					global $post;
					$link = get_permalink($post->ID);
					$p->set_attribute( 'data-href', 'https://www.facebook.com/sharer/sharer.php?u=' . urlencode($link));
				}else if($service == 'twitter'){
					global $post;
					$link = get_permalink($post->ID);
					$title = $post->post_title;
					$p->set_attribute( 'data-href', 'https://twitter.com/share?url=' . urlencode($link) . '&text=' . urlencode(html_entity_decode($title, ENT_COMPAT, 'UTF-8')));
				}else if($service == 'linkedin'){
					global $post;
					$link = get_permalink($post->ID);
					$title = $post->post_title;
					$p->set_attribute( 'data-href', 'https://www.linkedin.com/shareArticle?mini=true&url=' . urlencode($link) . '&title=' . urlencode(html_entity_decode($title, ENT_COMPAT, 'UTF-8')) . '&source=' . urlencode(html_entity_decode(get_bloginfo("name"), ENT_COMPAT, 'UTF-8')));
				}else if($service == 'whatsapp'){
					global $post;
					$link = get_permalink($post->ID);
					$title = $post->post_title;
					$p->set_attribute( 'data-href', 'whatsapp://send?&text=' . urlencode(html_entity_decode($title, ENT_COMPAT, 'UTF-8')) . ' - ' . urlencode($link));
				}else if($service == 'pinterest'){
					global $post;
					$link = get_permalink($post->ID);
					$title = $post->post_title;
					$image = wp_get_attachment_url(get_post_thumbnail_id($post->ID));
					$p->set_attribute( 'data-href', 'https://pinterest.com/pin/create/button/?url=' . urlencode($link) . '&media=' . urlencode($image) . '&description=' . urlencode($title));
				}else if($service == 'telegram'){
					global $post;
					$link = get_permalink($post->ID);
					$title = $post->post_title;
					$p->set_attribute( 'data-href', 'https://t.me/share/url?url=' . urlencode($link) . '&text=' . urlencode(html_entity_decode($title, ENT_COMPAT, 'UTF-8')));
				}else if($service == 'email'){
					global $post;
					$link = get_permalink($post->ID);
					$title = $post->post_title;
					$p->set_attribute( 'data-href', 'mailto:?subject=' . rawurlencode(html_entity_decode($title, ENT_COMPAT, 'UTF-8')) . '&body=' . urlencode($link) . ' - ' . rawurlencode(html_entity_decode(get_bloginfo("name"), ENT_COMPAT, 'UTF-8')));
				}else if($service == 'bluesky'){
					global $post;
					$link = get_permalink($post->ID);
					$title = $post->post_title;
					$p->set_attribute( 'data-href', 'https://bsky.app/intent/compose?text=' . urlencode(html_entity_decode($title, ENT_COMPAT, 'UTF-8')));
				}
				
				$html = $p->get_updated_html();
			}else if($block['attrs']['isVariation'] == 'accordion' || $block['attrs']['isVariation'] == 'tabs'){

				wp_enqueue_script('gs-greensyncpanels');
	
				$p = new \WP_HTML_Tag_Processor( $html );
				$itrigger = 0;
				while ( $p->next_tag() ) {
					// Skip an element if it's not supposed to be processed.
					if ( method_exists('WP_HTML_Tag_Processor', 'has_class') && ($p->has_class( 'gs_click_sync' ) || $p->has_class( 'gs_hover_sync' )) ) {
						$p->set_attribute( 'id', 'gs-trigger-'.esc_attr($block['attrs']['id']).'-'.$itrigger);
						$p->set_attribute( 'aria-controls', 'gs-content-'.esc_attr($block['attrs']['id']).'-'.$itrigger);
						$itrigger ++;
					}
				}
				$html = $p->get_updated_html();
	
				$p = new \WP_HTML_Tag_Processor( $html );
				$icontent = 0;
				while ( $p->next_tag() ) {
					// Skip an element if it's not supposed to be processed.
					if ( method_exists('WP_HTML_Tag_Processor', 'has_class') && ($p->has_class( 'gs_content' )) ) {
						$p->set_attribute( 'id', 'gs-content-'.esc_attr($block['attrs']['id']).'-'.$icontent);
						$p->set_attribute( 'aria-labelledby', 'gs-trigger-'.esc_attr($block['attrs']['id']).'-'.$icontent);
						$icontent ++;
					}
				}
				$html = $p->get_updated_html();
			}else if($block['attrs']['isVariation'] == 'splittest'){
				$p = \WP_HTML_Processor::create_fragment( $html );
				$index_current = $p->get_current_depth();
				$index_current_tag = $index_current + 1;
				$child = $index_current + 2;
				$child_count = 0;
				$child_indices = array();
				
				// First pass: count direct child items and store their positions
				while ( $p->next_tag() ) {
					if($p->get_current_depth() == $index_current_tag){
						$p->set_bookmark('current');
					}
					if($p->get_current_depth() == $child){
						if($p->get_tag() == 'STYLE'){
							continue;
						}
						$child_indices[] = $child_count;
						$child_count++;
					}
				}
				
				// If we have child items, rotate through them on each page load
				if($child_count > 0){
					// Use a combination of block ID, current timestamp, and request count for rotation
					$block_id = !empty($block['attrs']['id']) ? $block['attrs']['id'] : 'default';
					
					// Get current timestamp (changes every second)
					$timestamp = time();
					
					// Get request count from transient (increments on each request)
					$request_count_key = 'gspb_request_count_' . $block_id;
					$request_count = get_transient($request_count_key);
					if($request_count === false) {
						$request_count = 0;
					}
					
					// Increment request count for next time
					set_transient($request_count_key, $request_count + 1, 200000); // Expires in 1 hour
					
					// Calculate rotation index
					$selected_index = ($request_count) % $child_count;
					
					// Reset to beginning and process again
					$p->seek( 'current' );
					$current_child = 0;
					
					while ( $p->next_tag() ) {
						if($p->get_current_depth() == $child){
							if($p->get_tag() == 'STYLE'){
								continue;
							}
							
							// Hide all children except the selected one
							if($current_child != $selected_index){
								$style = $p->get_attribute( 'style' );
								if(!empty($style)){
									$style .= 'display: none !important;';
								}else{
									$style = 'display: none !important;';
								}
								$p->set_attribute( 'style', $style );
							}
							
							$current_child++;
						}
					}
					
					$p->release_bookmark( 'current' );
				}
				
				$html = $p->get_updated_html();
			}else if($block['attrs']['isVariation'] == 'stylemanager'){
				if(!is_admin()){
					$html = '<!-- gs-stylemanager -->';
				}
			}else if($block['attrs']['isVariation'] == 'contactform'){
				// Add action parameter to form if not already set
					$p = new \WP_HTML_Tag_Processor( $html );
					$p->next_tag();
						$p->set_attribute( 'action', home_url().'/wp-admin/admin-post.php?action=greenshift_form' );
						$p->set_attribute( 'method', 'post' );
						$html = $p->get_updated_html();
					// Add nonce field to the form
					$nonce_field = wp_nonce_field('greenshift_form', '_wpnonce', true, false);
					// Insert nonce field at the beginning of the form
					$html = preg_replace('/(<form[^>]*>)/i', '$1' . $nonce_field, $html, 1);
					
					// Add hidden formtype field for contact form
					$formtype_field = '<input type="hidden" name="formtype" value="contact" />';
					// Insert formtype field after nonce field
					$html = preg_replace_callback('/(<input[^>]*_wpnonce[^>]*>)/i', function($matches) use ($formtype_field) {
						return $matches[0] . $formtype_field;
					}, $html, 1);
					
					// Add Cloudflare Turnstile captcha
					$global_settings = get_option('gspb_global_settings');
					$turnstile_site_key = !empty($global_settings['turnstile_site_key']) ? $global_settings['turnstile_site_key'] : '';
					$turnstile_site_key = apply_filters('greenshift_turnstile_site_key', $turnstile_site_key);
					if (!empty($turnstile_site_key)) {
						// Enqueue Turnstile script
						wp_enqueue_script('cloudflare-turnstile', GREENSHIFT_DIR_URL . 'libs/map/api.js', array(), null, true);
						
						// Add Turnstile widget before submit button
						$turnstile_widget = '<div class="cf-turnstile" data-sitekey="' . esc_attr($turnstile_site_key) . '" data-theme="auto"></div>';
						// Insert Turnstile widget before the submit button
						$html = preg_replace('/(<button[^>]*type=["\']submit["\'][^>]*>)/i', $turnstile_widget . '$1', $html, 1);
						// If no button found, insert before closing form tag
						if (strpos($html, $turnstile_widget) === false) {
							$html = preg_replace('/(<\/form>)/i', $turnstile_widget . '$1', $html, 1);
						}
					}
					// Check query strings to determine which messages to show/hide
					$show_success = isset($_GET['gs-form-success']) && $_GET['gs-form-success'] == '1';
					$show_error = isset($_GET['gs-form-error']) && $_GET['gs-form-error'] == '1';
					$show_captcha_error = isset($_GET['gs-form-captcha-error']) && $_GET['gs-form-captcha-error'] == '1';
					
					// Only hide messages that shouldn't be shown
					if (!$show_success) {
						$html = str_replace('id="gs-form-success"', 'id="gs-form-success" style="display: none;"', $html);
					}
					if (!$show_error) {
						$html = str_replace('id="gs-form-error"', 'id="gs-form-error" style="display: none;"', $html);
					}
					if (!$show_captcha_error) {
						$html = str_replace('id="gs-form-captcha-error"', 'id="gs-form-captcha-error" style="display: none;"', $html);
					}
				
			}
		}
		if(!empty($block['attrs']['enableTooltip'])){
			wp_enqueue_script('gs-lighttooltip');
		}
		if(!empty($block['attrs']['textAnimated'])){
			wp_enqueue_script('gs-textanimate');
		}
		if (function_exists('GSPB_make_dynamic_text')) {
			if(!empty($block['attrs']['dynamictext']['dynamicEnable'])){
				$content = !empty($block['attrs']['textContent']) ? $block['attrs']['textContent'] : '';
				$html = GSPB_make_dynamic_text($html, $block['attrs'], $block, $block['attrs']['dynamictext'], $content);
				
				if(!empty($block['attrs']['splitText']) || (!empty($block['attrs']['isVariation']) && $block['attrs']['isVariation'] == 'splittext')){
					//ensure to split also dynamic text
					$type = !empty($block['attrs']['splitTextType']) ? $block['attrs']['splitTextType'] : 'words';
					$html = greenshift_split_dynamic_text($html, $type);
				}
			}
			if(!empty($block['attrs']['dynamiclink']['dynamicEnable'])){
				if(isset($block['attrs']['tag']) && ($block['attrs']['tag'] == 'img' || $block['attrs']['tag'] == 'video' || $block['attrs']['tag'] == 'audio')){
					$src = !empty($block['attrs']['src']) ? $block['attrs']['src'] : '';
					$p = new \WP_HTML_Tag_Processor( $html );
					$p->next_tag();
					$value = GSPB_make_dynamic_text($src, $block['attrs'], $block, $block['attrs']['dynamiclink']);
					if($value){
						if($block['attrs']['tag'] == 'video' || $block['attrs']['tag'] == 'audio'){
							$p->next_tag();
						}
						if(!empty($block['attrs']['dynamiclink']['fallbackValue'])){
							$checklink = wp_check_filetype($value);
							if(empty($checklink['type'])){
								$value = esc_url($block['attrs']['dynamiclink']['fallbackValue']);
							}
						}
						if($block['attrs']['tag'] == 'video' && !empty($block['attrs']['lazyLoadVideo'])){
							$p->set_attribute( 'data-src', esc_url($value));
						} else {
							$p->set_attribute( 'src', esc_url($value));
						}
						
						if(!empty($block['attrs']['enableSrcSet']) && !empty($type['type']) && $type['type'] == 'image'){
							$id = attachment_url_to_postid($value);
							if($id && $id > 0){
								$size = 'full';
								if(!empty($block['attrs']['dynamiclink']['dynamicPostImageSize'])){
									$size = esc_attr($block['attrs']['dynamiclink']['dynamicPostImageSize']);
								}
								$srcset = wp_get_attachment_image_srcset($id, $size);
								if($srcset){
									$p->set_attribute( 'srcset', $srcset);
								}
							}
						}
						$html = $p->get_updated_html();
					}else{
						return '';
					}
				}else if(isset($block['attrs']['tag']) && $block['attrs']['tag'] == 'a'){
					$p = new \WP_HTML_Tag_Processor( $html );
					$p->next_tag();
					$href = !empty($block['attrs']['href']) ? $block['attrs']['href'] : '';
					$value = GSPB_make_dynamic_text($href, $block['attrs'], $block, $block['attrs']['dynamiclink'], $href);
					if($value){
						$linknew = apply_filters('greenshiftseo_url_filter', $value);
						$p->set_attribute( 'href', esc_url($linknew));
						$html = $p->get_updated_html();
					}else{
						return '';
					}
				}
			}
			if(!empty($block['attrs']['dynamicextra']['dynamicEnable'])){
				if($block['attrs']['tag'] == 'video'){
					$p = new \WP_HTML_Tag_Processor( $html );
					$p->next_tag();
					$value = GSPB_make_dynamic_text($block['attrs']['poster'], $block['attrs'], $block, $block['attrs']['dynamicextra']);
					if($value){
						$p->set_attribute( 'poster', esc_url($value));
						$html = $p->get_updated_html();
					}else{
						return '';
					}
				}
			}
		}
		if(!empty($block['attrs']['dynamicAttributes'])){
			$dynamicAttributes = [];
			foreach($block['attrs']['dynamicAttributes'] as $index=>$value){
				$dynamicAttributes[$index] = $value;
				if(!empty($value['dynamicEnable']) && function_exists('GSPB_make_dynamic_text')){
					$dynamicAttributes[$index]['value'] = GSPB_make_dynamic_text($dynamicAttributes[$index]['value'], $block['attrs'], $block, $value);
				}else{
					$sanitized_value = sanitize_text_field($value['value']);
					$dynamicAttributes[$index]['value'] = greenshift_dynamic_placeholders($sanitized_value);
					if(!empty($dynamicAttributes[$index]['name']) && stripos($dynamicAttributes[$index]['name'], 'on') === 0){
						$dynamicAttributes[$index]['value'] = '';
					}
				}
			}
			if(!empty($dynamicAttributes)){
				$p = new \WP_HTML_Tag_Processor( $html );
				$p->next_tag();
				foreach($dynamicAttributes as $index=>$value){
					$p->set_attribute( $value['name'], wp_strip_all_tags($value['value']));
				}
				$html = $p->get_updated_html();
			}
		}
		if(!empty($block['attrs']['anchor']) && strpos($block['attrs']['anchor'], '{POST_ID}') != false){
			global $post;
			$post_id = $post->ID;
			$anchor = str_replace('{POST_ID}', $post_id, $block['attrs']['anchor']);
			$p = new \WP_HTML_Tag_Processor( $html );
			$p->next_tag();
			$p->set_attribute( 'id', esc_attr($anchor));
			$html = $p->get_updated_html();
		}
		if(!empty($block['attrs']['dynamicIndexer'])){
			$p = \WP_HTML_Processor::create_fragment( $html );
			$index_current = $p->get_current_depth();
			$index_current_tag = $index_current + 1;
			$child = $index_current + 2;
			$index = 0;
			while ( $p->next_tag() ) {
				if($p->get_current_depth() == $index_current_tag){
					$p->set_bookmark('current');
				}
				if($p->get_current_depth() == $child){
					if($p->get_tag() == 'STYLE'){
						continue;
					}
					$style = $p->get_attribute( 'style' );
					if(!empty($style)){
						$style .= '--index: '.$index.';';
					}else{
						$style = '--index: '.$index.';';
					}
					$p->set_attribute( 'style', $style );
					$index++;
				}
			}

			$p->seek( 'current' );
			$style = $p->get_attribute( 'style' );
			if(!empty($style)){
				$style .= '--total-items: '.$index.';';
			}else{
				$style = '--total-items: '.$index.';';
			}
			$p->set_attribute( 'style', $style );
			$p->release_bookmark( 'current' );

			$html = $p->get_updated_html();
		}
		if(!empty($block['attrs']['styleAttributes']['cssVars_Extra'])){
			$p = new \WP_HTML_Tag_Processor( $html );
			$p->next_tag();
			$style = $p->get_attribute( 'style' );
			if(!$style){
				$style = '';
			}
			foreach($block['attrs']['styleAttributes']['cssVars_Extra'] as $index=>$value){
				$style .= $value['name'].': '.greenshift_dynamic_placeholders($value['value']).';';
			}
			$p->set_attribute( 'style', $style );
			$html = $p->get_updated_html();
		}
		if(!empty($block['attrs']['chartData']) && !empty($block['attrs']['type']) && $block['attrs']['type'] == 'chart'){
			wp_enqueue_script('gschartinit');
			if(!empty($block['attrs']['chartData']['dynamic_loading']) && !empty($block['attrs']['chartData']['csv_link'])){
				$json = $cache_time = '';
				if(!empty($block['attrs']['chartData']['cache_time'])){
					$cache_time = $block['attrs']['chartData']['cache_time'];
				}
				if($cache_time){
					$transient_name = 'gspb_chart_data_'.greenshift_sanitize_id_key($block['attrs']['localId']);
					$json = get_transient($transient_name);
				}
				if(empty($json)){
					$siteurl = site_url();
					$type = !empty($block['attrs']['chartData']['chart_type']) ? $block['attrs']['chartData']['chart_type'] : 'chart1';
					$remote = wp_safe_remote_get($siteurl.'/wp-json/greenshift/v1/get-csv-to-json?type='.$type.'&url='.$block['attrs']['chartData']['csv_link']);
					if(!is_wp_error($remote)){
						$json = wp_remote_retrieve_body($remote);
						if($cache_time){
							set_transient($transient_name, $json, $cache_time);
						}
					}
				}
				if(!empty($json)){
					$p = new \WP_HTML_Tag_Processor( $html );
					$p->next_tag();
					$p->set_attribute( 'data-extra-json', $json);
					$html = $p->get_updated_html();
				}
			}

		}
		if(!empty($block['attrs']['textContent'])){
			if(strpos($block['attrs']['textContent'], '{{') !== false){
				$html = greenshift_dynamic_placeholders($html);
			}
		}
		if(!empty($block['attrs']['interactionLayers'])){
			foreach($block['attrs']['interactionLayers'] as $layer){
				if(!empty($layer['actions'])){
					foreach($layer['actions'] as $action){
						if(!empty($action['selector'])){
							$name = $action['selector'];
							
							if(strpos($name, 'ref-') !== false){
								$id = str_replace('ref-', '', $name);
								$id = (int)$id;
								$post = get_post($id);
								if($post){
									$settings = new \GSPB_GreenShift_Settings;
									$post_content = $settings->gspb_template_shortcode_function(array('id' => $id));
									$random_id = 'gspb'.wp_generate_uuid4();
									$html = str_replace($name, '#'.$random_id, $html);
									$post_content = str_replace($name, $random_id, $post_content);
									$html = $html . $post_content;
								}
							}
						}
					}
				}
			}
		}
		if(!empty($block['attrs']['type']) && ($block['attrs']['type'] == 'rive' || $block['attrs']['type'] == 'spline' || $block['attrs']['type'] == 'lottie' || $block['attrs']['type'] == 'unicorn' || $block['attrs']['type'] == 'scrollyvideo')){

			if(!empty($block['attrs']['customCanvasControllers'])){
				$p = new \WP_HTML_Tag_Processor( $html );
				$p->next_tag();
				$data = '[';
				foreach($block['attrs']['customCanvasControllers'] as $index=>$value){
					$data .= '{"name": "'.esc_attr($value['name']).'", "value": "'.esc_attr(greenshift_dynamic_placeholders($value['value'])).'"},';
				}
				$data = rtrim($data, ',');
				$data .= ']';
				$p->set_attribute( 'data-canvas-controllers', wp_strip_all_tags($data) );
				$html = $p->get_updated_html();
			}

			if($block['attrs']['type'] == 'spline'){
				wp_enqueue_script('gspb-canvas-spline');
			}
			if($block['attrs']['type'] == 'lottie'){
				wp_enqueue_script('gspb-canvas-lottie');
			}
			if($block['attrs']['type'] == 'rive'){
				wp_enqueue_script('gspb-canvas-rive');
			}
			if($block['attrs']['type'] == 'unicorn'){
				wp_enqueue_script('gspb-canvas-unicorn');
			}
			if($block['attrs']['type'] == 'scrollyvideo'){
				wp_enqueue_script('gspb-canvas-scrollyvideo');
			}
		}

		if(!empty($block['attrs']['customJs'])){
			$global_js = get_option('gspb_block_js');
			$id = $block['attrs']['id'];
			$smart_lazy_load = !empty($block['attrs']['smartLazyLoad']) ? $block['attrs']['smartLazyLoad'] : false;

			if(!empty($global_js[$id])){
				$js = $global_js[$id];
				$js = greenshift_dynamic_placeholders($js);
				if(!empty($block['attrs']['customJsControllers'])){
					foreach($block['attrs']['customJsControllers'] as $index=>$controller){
						$js = str_replace('{{'.esc_attr($controller['name']).'}}', esc_attr(greenshift_dynamic_placeholders($controller['value'])), $js);
					}
				}
				if($smart_lazy_load){
					$random_id = 'gspbsmartjsloaded'.wp_generate_uuid4();
					$random_function = 'onGSSmartJSInteraction'.wp_generate_uuid4();
					$random_id = str_replace('-', '', $random_id);
					$random_function = str_replace('-', '', $random_function);
					add_action('wp_footer', function() use ($js, $random_id, $random_function) {
						echo '<script type="module">
							' . gsbp_script_delay($js, $random_id, $random_function) . '
						</script>';
					}, 100);
				}else{
					if(!empty($js) && strpos($js, 'import') !== false){
						add_action('wp_footer', function() use ($js) {
							echo '<script type="module">' . $js . '</script>';
						}, 100);
					} else {
						wp_enqueue_script('gspb-js-blocks');
						wp_add_inline_script('gspb-js-blocks', $js, 'after');

					}
				}
			}
		}

		//Block Binding
		$binding_name = $block['attrs']['metadata']['name'] ?? null;
		
		if(!empty($binding_name)){
			$overrides = array();
			if ( $binding_name && isset( $blockobj->context['pattern/overrides'][ $binding_name ] ) ) {
				$overrides = $blockobj->context['pattern/overrides'][ $binding_name ];
			}
			if(!empty($overrides)){
				if(!empty($overrides['textContent'])){
					$html = str_replace($block['attrs']['textContent'], esc_html($overrides['textContent']), $html);
				}
				if(!empty($overrides['src']) || !empty($overrides['alt']) || !empty($overrides['href']) || !empty($overrides['title']) || !empty($overrides['poster']) || !empty($overrides['className'])){
					$p = new \WP_HTML_Tag_Processor( $html );
					$p->next_tag();
					if(!empty($overrides['src'])){
						$p->set_attribute( 'src', esc_url($overrides['src']));
					}
					if(!empty($overrides['alt'])){
						$p->set_attribute( 'alt', esc_attr($overrides['alt']));
					}
					if(!empty($overrides['href'])){
						$p->set_attribute( 'href', esc_url($overrides['href']));
					}
					if(!empty($overrides['title'])){
						$p->set_attribute( 'title', esc_attr($overrides['title']));
					}
					if(!empty($overrides['poster'])){
						$p->set_attribute( 'poster', esc_url($overrides['poster']));
					}
					if(!empty($overrides['className'])){
						$idClass = !empty($block['attrs']['localId']) ? $block['attrs']['localId'] : '';
						$p->set_attribute( 'class', esc_attr($overrides['className']).' '.$idClass);
					}
					$html = $p->get_updated_html();
				}
				// Handle icon override for SVG elements
				if(!empty($overrides['icon']) && !empty($block['attrs']['icon'])){
					$new_icon = $overrides['icon'];
					
					// Get new SVG code
					$new_svg = '';
					if(!empty($new_icon['icon']['svg'])){
						$new_svg = $new_icon['icon']['svg'];
					} else if(!empty($new_icon['svg'])){
						$new_svg = $new_icon['svg'];
					} else if(!empty($new_icon['icon']['font'])){
						$new_svg = greenshift_render_icon_module($overrides['icon']);
					}
					
					if(!empty($new_svg)){
						// Extract attributes from old SVG in HTML
						$p = new \WP_HTML_Tag_Processor($html);
						$p->next_tag('svg');
						
						// Get all attributes from old SVG
						$old_attrs = array();
						$attr_names = $p->get_attribute_names_with_prefix('');
						if(!empty($attr_names)){
							foreach($attr_names as $attr_name){
								$old_attrs[$attr_name] = $p->get_attribute($attr_name);
							}
						}
						
						// Extract inner content from new SVG
						$new_inner = '';
						if(preg_match('/<svg[^>]*>(.*)<\/svg>/is', $new_svg, $inner_match)){
							$new_inner = $inner_match[1];
						}
						
						// Replace inner content of old SVG with new inner content
						$html = preg_replace('/(<svg[^>]*>)(.*?)(<\/svg>)/is', '$1' . $new_inner . '$3', $html);
						
						// Now apply any SVG-specific attributes from new icon (fill, stroke, etc.) while keeping old class, width, height, etc.
						$p2 = new \WP_HTML_Tag_Processor($html);
						$p2->next_tag('svg');
						
						// Get fill/stroke from new SVG if present
						if(preg_match('/<svg[^>]*>/i', $new_svg, $svg_tag_match)){
							$new_svg_tag = $svg_tag_match[0];
							$svg_style_attrs = array('fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin');
							foreach($svg_style_attrs as $attr_name){
								$pattern = '/' . preg_quote($attr_name, '/') . '=["\']([^"\']*)["\']/i';
								if(preg_match($pattern, $new_svg_tag, $attr_match)){
									$p2->set_attribute($attr_name, $attr_match[1]);
								}
							}
						}
						
						$html = $p2->get_updated_html();
					}
				}
			}
		}

		return $html;
	}

	/**
	 * Process contact form submission
	 */
	public function process_form()
	{
		// Verify nonce for security
		if (!isset($_POST['_wpnonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_wpnonce'])), 'greenshift_form')) {
			wp_die(esc_html__('Security check failed', 'greenshift-animation-and-page-builder-blocks'));
		}

		// Get form type
		$formtype = isset($_POST['formtype']) ? sanitize_text_field($_POST['formtype']) : '';

		// Process based on form type
		if ($formtype === 'contact') {
			$this->process_contact_form();
		} else {
			// Handle other form types or default behavior
			// You can add more form types here in the future
			$redirect_url = wp_get_referer();
			if (!$redirect_url) {
				$redirect_url = home_url();
			}
			wp_safe_redirect($redirect_url);
			exit;
		}
	}

	/**
	 * Process contact form submission
	 */
	private function process_contact_form()
	{

		// Verify Cloudflare Turnstile captcha
		$global_settings = get_option('gspb_global_settings');
		$turnstile_secret_key = !empty($global_settings['turnstile_secret_key']) ? $global_settings['turnstile_secret_key'] : '';
		$turnstile_secret_key = apply_filters('greenshift_turnstile_secret_key', $turnstile_secret_key);
		if (!empty($turnstile_secret_key)) {
			$turnstile_token = isset($_POST['cf-turnstile-response']) ? sanitize_text_field($_POST['cf-turnstile-response']) : '';
			
			if (empty($turnstile_token)) {
				$redirect_url = wp_get_referer();
				if (!$redirect_url) {
					$redirect_url = home_url();
				}
				$redirect_url = add_query_arg('gs-form-captcha-error', 1, $redirect_url);
				wp_safe_redirect($redirect_url);
				exit;
			}
			
			// Verify Turnstile token with Cloudflare API
			$verify_url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
			$remote_ip = isset($_SERVER['REMOTE_ADDR']) ? filter_var(wp_unslash($_SERVER['REMOTE_ADDR']), FILTER_VALIDATE_IP) : '';
			$verify_data = array(
				'secret' => $turnstile_secret_key,
				'response' => $turnstile_token,
				'remoteip' => $remote_ip ? $remote_ip : ''
			);
			
			$verify_response = wp_remote_post($verify_url, array(
				'body' => $verify_data,
				'timeout' => 10
			));
			
			if (is_wp_error($verify_response)) {
				$redirect_url = wp_get_referer();
				if (!$redirect_url) {
					$redirect_url = home_url();
				}
				$redirect_url = add_query_arg('gs-form-captcha-error', 1, $redirect_url);
				wp_safe_redirect($redirect_url);
				exit;
			}
			
			$verify_result = json_decode(wp_remote_retrieve_body($verify_response), true);
			
			if (empty($verify_result['success'])) {
				$redirect_url = wp_get_referer();
				if (!$redirect_url) {
					$redirect_url = home_url();
				}
				$redirect_url = add_query_arg('gs-form-captcha-error', 1, $redirect_url);
				wp_safe_redirect($redirect_url);
				exit;
			}
		}

		// Sanitize and validate form data
		$name = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';
		$email = isset($_POST['email']) ? sanitize_email($_POST['email']) : '';
		$message = isset($_POST['message']) ? sanitize_textarea_field($_POST['message']) : '';

		// Validation
		$errors = array();
		
		if (empty($name)) {
			$errors[] = __('Name is required', 'greenshift-animation-and-page-builder-blocks');
		}
		
		if (empty($email) || !is_email($email)) {
			$errors[] = __('Valid email is required', 'greenshift-animation-and-page-builder-blocks');
		}
		
		if (empty($message)) {
			$errors[] = __('Message is required', 'greenshift-animation-and-page-builder-blocks');
		}

		// If there are errors, redirect back with error message
		if (!empty($errors)) {
			$redirect_url = wp_get_referer();
			if (!$redirect_url) {
				$redirect_url = home_url();
			}
			$redirect_url = add_query_arg('gs-form-error', 1, $redirect_url);
			wp_safe_redirect($redirect_url);
			exit;
		}

		// Get admin email from WordPress core function and apply filter
		$to = apply_filters('greenshift_contact_form_email', get_option('admin_email'));

		// Prepare email
		/* translators: 1: Blog name */
		$subject = sprintf(__('New Contact Form Submission from %s', 'greenshift-animation-and-page-builder-blocks'), get_bloginfo('name'));
		$subject = apply_filters('greenshift_contact_form_subject', $subject);
		$email_message = sprintf("%s\n%s\n%s", $name, $email, $message);

		if(isset($POST['extra_fields']) && !empty($POST['extra_fields'])){
			$extra_fields = sanitize_text_field($_POST['extra_fields']);
			if(!empty($extra_fields)){
				$fields = explode('|', $extra_fields);
				if(!empty($fields)){
					foreach($fields as $field){
						$field = sanitize_text_field($field);
						$email_message .= sprintf("%s\n", $field);
					}
				}
			}
		}
		$email_message = apply_filters('greenshift_contact_form_message', $email_message);

		$headers = array(
			'Content-Type: text/plain; charset=UTF-8',
			'From: ' . get_bloginfo('name') . ' <' . $to . '>',
			'Reply-To: ' . $name . ' <' . $email . '>'
		);

		// Send email
		$mail_sent = wp_mail($to, $subject, $email_message, $headers);

		// Check if "contactform" post type exists and create post
		if (post_type_exists('contactform')) {
			$post_data = array(
				'post_title'    => $name,
				'post_content'  => $email_message,
				'post_status'   => 'publish',
				'post_type'     => 'contactform',
			);
			
			$post_id = wp_insert_post($post_data);
			
			// Add custom fields if post was created successfully
			if ($post_id && !is_wp_error($post_id)) {
				update_post_meta($post_id, 'email', $email);
				update_post_meta($post_id, 'name', $name);
			}
		}

		// Get redirect URL from hidden field or use referer
		$redirect_url = '';
		if (isset($_POST['thank_you_page']) && !empty($_POST['thank_you_page'])) {
			$thank_you_page = sanitize_text_field($_POST['thank_you_page']);
			// Replace {{SITE_URL}} placeholder with actual site URL
			$site_url = home_url();
			$thank_you_page = str_replace('{{SITE_URL}}', $site_url, $thank_you_page);
			$redirect_url = esc_url_raw($thank_you_page);
		}

		// If no thank you page URL or email failed, redirect back with message
		if (empty($redirect_url) || !$mail_sent) {
			$redirect_url = wp_get_referer();
			if (!$redirect_url) {
				$redirect_url = home_url();
			}
			
			if ($mail_sent) {
				$redirect_url = add_query_arg('gs-form-success', '1', $redirect_url);
			} else {
				$redirect_url = add_query_arg('gs-form-error', '1', $redirect_url);
			}
		} else {
			// Success - redirect to thank you page
			$redirect_url = add_query_arg('gs-form-success', '1', $redirect_url);
		}

		wp_safe_redirect($redirect_url);
		exit;
	}
}

new Element;