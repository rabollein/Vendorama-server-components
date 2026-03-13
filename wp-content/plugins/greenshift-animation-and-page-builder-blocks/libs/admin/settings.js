jQuery(document).ready(function ($) {
	const $container = $('.greenshift_form__general')

	$container.on('click', '.add-new-font', function (e) {
		e.preventDefault()
		const count = parseInt($("[name=fonts_count]").val()) + 1;

		$.ajax({
			method: "POST",
			url: greenShift_params.ajaxUrl,
			data: { action: 'gspb_settings_add_font', i: count, nonce: greenShift_params.add_font_nonce },
		})
			.success(function (data) {
				$container.find('.fonts-wrap').append(data.html)
				$container.find('[name=fonts_count]').val(count)
			})
			.error(function (data) {
				// error
			});
	});

	$container.on('click', '.remove-last-font', function (e) {
		e.preventDefault()
		const count = parseInt($("[name=fonts_count]").val());

		//if (count < 2) return false;

		$container.find('.fonts-wrap .font-item').filter(':last').remove()
		$container.find('[name=fonts_count]').val(count - 1)
	});

	$container.on('click', '.remove-font', function (e) {
		e.preventDefault()
		const count = parseInt($("[name=fonts_count]").val());

		//if (count < 2) return false;

		let index = $(this).index('.remove-font');
		$container.find('.fonts-wrap .font-item').eq(index).remove()
		$container.find('[name=fonts_count]').val(count - 1)
	});

	$container.on('click', '.current-file-actions .remove-font-file', function (e) {
		e.preventDefault();
		const $this = $(this);
		const $td = $this.closest('td');
		$td.find('.current-file-hidden-input').val('');
		$td.find('.current-file').remove();
	});

	$('#delay_js_on').change(function() {
		if(this.checked) {
			$(".delay_js_optionsrow").show();
			var pageoptionvalue = $('#delay_js_page_on').val();
			if(pageoptionvalue == "includefor" || pageoptionvalue == "excludefor") {
			  $(".delay_js_pagerow").show();
			}
		} else {
			$(".delay_js_optionsrow").hide();
			$(".delay_js_pagerow").hide();
		}     
	});
  
	$('#delay_js_page_on').on('change', function() {
		if(this.value == "includefor" || this.value == "excludefor") {
			$(".delay_js_pagerow").show();
		} else {
			$(".delay_js_pagerow").hide();
		}  
	});

	// Addon installation functionality
	$(document).on('click', '.gspb-install-addon', function(e) {
		e.preventDefault();
		
		const $button = $(this);
		const $card = $button.closest('.gspb-card');
		const addonSlug = $card.data('slug');
		const downloadUrl = $button.data('download-url');
		
		// Update button state
		$button.prop('disabled', true).text('Installing...');
		
		// Install the addon
		$.ajax({
			url: greenShift_params.ajaxUrl,
			type: 'POST',
			data: {
				action: 'gspb_install_addon',
				addon_slug: addonSlug,
				download_url: downloadUrl,
				nonce: greenShift_params.install_nonce
			},
			success: function(response) {
				try {
					const data = typeof response === 'string' ? JSON.parse(response) : response;
					if (data.success) {
						$button.text('Installed').removeClass('gspb-install-addon').addClass('button-secondary');
						
						// Update badges
						$card.find('.gspb-badge-warning').removeClass('gspb-badge-warning').addClass('gspb-badge').text('Installed');
						
						// Show success message
						showNotice('success', 'Addon installed successfully!');
						
						// Reload page after 2 seconds to update interface
						setTimeout(function() {
							location.reload();
						}, 2000);
					} else {
						$button.prop('disabled', false).text('Install');
						showNotice('error', data.message || 'Installation failed');
					}
				} catch (e) {
					$button.prop('disabled', false).text('Install');
					showNotice('error', 'Installation failed');
				}
			},
			error: function() {
				$button.prop('disabled', false).text('Install');
				showNotice('error', 'Installation failed');
			}
		});
	});
	
	// Helper function to show notices
	function showNotice(type, message) {
		const noticeClass = type === 'success' ? 'notice-success' : 'notice-error';
		const notice = $('<div class="notice ' + noticeClass + ' is-dismissible"><p>' + message + '</p></div>');
		$('.wrap h1').after(notice);
		
		// Auto-dismiss after 5 seconds
		setTimeout(function() {
			notice.fadeOut();
		}, 5000);
	}
});