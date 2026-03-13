<?php
// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}
if (!current_user_can('manage_options')) {
    wp_die('Unauthorized user');
}
wp_enqueue_script('gsadminsettings');
?>

<div class="wp-block-greenshift-blocks-container alignfull gspb_container gspb_container-gsbp-ead11204-4841" id="gspb_container-id-gsbp-ead11204-4841">
    <div class="wp-block-greenshift-blocks-container gspb_container gspb_container-gsbp-cbc3fa8c-bb26" id="gspb_container-id-gsbp-cbc3fa8c-bb26">

        <?php $activetab = 'addons'; ?>
        <?php include(GREENSHIFT_DIR_PATH . 'templates/admin/navleft.php'); ?>


        <div class="wp-block-greenshift-blocks-container gspb_container gspb_container-gsbp-89d45563-1559" id="gspb_container-id-gsbp-89d45563-1559">
            <div class="wp-block-greenshift-blocks-container gspb_container gspb_container-gsbp-efb64efe-d083" id="gspb_container-id-gsbp-efb64efe-d083">
                <h2 id="gspb_heading-id-gsbp-ca0b0ada-6561" class="gspb_heading gspb_heading-id-gsbp-ca0b0ada-6561 "><?php esc_html_e("Your addons", 'greenshift-animation-and-page-builder-blocks'); ?></h2>
            </div>


            <div class="wp-block-greenshift-blocks-container gspb_container gspb_container-gsbp-7b4f8e8f-1a69" id="gspb_container-id-gsbp-7b4f8e8f-1a69">
                <style>
                    body #gspb_container-id-gsbp-cbc3fa8c-bb26.gspb_container {
                        max-width: 1600px !important
                    }

                    .greenshift_form .form-table {
                        margin-top: 0
                    }

                    .wp-core-ui .button-primary {
                        background-color: #2184f9
                    }

                    .wrap .fs-notice {
                        margin: 0 25px 35px 25px !important
                    }

                    .wrap .fs-plugin-title {
                        display: none !important
                    }

                    .mb30 {
                        margin-bottom: 30px
                    }

                    .gs_main_text {
                        font-size: 15px;
                        margin-bottom: 12px;
                    }

                    .gs_main_text a {
                        color: #2184f9
                    }

                    a.gs_main_btn {
                        background-color: #2184f9;
                        border: 1px solid #2184f9;
                        color: #fff;
                        padding: 10px 16px;
                        border-radius: 6px;
                        text-decoration: none;
                        text-align: center
                    }

                    a.gs_sec_btn {
                        background-color: #fff;
                        color: #111;
                        border: 1px solid #ddd;
                        padding: 10px 16px;
                        border-radius: 6px;
                        text-decoration: none;
                        text-align: center
                    }
                </style>
                <style>
                    #gspb_addons .gspb-cards-list {
                        list-style: none;
                        display: flex;
                        flex-wrap: wrap;
                        gap: 30px;
                        justify-content: flex-start;
                        margin-top: 50px
                    }

                    #gspb_addons .gspb-cards-list .gspb-card {
                        height: 152px;
                        width: 290px;
                        padding: 0;
                        font-size: 14px;
                        list-style: none;
                        border: 1px solid #ddd;
                        position: relative;
                    }

                    #gspb_addons .gspb-cards-list .gspb-card .gspb-inner {
                        background-color: #fff;
                        overflow: hidden;
                        height: 100%;
                        position: relative;
                    }

                    #gspb_addons .gspb-cards-list .gspb-card .gspb-inner>ul {
                        transition: all, 0.15s;
                        left: 0;
                        right: 0;
                        top: 0;
                        position: absolute;
                    }

                    #gspb_addons .gspb-cards-list .gspb-card .gspb-inner>ul>li {
                        list-style: none;
                        line-height: 18px;
                        padding: 0 15px;
                        width: 100%;
                        display: block;
                        box-sizing: border-box;
                    }

                    #gspb_addons .gspb-cards-list .gspb-card .gspb-inner .gspb-card-banner {
                        padding: 0;
                        margin: 0;
                        display: block;
                        height: 100px;
                        background-repeat: repeat-x;
                        background-size: 100% 100%;
                        transition: all, 0.15s;
                    }

                    .gspb-badge {
                        position: absolute;
                        top: 0;
                        right: 0;
                        background: #71ae00;
                        color: white;
                        font-size: 12px;
                        line-height: 18px;
                        text-transform: uppercase;
                        padding: 2px 6px;
                        border-radius: 3px 0 0 3px;
                        border-right: 0;
                        box-shadow: 0 2px 1px -1px rgb(0 0 0 / 30%);
                    }

                    .gspb-badge-2 {
                        position: absolute;
                        top: 30px;
                    }

                    .gspb-badge-warning {
                        background-color: #cc0000
                    }

                    #gspb_addons .gspb-cards-list .gspb-card .gspb-inner .gspb-title {
                        margin: 10px 0 0 0;
                        height: 18px;
                        overflow: hidden;
                        color: #000;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        font-weight: bold;
                    }

                    #gspb_addons .gspb-cards-list .gspb-card .gspb-inner .gspb-offer {
                        font-size: 0.9em;
                    }

                    #gspb_addons .gspb-cards-list .gspb-card .gspb-inner .gspb-description {
                        background-color: #f9f9f9;
                        padding: 10px 15px 100px 15px;
                        border-top: 1px solid #eee;
                        margin: 0 0 10px 0;
                        color: #777;
                    }

                    #gspb_addons .gspb-cards-list .gspb-card .gspb-inner .gspb-cta .button,
                    #gspb_addons .gspb-cards-list .gspb-card .gspb-inner .gspb-cta .button-group {
                        position: absolute;
                        top: 112px;
                        right: 10px;
                        min-height: 20px;
                        line-height: 30px;
                        background: #2184f9;
                    }
                    .rtl #gspb_addons .gspb-cards-list .gspb-card .gspb-inner .gspb-cta .button,
                    .rtl #gspb_addons .gspb-cards-list .gspb-card .gspb-inner .gspb-cta .button-group {
                        right: auto;
                        left: 10px;
                    }

                    @media screen and (min-width: 960px) {
                        #gspb_addons .gspb-cards-list .gspb-card:hover .gspb-inner ul {
                            top: -100px;
                        }

                        #gspb_addons .gspb-cards-list .gspb-card:hover .gspb-inner .gspb-title,
                        #gspb_addons .gspb-cards-list .gspb-card:hover .gspb-inner .gspb-offer {
                            color: #29abe1;
                        }

                        #gspb_addons .gspb-cards-list .gspb-card:hover .gspb-inner .gspb-title,
                        #gspb_addons .gspb-cards-list .gspb-card:hover .gspb-inner .gspb-offer {
                            color: #29abe1;
                        }
                    }

                    /* Extra section styling */
                    #gspb_extra .gspb-cards-list {
                        list-style: none;
                        display: flex;
                        flex-wrap: wrap;
                        gap: 30px;
                        justify-content: flex-start;
                        margin-top: 50px
                    }

                    #gspb_extra .gspb-cards-list .gspb-card {
                        height: 152px;
                        width: 290px;
                        padding: 0;
                        font-size: 14px;
                        list-style: none;
                        border: 1px solid #ddd;
                        position: relative;
                    }

                    #gspb_extra .gspb-cards-list .gspb-card .gspb-inner {
                        background-color: #fff;
                        overflow: hidden;
                        height: 100%;
                        position: relative;
                    }

                    #gspb_extra .gspb-cards-list .gspb-card .gspb-inner>ul {
                        transition: all, 0.15s;
                        left: 0;
                        right: 0;
                        top: 0;
                        position: absolute;
                    }

                    #gspb_extra .gspb-cards-list .gspb-card .gspb-inner>ul>li {
                        list-style: none;
                        line-height: 18px;
                        padding: 0 15px;
                        width: 100%;
                        display: block;
                        box-sizing: border-box;
                    }

                    #gspb_extra .gspb-cards-list .gspb-card .gspb-inner .gspb-card-banner {
                        padding: 0;
                        margin: 0;
                        display: block;
                        height: 100px;
                        background-repeat: repeat-x;
                        background-size: 100% 100%;
                        transition: all, 0.15s;
                    }

                    #gspb_extra .gspb-badge {
                        position: absolute;
                        top: 0;
                        right: 0;
                        background: #71ae00;
                        color: white;
                        font-size: 12px;
                        line-height: 18px;
                        text-transform: uppercase;
                        padding: 2px 6px;
                        border-radius: 3px 0 0 3px;
                        border-right: 0;
                        box-shadow: 0 2px 1px -1px rgb(0 0 0 / 30%);
                    }

                    #gspb_extra .gspb-badge-2 {
                        position: absolute;
                        top: 30px;
                    }

                    #gspb_extra .gspb-badge-warning {
                        background-color: #cc0000
                    }

                    #gspb_extra .gspb-cards-list .gspb-card .gspb-inner .gspb-title {
                        margin: 10px 0 0 0;
                        height: 18px;
                        overflow: hidden;
                        color: #000;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        font-weight: bold;
                    }

                    #gspb_extra .gspb-cards-list .gspb-card .gspb-inner .gspb-offer {
                        font-size: 0.9em;
                    }

                    #gspb_extra .gspb-cards-list .gspb-card .gspb-inner .gspb-description {
                        background-color: #f9f9f9;
                        padding: 10px 15px 100px 15px;
                        border-top: 1px solid #eee;
                        margin: 0 0 10px 0;
                        color: #777;
                    }

                    #gspb_extra .gspb-cards-list .gspb-card .gspb-inner .gspb-cta .button,
                    #gspb_extra .gspb-cards-list .gspb-card .gspb-inner .gspb-cta .button-group {
                        position: absolute;
                        top: 112px;
                        right: 10px;
                        min-height: 20px;
                        line-height: 30px;
                        background: #2184f9;
                    }
                    .rtl #gspb_extra .gspb-cards-list .gspb-card .gspb-inner .gspb-cta .button,
                    .rtl #gspb_extra .gspb-cards-list .gspb-card .gspb-inner .gspb-cta .button-group {
                        right: auto;
                        left: 10px;
                    }

                    @media screen and (min-width: 960px) {
                        #gspb_extra .gspb-cards-list .gspb-card:hover .gspb-inner ul {
                            top: -100px;
                        }

                        #gspb_extra .gspb-cards-list .gspb-card:hover .gspb-inner .gspb-title,
                        #gspb_extra .gspb-cards-list .gspb-card:hover .gspb-inner .gspb-offer {
                            color: #29abe1;
                        }

                        #gspb_extra .gspb-cards-list .gspb-card:hover .gspb-inner .gspb-title,
                        #gspb_extra .gspb-cards-list .gspb-card:hover .gspb-inner .gspb-offer {
                            color: #29abe1;
                        }
                    }
                </style>
                <div>
                    <?php $licenses = greenshift_edd_check_all_licenses(); ?>
                    <?php $is_allinone = false; ?>
                    <?php if (!empty($licenses['all_in_one']) && $licenses['all_in_one'] == 'valid') {
                            $is_allinone = true;
                        }
                    ?>
                    <div class="greenshift_form" id="gspb_addons">
                        <p class="gs-introtext"><?php esc_html_e("Here you can find your active addons. Each addon extends functionality of your site by additional blocks and features. You can buy them separately or as part of plans. After purchase, download zip files in your account and upload in Plugins - Add new", 'greenshift-animation-and-page-builder-blocks'); ?></p>
                        <ul class="gspb-cards-list">
                            <li class="gspb-card gspb-addon" data-slug="greenshiftgsap">
                                <div class="gspb-inner">
                                    <ul>
                                        <li class="gspb-card-banner" style="background-image: url('<?php echo esc_url(GREENSHIFT_DIR_URL . '/templates/admin/img/gsapmini.png'); ?>');">
                                            <?php $is_active = ((!empty($licenses['all_in_one']) && $licenses['all_in_one'] == 'valid') || (!empty($licenses['gsap_addon']) && $licenses['gsap_addon'] == 'valid') || (!empty($licenses['all_in_one_design']) && $licenses['all_in_one_design'] == 'valid')) ? true : false; ?>
                                            <?php if (($is_active || defined('REHUB_ADMIN_DIR'))) : ?>
                                                <span class="gspb-badge"><?php esc_html_e("License is Active", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                            <?php else : ?>
                                                <span class="gspb-badge-warning gspb-badge"><?php esc_html_e("License is not Active", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                            <?php endif; ?>
                                            <?php if (defined('GREENSHIFTGSAP_DIR_URL')) : ?>
                                                <span class="gspb-badge gspb-badge-2"><?php esc_html_e("Installed", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                            <?php else : ?>
                                                <span class="gspb-badge gspb-badge-warning gspb-badge-2"><?php esc_html_e("Not Installed", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                            <?php endif; ?>
                                        </li>
                                        <!-- <li class="gspb-tag"></li> -->
                                        <li class="gspb-title"><?php esc_html_e("Advanced Animations", 'greenshift-animation-and-page-builder-blocks'); ?></li>
                                        <li class="gspb-offer">
                                            <span class="gspb-price">$19.99</span>
                                        </li>
                                        <li class="gspb-description"><?php esc_html_e("Add motion and animations like on top awwarded sites", 'greenshift-animation-and-page-builder-blocks'); ?> <br><br>
                                            <a class="gspb-buttonbox" href="https://greenshiftwp.com/block-gallery/#animation" target="_blank" rel="noopener"><?php esc_html_e("Details and Demo", 'greenshift-animation-and-page-builder-blocks'); ?></a>
                                        </li>
                                        <?php if (($is_active || defined('REHUB_ADMIN_DIR')) && !defined('GREENSHIFTGSAP_DIR_URL')) : ?>
                                            <li class="gspb-cta"><a class="button button-primary" href="https://shop.greenshiftwp.com/update-plugin/greenshiftgsap.zip" target="_blank"><?php esc_html_e("Download", "greenshift-animation-and-page-builder-blocks"); ?></a></li>
                                        <?php elseif ($is_active && defined('GREENSHIFTGSAP_DIR_URL')) : ?>
                                            <li class="gspb-cta"></li>
                                        <?php else : ?>
                                            <li class="gspb-cta"><a class="button button-primary" href="https://shop.greenshiftwp.com/downloads/advanced-animation-addon/" target="_blank"><?php esc_html_e("Buy Now", "greenshift-animation-and-page-builder-blocks"); ?></a></li>
                                        <?php endif; ?>
                                    </ul>
                                </div>
                            </li>
                            <li class="gspb-card gspb-addon" data-slug="greenshiftquery">
                                <div class="gspb-inner">
                                    <ul>
                                        <li class="gspb-card-banner" style="background-image: url('<?php echo esc_url(GREENSHIFT_DIR_URL . '/templates/admin/img/querymini.png'); ?>');"></li>
                                        <?php $is_active = ((!empty($licenses['all_in_one']) && $licenses['all_in_one'] == 'valid') || (!empty($licenses['all_in_one_woo']) && $licenses['all_in_one_woo'] == 'valid') || (!empty($licenses['query_addon']) && $licenses['query_addon'] == 'valid') || (!empty($licenses['all_in_one_design']) && $licenses['all_in_one_design'] == 'valid') || (!empty($licenses['all_in_one_seo']) && $licenses['all_in_one_seo'] == 'valid')) ? true : false; ?>
                                        <?php if ($is_active) : ?>
                                            <span class="gspb-badge"><?php esc_html_e("License is Active", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php else : ?>
                                            <span class="gspb-badge-warning gspb-badge"><?php esc_html_e("License is not Active", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php endif; ?>
                                        <?php if (defined('GREENSHIFTQUERY_DIR_URL')) : ?>
                                            <span class="gspb-badge gspb-badge-2"><?php esc_html_e("Installed", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php else : ?>
                                            <span class="gspb-badge gspb-badge-warning gspb-badge-2"><?php esc_html_e("Not Installed", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php endif; ?>
                                        <li class="gspb-title"><?php esc_html_e("Query and Dynamic", 'greenshift-animation-and-page-builder-blocks'); ?></li>
                                        <li class="gspb-offer">
                                            <span class="gspb-price">$19.99</span>
                                        </li>
                                        <li class="gspb-description"><?php esc_html_e("Custom templates, dynamic content, listings, grid, taxonomy blocks", 'greenshift-animation-and-page-builder-blocks'); ?><br><br>
                                            <a class="gspb-buttonbox" href="https://greenshiftwp.com/block-gallery/#query" target="_blank" rel="noopener"><?php esc_html_e("Details and Demo", 'greenshift-animation-and-page-builder-blocks'); ?></a>
                                        </li>
                                        <?php if ($is_active && !defined('GREENSHIFTQUERY_DIR_URL')) : ?>
                                            <li class="gspb-cta"><a class="button button-primary" href="https://shop.greenshiftwp.com/update-plugin/greenshiftquery.zip" target="_blank"><?php esc_html_e("Download", "greenshift-animation-and-page-builder-blocks"); ?></a></li>
                                        <?php elseif ($is_active && defined('GREENSHIFTQUERY_DIR_URL')) : ?>
                                            <li class="gspb-cta"></li>
                                        <?php else : ?>
                                            <li class="gspb-cta"><a class="button button-primary" href="https://shop.greenshiftwp.com/downloads/query-addon/" rel="noopener" target="_blank"><?php esc_html_e("Buy Now", "greenshift-animation-and-page-builder-blocks"); ?></a></li>
                                        <?php endif; ?>
                                    </ul>
                                </div>
                            </li>
                            <li class="gspb-card gspb-addon" data-slug="greenshiftseo">
                                <div class="gspb-inner">
                                    <ul>
                                        <li class="gspb-card-banner" style="background-image: url('<?php echo esc_url(GREENSHIFT_DIR_URL . '/templates/admin/img/seomini.png'); ?>');"></li>
                                        <?php $is_active = (((!empty($licenses['all_in_one']) && $licenses['all_in_one'] == 'valid') || (!empty($licenses['seo_addon']) && $licenses['seo_addon'] == 'valid') || (!empty($licenses['all_in_one_seo']) && $licenses['all_in_one_seo'] == 'valid'))) ? true : false; ?>
                                        <?php if ($is_active) : ?>
                                            <span class="gspb-badge"><?php esc_html_e("License is Active", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php else : ?>
                                            <span class="gspb-badge-warning gspb-badge"><?php esc_html_e("License is not Active", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php endif; ?>
                                        <?php if (defined('GREENSHIFTSEO_DIR_URL')) : ?>
                                            <span class="gspb-badge gspb-badge-2"><?php esc_html_e("Installed", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php else : ?>
                                            <span class="gspb-badge gspb-badge-warning gspb-badge-2"><?php esc_html_e("Not Installed", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php endif; ?>
                                        <li class="gspb-title"><?php esc_html_e("Seo and Marketing Addon", 'greenshift-animation-and-page-builder-blocks'); ?></li>
                                        <li class="gspb-offer">
                                            <span class="gspb-price">$29.99</span>
                                        </li>
                                        <li class="gspb-description"><?php esc_html_e("Special mobile and seo optimized blocks which can help to earn money", 'greenshift-animation-and-page-builder-blocks'); ?><br><br>
                                            <a class="gspb-buttonbox" href="https://greenshiftwp.com/block-gallery/#seo" target="_blank" rel="noopener"><?php esc_html_e("Details and Demo", 'greenshift-animation-and-page-builder-blocks'); ?></a>
                                        </li>
                                        <?php if ($is_active && !defined('GREENSHIFTSEO_DIR_URL')) : ?>
                                            <li class="gspb-cta"><a class="button button-primary" href="https://shop.greenshiftwp.com/update-plugin/greenshiftseo.zip" target="_blank"><?php esc_html_e("Download", "greenshift-animation-and-page-builder-blocks"); ?></a></li>
                                        <?php elseif ($is_active && defined('GREENSHIFTSEO_DIR_URL')) : ?>
                                            <li class="gspb-cta"></li>
                                        <?php else : ?>
                                            <li class="gspb-cta"><a class="button button-primary" href="https://shop.greenshiftwp.com/downloads/marketing-and-seo-addon/" target="_blank"><?php esc_html_e("Buy Now", "greenshift-animation-and-page-builder-blocks"); ?></a></li>
                                        <?php endif; ?>
                                        
                                    </ul>
                                </div>
                            </li>
                            <li class="gspb-card gspb-addon" data-slug="greenshiftchart">
                                <div class="gspb-inner">
                                    <ul>
                                        <li class="gspb-card-banner" style="background-image: url('<?php echo esc_url(GREENSHIFT_DIR_URL . '/templates/admin/img/chartmini.png'); ?>');"></li>
                                        <?php $is_active = (((!empty($licenses['all_in_one']) && $licenses['all_in_one'] == 'valid') || (!empty($licenses['chart_addon']) && $licenses['chart_addon'] == 'valid'))) ? true : false; ?>

                                        <?php if ($is_active) : ?>
                                            <span class="gspb-badge"><?php esc_html_e("License is Active", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php else : ?>
                                            <span class="gspb-badge-warning gspb-badge"><?php esc_html_e("License is not Active", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php endif; ?>
                                        <?php if (defined('GSCBN_VERSION')) : ?>
                                            <span class="gspb-badge gspb-badge-2"><?php esc_html_e("Installed", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php else : ?>
                                            <span class="gspb-badge gspb-badge-warning gspb-badge-2"><?php esc_html_e("Not Installed", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php endif; ?>
                                        <li class="gspb-title"><?php esc_html_e("Chart Addon", 'greenshift-animation-and-page-builder-blocks'); ?></li>
                                        <li class="gspb-offer">
                                            <span class="gspb-price">$9.50</span>
                                        </li>
                                        <li class="gspb-description"><?php esc_html_e("Do you want to improve visual hierarchy and presentation in your content", 'greenshift-animation-and-page-builder-blocks'); ?><br><br>
                                            <a class="gspb-buttonbox" href="https://greenshiftwp.com/block-gallery/#chart" target="_blank" rel="noopener"><?php esc_html_e("Details and Demo", 'greenshift-animation-and-page-builder-blocks'); ?></a>
                                        </li>
                                        <?php if ($is_active && !defined('GSCBN_VERSION')) : ?>
                                            <li class="gspb-cta"><a class="button button-primary" href="https://shop.greenshiftwp.com/update-plugin/greenshiftchart.zip" target="_blank"><?php esc_html_e("Download", "greenshift-animation-and-page-builder-blocks"); ?></a></li>
                                        <?php elseif ($is_active && defined('GSCBN_VERSION')) : ?>
                                            <li class="gspb-cta"></li>
                                        <?php else : ?>
                                            <li class="gspb-cta"><a class="button button-primary" href="https://shop.greenshiftwp.com/downloads/greenshift-chart-plugin/" rel="noopener" target="_blank"><?php esc_html_e("Buy Now", "greenshift-animation-and-page-builder-blocks"); ?></a></li>
                                        <?php endif; ?>
                                    </ul>
                                </div>
                            </li>
                            <li class="gspb-card gspb-addon" data-slug="greenshiftwoo">
                                <div class="gspb-inner">
                                    <ul>
                                        <li class="gspb-card-banner" style="background-image: url('<?php echo esc_url(GREENSHIFT_DIR_URL . '/templates/admin/img/woomini.png'); ?>');">
                                            <?php $is_active = ((!empty($licenses['all_in_one']) && $licenses['all_in_one'] == 'valid') || (!empty($licenses['woocommerce_addon']) && $licenses['woocommerce_addon'] == 'valid') || (!empty($licenses['all_in_one_woo']) && $licenses['all_in_one_woo'] == 'valid')) ? true : false; ?>
                                            <?php if ($is_active) : ?>
                                            <span class="gspb-badge"><?php esc_html_e("License is Active", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php else : ?>
                                            <span class="gspb-badge-warning gspb-badge"><?php esc_html_e("License is not Active", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php endif; ?>
                                        <?php if (defined('GREENSHIFTWOO_DIR_URL')) : ?>
                                            <span class="gspb-badge gspb-badge-2"><?php esc_html_e("Installed", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php else : ?>
                                            <span class="gspb-badge gspb-badge-warning gspb-badge-2"><?php esc_html_e("Not Installed", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php endif; ?>
                                        </li>
                                        <!-- <li class="gspb-tag"></li> -->
                                        <li class="gspb-title"><?php esc_html_e("Woocommerce addon", 'greenshift-animation-and-page-builder-blocks'); ?></li>
                                        <li class="gspb-offer">
                                            <span class="gspb-price">$27.99</span>
                                        </li>
                                        <li class="gspb-description"><?php esc_html_e("Use Woocommerce FSE blocks to build fast eshops", 'greenshift-animation-and-page-builder-blocks'); ?> <br><br>
                                            <a class="gspb-buttonbox" href="https://greenshiftwp.com/block-gallery/#woocommerce" target="_blank" rel="noopener"><?php esc_html_e("Details and Demo", 'greenshift-animation-and-page-builder-blocks'); ?></a>
                                        </li>
                                        <?php if ($is_active && !defined('GREENSHIFTWOO_DIR_URL')) : ?>
                                            <li class="gspb-cta"><a class="button button-primary" href="https://shop.greenshiftwp.com/update-plugin/greenshiftwoo.zip" target="_blank"><?php esc_html_e("Download", "greenshift-animation-and-page-builder-blocks"); ?></a></li>
                                        <?php elseif ($is_active && defined('GREENSHIFTWOO_DIR_URL')) : ?>
                                            <li class="gspb-cta"></li>
                                        <?php else : ?>
                                            <li class="gspb-cta"><a class="button button-primary" href="https://shop.greenshiftwp.com/downloads/woocommerce-addon/" target="_blank"><?php esc_html_e("Buy Now", "greenshift-animation-and-page-builder-blocks"); ?></a></li>
                                        <?php endif; ?>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Extra Section -->
            <div class="wp-block-greenshift-blocks-container gspb_container gspb_container-gsbp-efb64efe-d083" id="gspb_container-id-gsbp-efb64efe-d083">
                <h2 id="gspb_heading-id-gsbp-extra-6561" class="gspb_heading gspb_heading-id-gsbp-extra-6561 "><?php esc_html_e("Extra", 'greenshift-animation-and-page-builder-blocks'); ?></h2>
            </div>

            <div class="wp-block-greenshift-blocks-container gspb_container gspb_container-gsbp-7b4f8e8f-1a69" id="gspb_container-id-gsbp-7b4f8e8f-1a69">
                <div class="greenshift_form" id="gspb_extra">
                    <p class="gs-introtext"><?php esc_html_e("Additional tools and converters to enhance your workflow", 'greenshift-animation-and-page-builder-blocks'); ?>These tools should be installed separately as extensions for browser. Please check documentation of each tools for details</p>
                    <ul class="gspb-cards-list">
                        <li class="gspb-card gspb-addon" data-slug="figma-converter">
                            <div class="gspb-inner">
                                <ul>
                                    <li class="gspb-card-banner" style="background-image: url('<?php echo esc_url(GREENSHIFT_DIR_URL . '/templates/admin/img/figmamini.png'); ?>');">
                                        <?php if ($is_allinone) : ?>
                                            <span class="gspb-badge"><?php esc_html_e("Available", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php else : ?>
                                            <span class="gspb-badge-warning gspb-badge"><?php esc_html_e("Upgrade Required", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php endif; ?>
                                    </li>
                                    <li class="gspb-title"><?php esc_html_e("Figma Converter", 'greenshift-animation-and-page-builder-blocks'); ?></li>
                                    <li class="gspb-offer">
                                        <span class="gspb-price"><?php esc_html_e("Extra", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                    </li>
                                    <li class="gspb-description"><?php esc_html_e("Convert your Figma designs to Greenshift WordPress blocks in one click.", 'greenshift-animation-and-page-builder-blocks'); ?> <br>
                                        <a class="gspb-buttonbox" href="https://greenshiftwp.com/figma-to-wordpress-greenshift/" target="_blank" rel="noopener"><?php esc_html_e("Documentation", 'greenshift-animation-and-page-builder-blocks'); ?></a>
                                    </li>
                                    <?php if ($is_allinone) : ?>
                                        <li class="gspb-cta"><a class="button button-primary" href="https://www.figma.com/community/plugin/1479556830076771468/figma-to-wordpress-blocks-greenshift-and-greenlight" target="_blank" rel="noopener"><?php esc_html_e("Download Tool", "greenshift-animation-and-page-builder-blocks"); ?></a></li>
                                    <?php else : ?>
                                        <li class="gspb-cta"><a class="button button-primary" href="https://shop.greenshiftwp.com/downloads/all-in-one-bundle/" target="_blank"><?php esc_html_e("Upgrade to Access", "greenshift-animation-and-page-builder-blocks"); ?></a></li>
                                    <?php endif; ?>
                                </ul>
                            </div>
                        </li>
                        <li class="gspb-card gspb-addon" data-slug="html-converter">
                            <div class="gspb-inner">
                                <ul>
                                    <li class="gspb-card-banner" style="background-image: url('<?php echo esc_url(GREENSHIFT_DIR_URL . '/templates/admin/img/htmlmini.png'); ?>');">
                                        <?php if ($is_allinone) : ?>
                                            <span class="gspb-badge"><?php esc_html_e("Available", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php else : ?>
                                            <span class="gspb-badge-warning gspb-badge"><?php esc_html_e("Upgrade Required", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                        <?php endif; ?>
                                    </li>
                                    <li class="gspb-title"><?php esc_html_e("Web page to Blocks", 'greenshift-animation-and-page-builder-blocks'); ?></li>
                                    <li class="gspb-offer">
                                        <span class="gspb-price"><?php esc_html_e("Extra", 'greenshift-animation-and-page-builder-blocks'); ?></span>
                                    </li>
                                    <li class="gspb-description"><?php esc_html_e("Convert any webpage or HTML design to Greenshift blocks.", 'greenshift-animation-and-page-builder-blocks'); ?> <br>
                                        <a class="gspb-buttonbox" href="https://greenshiftwp.com/any-webpage-to-wordpress-converter/" target="_blank" rel="noopener"><?php esc_html_e("Documentation", 'greenshift-animation-and-page-builder-blocks'); ?></a>
                                    </li>
                                    <?php if ($is_allinone) : ?>
                                        <li class="gspb-cta"><a class="button button-primary" href="https://shop.greenshiftwp.com/update-server/html-to-greenlight.zip" target="_blank" rel="noopener"><?php esc_html_e("Download Tool", "greenshift-animation-and-page-builder-blocks"); ?></a></li>
                                    <?php else : ?>
                                        <li class="gspb-cta"><a class="button button-primary" href="https://shop.greenshiftwp.com/downloads/all-in-one-bundle/" target="_blank"><?php esc_html_e("Upgrade to Access", "greenshift-animation-and-page-builder-blocks"); ?></a></li>
                                    <?php endif; ?>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>