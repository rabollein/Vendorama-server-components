<?php
/**
 * WordPress Abilities API integration for GreenShift.
 * Requires WordPress 6.9+.
 *
 * @package greenshift-animation-and-page-builder-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Backward compatibility: skip if Abilities API is not available.
if ( ! class_exists( 'WP_Ability' ) ) {
	return;
}

/**
 * Register the GreenShift ability category.
 */
add_action( 'wp_abilities_api_categories_init', 'gspb_register_ability_category' );
function gspb_register_ability_category( $registry ) {
	wp_register_ability_category( 'greenshift', array(
		'label'       => __( 'GreenShift', 'greenshift-animation-and-page-builder-blocks' ),
		'description' => __( 'Design abilities provided by GreenShift – custom colors, element styles, classes, custom CSS, and plugin variables.', 'greenshift-animation-and-page-builder-blocks' ),
	) );
}

/**
 * Register all GreenShift abilities.
 */
add_action( 'wp_abilities_api_init', 'gspb_register_abilities' );
function gspb_register_abilities( $registry ) {

	// ── 1. Custom Colors ────────────────────────────────────────────────

	wp_register_ability( 'greenshift/get-gs-custom-colors', array(
		'label'               => __( 'Get GreenShift Custom Colors', 'greenshift-animation-and-page-builder-blocks' ),
		'description'         => __( 'Retrieves the GreenShift global custom color palette.', 'greenshift-animation-and-page-builder-blocks' ),
		'category'            => 'greenshift',
		'output_schema'       => array(
			'type'        => 'object',
			'description' => 'Key-value map of color names to color values (hex/rgb).',
		),
		'execute_callback'    => 'gspb_ability_get_gs_custom_colors',
		'permission_callback' => function () {
			return current_user_can( 'edit_posts' );
		},
		'meta'                => array(
			'show_in_rest' => true,
			'annotations'  => array(
				'readonly'   => true,
				'idempotent' => true,
			),
		),
	) );

	wp_register_ability( 'greenshift/update-gs-custom-colors', array(
		'label'               => __( 'Update GreenShift Custom Colors', 'greenshift-animation-and-page-builder-blocks' ),
		'description'         => __( 'Merges new colors into the GreenShift global custom color palette.', 'greenshift-animation-and-page-builder-blocks' ),
		'category'            => 'greenshift',
		'input_schema'        => array(
			'type'       => 'object',
			'properties' => array(
				'colors' => array(
					'type'        => 'object',
					'description' => 'Key-value map of color name to color value to set or merge.',
				),
			),
			'required'   => array( 'colors' ),
		),
		'output_schema'       => array(
			'type'        => 'object',
			'description' => 'Operation result with success flag and updated colors.',
		),
		'execute_callback'    => 'gspb_ability_update_gs_custom_colors',
		'permission_callback' => function () {
			return current_user_can( 'manage_options' );
		},
		'meta'                => array(
			'show_in_rest' => true,
			'annotations'  => array(
				'idempotent' => true,
			),
		),
	) );

	// ── 2. Element Styles ───────────────────────────────────────────────

	wp_register_ability( 'greenshift/get-element-styles', array(
		'label'               => __( 'Get Element Styles', 'greenshift-animation-and-page-builder-blocks' ),
		'description'         => __( 'Retrieves the GreenShift global element style definitions.', 'greenshift-animation-and-page-builder-blocks' ),
		'category'            => 'greenshift',
		'output_schema'       => array(
			'type'        => 'array',
			'description' => 'Array of element style definitions.',
		),
		'execute_callback'    => 'gspb_ability_get_element_styles',
		'permission_callback' => function () {
			return current_user_can( 'edit_posts' );
		},
		'meta'                => array(
			'show_in_rest' => true,
			'annotations'  => array(
				'readonly'   => true,
				'idempotent' => true,
			),
		),
	) );

	wp_register_ability( 'greenshift/update-element-styles', array(
		'label'               => __( 'Update Element Styles', 'greenshift-animation-and-page-builder-blocks' ),
		'description'         => __( 'Replaces the GreenShift global element style definitions.', 'greenshift-animation-and-page-builder-blocks' ),
		'category'            => 'greenshift',
		'input_schema'        => array(
			'type'       => 'object',
			'properties' => array(
				'elements' => array(
					'type'        => 'array',
					'description' => 'Array of element style definitions to save.',
				),
			),
			'required'   => array( 'elements' ),
		),
		'output_schema'       => array(
			'type'        => 'object',
			'description' => 'Operation result with success flag.',
		),
		'execute_callback'    => 'gspb_ability_update_element_styles',
		'permission_callback' => function () {
			return current_user_can( 'manage_options' );
		},
		'meta'                => array(
			'show_in_rest' => true,
			'annotations'  => array(
				'idempotent' => true,
			),
		),
	) );

	// ── 3. Custom Classes ───────────────────────────────────────────────

	wp_register_ability( 'greenshift/get-custom-classes', array(
		'label'               => __( 'Get Custom Classes', 'greenshift-animation-and-page-builder-blocks' ),
		'description'         => __( 'Retrieves the GreenShift global custom CSS classes.', 'greenshift-animation-and-page-builder-blocks' ),
		'category'            => 'greenshift',
		'output_schema'       => array(
			'type'        => 'array',
			'description' => 'Array of custom class definitions.',
		),
		'execute_callback'    => 'gspb_ability_get_custom_classes',
		'permission_callback' => function () {
			return current_user_can( 'edit_posts' );
		},
		'meta'                => array(
			'show_in_rest' => true,
			'annotations'  => array(
				'readonly'   => true,
				'idempotent' => true,
			),
		),
	) );

	wp_register_ability( 'greenshift/add-custom-classes', array(
		'label'               => __( 'Add Custom Classes', 'greenshift-animation-and-page-builder-blocks' ),
		'description'         => __( 'Adds or updates GreenShift global custom CSS classes.', 'greenshift-animation-and-page-builder-blocks' ),
		'category'            => 'greenshift',
		'input_schema'        => array(
			'type'       => 'object',
			'properties' => array(
				'classes' => array(
					'type'        => 'array',
					'description' => 'Array of class objects. "value" (class name) and "type" are required. Provide "css" with raw CSS rules for the class, "selectors" for sub-selector styles (e.g. hover, child elements), and "attributes" for stored block attributes.',
					'items'       => array(
						'type'       => 'object',
						'properties' => array(
							'value' => array(
								'type'        => 'string',
								'description' => 'CSS class name (e.g. "my-custom-class").',
							),
							'type' => array(
								'type'        => 'string',
								'description' => 'Class origin type: "global" (synced across site), "local" (page-scoped), "component" (reusable component), "classic" (plain className), or "custom" (framework class).',
							),
							'label' => array(
								'type'        => 'string',
								'description' => 'Human-readable label for the class (defaults to value).',
							),
							'css' => array(
								'type'        => 'string',
								'description' => 'Raw CSS rules for the class selector (e.g. "color: red; font-size: 16px;").',
							),
							'attributes' => array(
								'type'        => 'object',
								'description' => 'Stored block style attributes object for the class.',
							),
							'selectors' => array(
								'type'        => 'array',
								'description' => 'Array of sub-selector objects, each with "value" (CSS selector suffix like ":hover", " a", " .child"), "css" (rules for that selector), and optional "attributes".',
							),
						),
						'required'   => array( 'value' ),
					),
				),
			),
			'required'   => array( 'classes' ),
		),
		'output_schema'       => array(
			'type'        => 'object',
			'description' => 'Operation result with success flag.',
		),
		'execute_callback'    => 'gspb_ability_add_custom_classes',
		'permission_callback' => function () {
			return current_user_can( 'manage_options' );
		},
		'meta'                => array(
			'show_in_rest' => true,
			'annotations'  => array(
				'idempotent' => true,
			),
		),
	) );

	// ── 5. Custom CSS ───────────────────────────────────────────────────

	wp_register_ability( 'greenshift/get-custom-css', array(
		'label'               => __( 'Get Custom CSS', 'greenshift-animation-and-page-builder-blocks' ),
		'description'         => __( 'Retrieves the GreenShift global custom CSS code.', 'greenshift-animation-and-page-builder-blocks' ),
		'category'            => 'greenshift',
		'output_schema'       => array(
			'type'        => 'object',
			'description' => 'Object containing the custom_css string.',
		),
		'execute_callback'    => 'gspb_ability_get_custom_css',
		'permission_callback' => function () {
			return current_user_can( 'edit_posts' );
		},
		'meta'                => array(
			'show_in_rest' => true,
			'annotations'  => array(
				'readonly'   => true,
				'idempotent' => true,
			),
		),
	) );

	wp_register_ability( 'greenshift/update-custom-css', array(
		'label'               => __( 'Update Custom CSS', 'greenshift-animation-and-page-builder-blocks' ),
		'description'         => __( 'Updates the GreenShift global custom CSS code.', 'greenshift-animation-and-page-builder-blocks' ),
		'category'            => 'greenshift',
		'input_schema'        => array(
			'type'       => 'object',
			'properties' => array(
				'custom_css' => array(
					'type'        => 'string',
					'description' => 'Full custom CSS string to save.',
				),
			),
			'required'   => array( 'custom_css' ),
		),
		'output_schema'       => array(
			'type'        => 'object',
			'description' => 'Operation result with success flag.',
		),
		'execute_callback'    => 'gspb_ability_update_custom_css',
		'permission_callback' => function () {
			return current_user_can( 'manage_options' );
		},
		'meta'                => array(
			'show_in_rest' => true,
			'annotations'  => array(
				'idempotent' => true,
			),
		),
	) );

	// ── 6. Plugin Variables ─────────────────────────────────────────────

	wp_register_ability( 'greenshift/get-plugin-variables', array(
		'label'               => __( 'Get Plugin Variables', 'greenshift-animation-and-page-builder-blocks' ),
		'description'         => __( 'Retrieves GreenShift plugin variables used in the Stylebook Global Variables panel.', 'greenshift-animation-and-page-builder-blocks' ),
		'category'            => 'greenshift',
		'output_schema'       => array(
			'type'        => 'array',
			'description' => 'Array of variable objects (label, value, variable, variable_value, group).',
		),
		'execute_callback'    => 'gspb_ability_get_plugin_variables',
		'permission_callback' => function () {
			return current_user_can( 'edit_posts' );
		},
		'meta'                => array(
			'show_in_rest' => true,
			'annotations'  => array(
				'readonly'   => true,
				'idempotent' => true,
			),
		),
	) );

	wp_register_ability( 'greenshift/add-plugin-variables', array(
		'label'               => __( 'Add Plugin Variables', 'greenshift-animation-and-page-builder-blocks' ),
		'description'         => __( 'Adds or updates GreenShift plugin variables used in the Stylebook Global Variables panel.', 'greenshift-animation-and-page-builder-blocks' ),
		'category'            => 'greenshift',
		'input_schema'        => array(
			'type'       => 'object',
			'properties' => array(
				'variables' => array(
					'type'        => 'array',
					'description' => 'Array of variable objects. Each item should contain variable, variable_value, label, value, and group.',
					'items'       => array(
						'type'       => 'object',
						'properties' => array(
							'label' => array(
								'type'        => 'string',
								'description' => 'Variable label shown in UI.',
							),
							'value' => array(
								'type'        => 'string',
								'description' => 'Variable usage value, usually in var(--name) format.',
							),
							'variable' => array(
								'type'        => 'string',
								'description' => 'CSS variable name, e.g. --wp--preset--color--brand.',
							),
							'variable_value' => array(
								'type'        => 'string',
								'description' => 'CSS value assigned to the variable.',
							),
							'group' => array(
								'type'        => 'string',
								'description' => 'Variable group/category.',
							),
						),
						'required'   => array( 'variable', 'variable_value' ),
					),
				),
			),
			'required'   => array( 'variables' ),
		),
		'output_schema'       => array(
			'type'        => 'object',
			'description' => 'Operation result with success flag and updated variables.',
		),
		'execute_callback'    => 'gspb_ability_add_plugin_variables',
		'permission_callback' => function () {
			return current_user_can( 'manage_options' );
		},
		'meta'                => array(
			'show_in_rest' => true,
			'annotations'  => array(
				'idempotent' => true,
			),
		),
	) );
}


// =====================================================================
// Execute Callbacks
// =====================================================================

/**
 * Get GreenShift custom colors from gspb_global_settings.
 */
function gspb_ability_get_gs_custom_colors() {
	$settings = get_option( 'gspb_global_settings' );
	$colours  = ! empty( $settings['colours'] ) ? $settings['colours'] : '{}';

	if ( is_string( $colours ) ) {
		$colours = json_decode( $colours, true );
	}

	return is_array( $colours ) ? $colours : array();
}

/**
 * Update GreenShift custom colors – merges into existing palette.
 */
function gspb_ability_update_gs_custom_colors( $input ) {
	$settings = get_option( 'gspb_global_settings' );
	if ( ! is_array( $settings ) ) {
		$settings = array();
	}

	$existing = ! empty( $settings['colours'] ) ? $settings['colours'] : '{}';
	if ( is_string( $existing ) ) {
		$existing = json_decode( $existing, true );
	}
	if ( ! is_array( $existing ) ) {
		$existing = array();
	}

	foreach ( $input['colors'] as $name => $value ) {
		$existing[ sanitize_text_field( $name ) ] = sanitize_text_field( $value );
	}

	$settings['colours'] = wp_json_encode( $existing );
	update_option( 'gspb_global_settings', $settings );

	return array(
		'success' => true,
		'colors'  => $existing,
	);
}

/**
 * Get element styles from gspb_global_settings.
 */
function gspb_ability_get_element_styles() {
	$settings = get_option( 'gspb_global_settings' );
	$elements = ! empty( $settings['elements'] ) ? $settings['elements'] : '[]';

	if ( is_string( $elements ) ) {
		$elements = json_decode( $elements, true );
	}

	return is_array( $elements ) ? $elements : array();
}

/**
 * Update element styles – replaces the full list.
 */
function gspb_ability_update_element_styles( $input ) {
	$settings = get_option( 'gspb_global_settings' );
	if ( ! is_array( $settings ) ) {
		$settings = array();
	}

	$settings['elements'] = wp_json_encode( $input['elements'] );
	update_option( 'gspb_global_settings', $settings );

	return array( 'success' => true );
}


/**
 * Get custom classes.
 */
function gspb_ability_get_custom_classes() {
	$classes = get_option( 'greenshift_global_classes' );

	return is_array( $classes ) ? $classes : array();
}

/**
 * Add / update custom classes – merges by "value" key.
 */
function gspb_ability_add_custom_classes( $input ) {
	$existing = get_option( 'greenshift_global_classes' );
	if ( ! is_array( $existing ) ) {
		$existing = array();
	}

	$value_map = array();
	foreach ( $existing as $idx => $cls ) {
		if ( ! empty( $cls['value'] ) ) {
			$value_map[ $cls['value'] ] = $idx;
		}
	}

	foreach ( $input['classes'] as $cls ) {
		if ( empty( $cls['value'] ) ) {
			continue;
		}
		$cls['value'] = sanitize_text_field( $cls['value'] );

		if ( isset( $value_map[ $cls['value'] ] ) ) {
			$existing[ $value_map[ $cls['value'] ] ] = $cls;
		} else {
			$existing[]                        = $cls;
			$value_map[ $cls['value'] ]        = count( $existing ) - 1;
		}
	}

	update_option( 'greenshift_global_classes', $existing );

	return array(
		'success' => true,
		'classes' => $existing,
	);
}

/**
 * Get custom CSS.
 */
function gspb_ability_get_custom_css() {
	$settings   = get_option( 'gspb_global_settings' );
	$custom_css = ! empty( $settings['custom_css'] ) ? $settings['custom_css'] : '';

	return array( 'custom_css' => $custom_css );
}

/**
 * Update custom CSS.
 */
function gspb_ability_update_custom_css( $input ) {
	$settings = get_option( 'gspb_global_settings' );
	if ( ! is_array( $settings ) ) {
		$settings = array();
	}

	$settings['custom_css'] = $input['custom_css'];
	update_option( 'gspb_global_settings', $settings );

	return array( 'success' => true );
}

/**
 * Get plugin variables used by Stylebook Global Variables.
 */
function gspb_ability_get_plugin_variables() {
	$settings  = get_option( 'gspb_global_settings' );
	$variables = ! empty( $settings['variables'] ) ? $settings['variables'] : array();

	return is_array( $variables ) ? $variables : array();
}

/**
 * Add or update plugin variables by "variable" key.
 */
function gspb_ability_add_plugin_variables( $input ) {
	$settings = get_option( 'gspb_global_settings' );
	if ( ! is_array( $settings ) ) {
		$settings = array();
	}

	$existing = ! empty( $settings['variables'] ) && is_array( $settings['variables'] ) ? $settings['variables'] : array();
	$var_map  = array();

	foreach ( $existing as $idx => $item ) {
		if ( ! empty( $item['variable'] ) ) {
			$var_map[ $item['variable'] ] = $idx;
		}
	}

	foreach ( $input['variables'] as $item ) {
		if ( empty( $item['variable'] ) || ! isset( $item['variable_value'] ) ) {
			continue;
		}

		$normalized = array(
			'label'          => isset( $item['label'] ) ? sanitize_text_field( $item['label'] ) : '',
			'value'          => isset( $item['value'] ) ? sanitize_text_field( $item['value'] ) : '',
			'variable'       => sanitize_text_field( $item['variable'] ),
			'variable_value' => is_scalar( $item['variable_value'] ) ? sanitize_textarea_field( (string) $item['variable_value'] ) : '',
			'group'          => isset( $item['group'] ) ? sanitize_text_field( $item['group'] ) : 'custom',
		);

		if ( isset( $var_map[ $normalized['variable'] ] ) ) {
			$existing[ $var_map[ $normalized['variable'] ] ] = $normalized;
		} else {
			$existing[]                           = $normalized;
			$var_map[ $normalized['variable'] ]   = count( $existing ) - 1;
		}
	}

	$settings['variables'] = $existing;
	update_option( 'gspb_global_settings', $settings );

	return array(
		'success'   => true,
		'variables' => $existing,
	);
}
